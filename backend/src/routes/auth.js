const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { PrismaClient } = require("@prisma/client");
const validate = require("../middleware/validate");
const { loginSchema, registerSchema } = require("../utils/validators");
const { auth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { processUploadedFiles } = require("../middleware/upload");
const logger = require("../utils/logger");
const { sendWelcome, sendVerificationEmail, sendPasswordReset } = require("../services/email");

const router = express.Router();
const prisma = new PrismaClient();

function generateTokens(user, activeRole) {
  const accessToken = jwt.sign(
    { id: user.id, role: activeRole, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
  const refreshToken = uuidv4();
  return { accessToken, refreshToken };
}

// ═══════ LOGIN ═══════
router.post("/login", validate(loginSchema), async (req, res) => {
  try {
    const { email, password, role } = req.validated;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "البريد غير مسجل" });
    if (!user.isActive) return res.status(403).json({ error: "الحساب معطل — تواصل مع الإدارة" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "كلمة المرور غير صحيحة" });

    // Check email verification (only if REAL email service is configured — not placeholders)
    const smtpUser = process.env.SMTP_USER || "";
    const smtpPass = process.env.SMTP_PASS || "";
    const emailServiceReady = smtpUser && smtpPass &&
      !smtpUser.includes("your-email") && !smtpPass.includes("your-password");
    if (!user.emailVerified && emailServiceReady) {
      return res.status(403).json({ error: "يرجى تأكيد بريدك الإلكتروني أولاً — تحقق من صندوق الوارد", needsVerification: true, email });
    }

    const roles = user.roles ? user.roles.split(",") : [user.role];
    if (role && !roles.includes(role)) {
      return res.status(403).json({ error: "ليس لديك صلاحية لهذا الدور" });
    }
    const activeRole = role || roles[0];

    const { accessToken, refreshToken } = generateTokens(user, activeRole);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    logger.info("User logged in", { userId: user.id, role: activeRole });

    res.json({
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        id: user.id, nameAr: user.nameAr, nameEn: user.nameEn, email: user.email,
        role: activeRole, roles: roles, accountType: user.accountType, companyNameAr: user.companyNameAr,
        companyLogo: user.companyLogo,
        specialty: user.specialty, rating: user.rating, totalProjects: user.totalProjects,
        phone: user.phone, crNumber: user.crNumber, bioAr: user.bioAr,
        profileImage: user.profileImage, isAdmin: user.isAdmin
      }
    });
  } catch (e) {
    logger.error("Login error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ REGISTER ═══════
router.post("/register", validate(registerSchema), async (req, res) => {
  try {
    const { nameAr, email, password, role, accountType, companyNameAr, specialty, phone } = req.validated;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "هذا البريد مسجل مسبقاً — سجّل الدخول أو استخدم بريداً آخر" });

    const passwordHash = await bcrypt.hash(password, 12);
    const verifyToken = uuidv4();
    const _su = process.env.SMTP_USER || "";
    const _sp = process.env.SMTP_PASS || "";
    const emailServiceEnabled = !!(
      _su && _sp && !_su.includes("your-email") && !_sp.includes("your-password")
    );

    const user = await prisma.user.create({
      data: {
        nameAr, email, passwordHash, role, roles: role,
        accountType, companyNameAr, specialty, phone,
        // If no email service → auto-verify; if email service → require verification
        emailVerified: !emailServiceEnabled,
        verifyToken: emailServiceEnabled ? verifyToken : null,
        verifyExpiry: emailServiceEnabled ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null
      }
    });

    // Create wallet for owners and developers
    if (role === "owner" || role === "developer") {
      await prisma.wallet.create({ data: { userId: user.id } });
    }

    logger.info("New user registered", { userId: user.id, role });

    if (emailServiceEnabled) {
      sendVerificationEmail(email, nameAr, verifyToken).catch(() => {});
      res.status(201).json({
        success: true,
        message: "تم إنشاء الحساب — يرجى تفقد بريدك الإلكتروني وتأكيد حسابك",
        needsVerification: true
      });
    } else {
      sendWelcome(email, nameAr).catch(() => {});
      res.status(201).json({ success: true, message: "تم إنشاء الحساب بنجاح — يمكنك تسجيل الدخول الآن" });
    }
  } catch (e) {
    logger.error("Register error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ VERIFY EMAIL ═══════
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "رمز التحقق مفقود" });

    const user = await prisma.user.findFirst({
      where: { verifyToken: token, verifyExpiry: { gt: new Date() } }
    });
    if (!user) return res.status(400).json({ error: "رمز التحقق غير صحيح أو منتهي الصلاحية" });

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verifyToken: null, verifyExpiry: null }
    });

    sendWelcome(user.email, user.nameAr).catch(() => {});
    logger.info("Email verified", { userId: user.id });
    res.json({ success: true, message: "تم تأكيد بريدك الإلكتروني بنجاح — يمكنك تسجيل الدخول الآن" });
  } catch (e) {
    logger.error("Verify email error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ RESEND VERIFICATION ═══════
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "البريد مطلوب" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "البريد غير مسجل" });
    if (user.emailVerified) return res.status(400).json({ error: "البريد مؤكد مسبقاً" });

    const verifyToken = uuidv4();
    await prisma.user.update({
      where: { id: user.id },
      data: { verifyToken, verifyExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) }
    });

    sendVerificationEmail(email, user.nameAr, verifyToken).catch(() => {});
    res.json({ success: true, message: "تم إرسال رابط التحقق مجدداً — تحقق من بريدك" });
  } catch (e) {
    logger.error("Resend verification error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ SEND OTP (Phone Verification) ═══════
router.post("/send-otp", async (req, res) => {
  try {
    const { phone, userId } = req.body;
    if (!phone) return res.status(400).json({ error: "رقم الهاتف مطلوب" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 دقائق

    // Find user by userId or phone
    let user;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else {
      user = await prisma.user.findFirst({ where: { phone } });
    }
    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: otp, otpExpiry: expiry }
    });

    // Send SMS via Twilio (if configured)
    const twilioSid = process.env.TWILIO_ACCOUNT_SID || "";
    const twilioToken = process.env.TWILIO_AUTH_TOKEN || "";
    const twilioPhone = process.env.TWILIO_PHONE || "";
    const twilioEnabled = !!(twilioSid && twilioToken && twilioPhone &&
      !twilioSid.includes("your-") && !twilioToken.includes("your-"));

    if (twilioEnabled) {
      try {
        const twilio = require("twilio")(twilioSid, twilioToken);
        await twilio.messages.create({
          body: `رمز التحقق FIRST TOUCH: ${otp}\nصالح لمدة 10 دقائق. لا تشاركه مع أحد.`,
          from: twilioPhone,
          to: phone
        });
        logger.info("OTP sent via Twilio", { userId: user.id, phone });
      } catch (smsErr) {
        logger.error("Twilio SMS error", { error: smsErr.message });
        // Don't fail — return OTP in dev mode
      }
    }

    res.json({
      success: true,
      message: "تم إرسال رمز التحقق",
      userId: user.id,
      // In dev mode (no Twilio), show OTP in response
      ...(twilioEnabled ? {} : { devOtp: otp, devNote: "⚠️ وضع التطوير — الرمز يظهر هنا فقط" })
    });
  } catch (e) {
    logger.error("Send OTP error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ VERIFY OTP ═══════
router.post("/verify-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) return res.status(400).json({ error: "بيانات ناقصة" });

    const user = await prisma.user.findFirst({
      where: {
        id: Number(userId),
        otpCode: otp,
        otpExpiry: { gt: new Date() }
      }
    });

    if (!user) return res.status(400).json({ error: "رمز التحقق غير صحيح أو انتهت صلاحيته" });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerified: true,
        emailVerified: true,
        otpCode: null,
        otpExpiry: null
      }
    });

    // Generate login tokens directly
    const { accessToken, refreshToken } = generateTokens(user, user.role);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    sendWelcome(user.email, user.nameAr).catch(() => {});
    logger.info("Phone OTP verified — user logged in", { userId: user.id });

    res.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        nameAr: user.nameAr,
        role: user.role,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        rating: user.rating,
        totalProjects: user.totalProjects
      }
    });
  } catch (e) {
    logger.error("Verify OTP error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ FORGOT PASSWORD ═══════
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "البريد مطلوب" });

    const user = await prisma.user.findUnique({ where: { email } });
    // Always respond success (security — don't reveal if email exists)
    if (!user) return res.json({ success: true, message: "إذا كان البريد مسجلاً، ستصلك رسالة خلال دقائق" });

    const resetToken = uuidv4();
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetExpiry: new Date(Date.now() + 60 * 60 * 1000) }
    });

    sendPasswordReset(email, user.nameAr, resetToken).catch(() => {});
    logger.info("Password reset requested", { userId: user.id });
    res.json({ success: true, message: "تم إرسال رابط إعادة تعيين كلمة المرور — تحقق من بريدك" });
  } catch (e) {
    logger.error("Forgot password error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ RESET PASSWORD ═══════
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: "البيانات ناقصة" });
    if (password.length < 6) return res.status(400).json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });

    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetExpiry: { gt: new Date() } }
    });
    if (!user) return res.status(400).json({ error: "رمز إعادة التعيين غير صحيح أو منتهي الصلاحية" });

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetExpiry: null }
    });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    logger.info("Password reset successful", { userId: user.id });
    res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح — يمكنك تسجيل الدخول الآن" });
  } catch (e) {
    logger.error("Reset password error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ REFRESH TOKEN ═══════
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "Refresh token required" });

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } });
      return res.status(401).json({ error: "انتهت صلاحية الجلسة — يرجى إعادة تسجيل الدخول" });
    }

    const user = await prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user) return res.status(401).json({ error: "المستخدم غير موجود" });

    const roles = user.roles ? user.roles.split(",") : [user.role];
    const { accessToken, refreshToken: newRefresh } = generateTokens(user, roles[0]);

    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { token: newRefresh, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({ token: accessToken, refreshToken: newRefresh });
  } catch (e) {
    logger.error("Refresh token error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ LOGOUT ═══════
router.post("/logout", auth, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    res.json({ success: true });
  } catch (e) {
    res.json({ success: true });
  }
});

// ═══════ CHANGE PASSWORD (authenticated) ═══════
router.post("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: "البيانات ناقصة" });
    if (newPassword.length < 6) return res.status(400).json({ error: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "كلمة المرور الحالية غير صحيحة" });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });

    logger.info("Password changed", { userId: req.user.id });
    res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
  } catch (e) {
    logger.error("Change password error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ UPDATE PROFILE ═══════
router.put("/profile", auth, async (req, res) => {
  try {
    const { nameAr, phone, companyNameAr, specialty, bioAr, crNumber } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(nameAr && { nameAr }),
        ...(phone !== undefined && { phone }),
        ...(companyNameAr !== undefined && { companyNameAr }),
        ...(specialty !== undefined && { specialty }),
        ...(bioAr !== undefined && { bioAr }),
        ...(crNumber !== undefined && { crNumber })
      }
    });
    res.json({
      success: true,
      user: {
        id: updated.id, nameAr: updated.nameAr, email: updated.email,
        phone: updated.phone, companyNameAr: updated.companyNameAr,
        specialty: updated.specialty, bioAr: updated.bioAr, crNumber: updated.crNumber
      }
    });
  } catch (e) {
    logger.error("Update profile error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ UPLOAD COMPANY LOGO ═══════
router.post("/company-logo", auth, upload.single("logo"), processUploadedFiles, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "يرجى رفع صورة اللوجو" });

    const logoUrl = req.file.fileUrl || req.file.cloudinaryUrl || ("uploads/" + req.file.filename);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { companyLogo: logoUrl }
    });

    res.json({ success: true, companyLogo: logoUrl, message: "تم رفع لوجو الشركة بنجاح" });
  } catch (e) {
    logger.error("Company logo upload error", { error: e.message });
    res.status(500).json({ error: "خطأ في رفع اللوجو" });
  }
});

module.exports = router;
