const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

let transporter = null;

function initEmail() {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    // Auto-detect Outlook vs Gmail vs custom SMTP
    const user = process.env.SMTP_USER || "";
    const isOutlook = user.includes("outlook.com") || user.includes("hotmail.com") || user.includes("live.com");
    const isGmail = user.includes("gmail.com");

    let config;
    if (isOutlook) {
      config = {
        host: "smtp-mail.outlook.com",
        port: 587,
        secure: false,
        auth: { user, pass: process.env.SMTP_PASS },
        tls: { ciphers: "SSLv3" }
      };
    } else if (isGmail) {
      config = {
        service: "gmail",
        auth: { user, pass: process.env.SMTP_PASS }
      };
    } else {
      config = {
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: { user, pass: process.env.SMTP_PASS }
      };
    }

    transporter = nodemailer.createTransport(config);
    logger.info("Email service initialized", { provider: isOutlook ? "Outlook" : isGmail ? "Gmail" : "Custom" });
  } else {
    logger.info("Email service not configured — set SMTP_USER and SMTP_PASS in .env");
  }
}

// Platform config from env
const PLATFORM_NAME = process.env.PLATFORM_NAME || "FIRST TOUCH";
const PLATFORM_EMAIL = process.env.PLATFORM_EMAIL || "support@firsttouch.bh";
const PLATFORM_CURRENCY = process.env.PLATFORM_CURRENCY || "د.ب";

async function sendEmail(to, subject, html) {
  if (!transporter) {
    logger.debug("Email skipped (not configured)", { to, subject });
    return false;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `${PLATFORM_NAME} <noreply@firsttouch.bh>`,
      to: to,
      subject: subject,
      html: html
    });
    logger.info("Email sent", { to, subject });
    return true;
  } catch (e) {
    logger.error("Email failed", { to, subject, error: e.message });
    return false;
  }
}

// ═══════ TEMPLATES ═══════

function emailBase(content) {
  return `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:600px;margin:0 auto;background:#F4F7FB;">
    <div style="background:linear-gradient(135deg,#0B1D33,#1A6FB5);padding:24px;border-radius:12px 12px 0 0;text-align:center;">
      <div style="font-size:32px;margin-bottom:4px;">🐋</div>
      <div style="font-size:20px;font-weight:900;color:#fff;">FIRST <span style="color:#E8720C;">TOUCH</span></div>
      <div style="font-size:10px;color:rgba(255,255,255,.5);margin-top:2px;">Securing Your Build</div>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;">${content}</div>
    <div style="text-align:center;padding:12px;font-size:10px;color:#8896A8;">
      🐋 ${PLATFORM_NAME} | ${PLATFORM_EMAIL}
    </div>
  </div>`;
}

async function sendWelcome(email, nameAr) {
  return sendEmail(email, `🐋 مرحباً في ${PLATFORM_NAME}`,
    emailBase(`<h2 style="color:#0B1D33;margin-bottom:8px;">مرحباً ${nameAr} 👋</h2>
      <p style="color:#4A5B73;font-size:13px;">تم إنشاء حسابك بنجاح في منصة <strong>${PLATFORM_NAME}</strong> لإدارة المشاريع الإنشائية.</p>
      <div style="background:rgba(26,111,181,.06);border-radius:8px;padding:12px;margin-top:16px;font-size:12px;color:#4A5B73;">
        يمكنك الآن تسجيل الدخول والبدء باستخدام المنصة.
      </div>`)
  );
}

// ═══════ EMAIL VERIFICATION ═══════
async function sendVerificationEmail(email, nameAr, token) {
  const link = `${process.env.FRONTEND_URL || "http://localhost:5173"}?verify=${token}`;
  return sendEmail(email, `✅ تحقق من بريدك — ${PLATFORM_NAME}`,
    emailBase(`<h2 style="color:#0B1D33;margin-bottom:8px;">مرحباً ${nameAr} 👋</h2>
      <p style="color:#4A5B73;font-size:13px;">شكراً لتسجيلك في <strong>${PLATFORM_NAME}</strong>. يرجى تأكيد عنوان بريدك الإلكتروني بالضغط على الزر أدناه:</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${link}" style="background:#0EAD69;color:#fff;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;display:inline-block;">✅ تأكيد البريد الإلكتروني</a>
      </div>
      <div style="background:#F4F7FB;border-radius:8px;padding:12px;font-size:11px;color:#8896A8;">
        ⚠️ هذا الرابط صالح لمدة 24 ساعة فقط. إذا لم تقم بالتسجيل، يرجى تجاهل هذا الإيميل.
      </div>
      <div style="margin-top:12px;font-size:10px;color:#8896A8;word-break:break-all;">أو انسخ هذا الرابط: ${link}</div>`)
  );
}

// ═══════ PASSWORD RESET ═══════
async function sendPasswordReset(email, nameAr, token) {
  const link = `${process.env.FRONTEND_URL || "http://localhost:5173"}?reset=${token}`;
  return sendEmail(email, `🔑 إعادة تعيين كلمة المرور — ${PLATFORM_NAME}`,
    emailBase(`<h2 style="color:#0B1D33;margin-bottom:8px;">إعادة تعيين كلمة المرور</h2>
      <p style="color:#4A5B73;font-size:13px;">مرحباً ${nameAr}، تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${link}" style="background:#E8720C;color:#fff;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;display:inline-block;">🔑 إعادة تعيين كلمة المرور</a>
      </div>
      <div style="background:#FFF3E0;border:1px solid #E8720C;border-radius:8px;padding:12px;font-size:11px;color:#E8720C;">
        ⚠️ هذا الرابط صالح لمدة ساعة واحدة فقط. إذا لم تطلب إعادة التعيين، تجاهل هذا الإيميل ولن يتغير حسابك.
      </div>`)
  );
}

async function sendPaymentNotification(email, nameAr, amount, itemName) {
  return sendEmail(email, "تم صرف مستحقات — FIRST TOUCH",
    `<div dir="rtl" style="font-family:Tahoma;padding:20px">
      <h2>💰 إشعار دفع</h2>
      <p>تم صرف <strong>${amount.toLocaleString()} د.ب</strong> لبند: ${itemName}</p>
    </div>`
  );
}

// ═══════ NEW PROJECT NOTIFICATION EMAIL ═══════
async function sendNewProjectNotification(email, recipientName, projectData) {
  const { title, location, type, area, budget, ownerName, ownerConditions, description } = projectData;
  const typeLabels = { villa: "فيلا", apartment: "شقة", commercial: "تجاري", residential: "سكني" };
  const typeLabel = typeLabels[type] || type;

  return sendEmail(email, `🏗️ مشروع جديد متاح — ${title} | FIRST TOUCH`,
    `<div dir="rtl" style="font-family:Tahoma, Arial, sans-serif; max-width:600px; margin:0 auto; background:#F4F7FB;">
      <!-- Header -->
      <div style="background:linear-gradient(135deg, #0B1D33 0%, #1A6FB5 100%); padding:28px 24px; border-radius:12px 12px 0 0; text-align:center;">
        <div style="font-size:36px; margin-bottom:6px;">🐋</div>
        <div style="font-family:Arial; font-size:22px; font-weight:900; color:#fff;">FIRST <span style="color:#E8720C;">TOUCH</span></div>
        <div style="font-size:11px; color:rgba(255,255,255,.5); margin-top:4px;">Securing Your Build</div>
      </div>

      <!-- Alert Banner -->
      <div style="background:#E8720C; padding:14px 24px; text-align:center;">
        <div style="font-size:14px; font-weight:700; color:#fff;">⚡ مشروع جديد متاح — قدّم عرضك الآن</div>
      </div>

      <!-- Content -->
      <div style="background:#fff; padding:24px; border-radius:0 0 12px 12px;">
        <div style="font-size:18px; font-weight:900; color:#0B1D33; margin-bottom:4px;">مرحباً ${recipientName}</div>
        <div style="font-size:12px; color:#8896A8; margin-bottom:20px;">تم نشر مشروع جديد على منصة FIRST TOUCH ويتاح لك تقديم عرض سعر</div>

        <!-- Project Card -->
        <div style="border:2px solid #E4E9F1; border-radius:12px; overflow:hidden; margin-bottom:20px;">
          <div style="background:linear-gradient(135deg, #1A6FB5 0%, #5DADE2 100%); padding:16px 20px;">
            <div style="font-size:20px; font-weight:900; color:#fff;">🏗️ ${title}</div>
            <div style="font-size:12px; color:rgba(255,255,255,.7); margin-top:4px;">بقلم: ${ownerName}</div>
          </div>
          <div style="padding:16px 20px;">
            <table style="width:100%; font-size:12px; color:#4A5B73; border-collapse:collapse;">
              ${location ? `<tr><td style="padding:5px 0; font-weight:700;">📍 الموقع:</td><td style="padding:5px 0;">${location}</td></tr>` : ""}
              <tr><td style="padding:5px 0; font-weight:700;">🏠 النوع:</td><td style="padding:5px 0;">${typeLabel}</td></tr>
              ${area ? `<tr><td style="padding:5px 0; font-weight:700;">📐 المساحة:</td><td style="padding:5px 0;">${area} م²</td></tr>` : ""}
              ${budget > 0 ? `<tr><td style="padding:5px 0; font-weight:700;">💰 الميزانية التقديرية:</td><td style="padding:5px 0; font-weight:900; color:#E8720C;">${Number(budget).toLocaleString()} د.ب</td></tr>` : ""}
            </table>
            ${description ? `<div style="margin-top:12px; padding:10px 12px; background:#F4F7FB; border-radius:8px; font-size:11px; color:#4A5B73;">${description}</div>` : ""}
          </div>
        </div>

        <!-- Owner Conditions -->
        ${ownerConditions ? `
        <div style="border:1.5px solid #E8720C; border-radius:10px; padding:16px; margin-bottom:20px; background:rgba(232,114,12,.04);">
          <div style="font-size:13px; font-weight:800; color:#E8720C; margin-bottom:8px;">📋 شروط المالك</div>
          <div style="font-size:11px; color:#4A5B73; white-space:pre-wrap;">${ownerConditions}</div>
        </div>` : ""}

        <!-- Platform Conditions -->
        <div style="border:1.5px solid #1A6FB5; border-radius:10px; padding:16px; margin-bottom:20px; background:rgba(26,111,181,.04);">
          <div style="font-size:13px; font-weight:800; color:#1A6FB5; margin-bottom:8px;">🔒 شروط منصة FIRST TOUCH</div>
          <ul style="font-size:11px; color:#4A5B73; margin:0; padding-right:16px; line-height:1.8;">
            <li>يجب توثيق جميع مراحل التنفيذ بالصور والفيديو</li>
            <li>المدفوعات تتم عبر المحفظة الضامنة للمنصة فقط</li>
            <li>كل بند يحتاج اعتماد المفتش ثم موافقة المالك قبل الصرف</li>
            <li>في حال الرفض يجب ذكر السبب الواضح والتوثيق المرئي</li>
            <li>الالتزام بجدول الكميات (BOQ) المقدم عند التعاقد</li>
            <li>يحق للمالك رفض أي بند لا يستوفي المواصفات المتفق عليها</li>
          </ul>
        </div>

        <!-- CTA -->
        <div style="text-align:center; margin-top:20px;">
          <div style="font-size:11px; color:#8896A8; margin-bottom:10px;">سجّل دخولك إلى التطبيق لتقديم عرض BOQ متكامل</div>
          <div style="display:inline-block; background:linear-gradient(135deg, #E8720C, #F5A623); color:#fff; padding:12px 28px; border-radius:10px; font-size:13px; font-weight:700;">💰 تقديم عرض سعر الآن</div>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align:center; padding:16px; font-size:10px; color:#8896A8;">
        <div>🐋 ${PLATFORM_NAME} — Securing Your Build</div>
        <div style="margin-top:2px;">لإلغاء الاشتراك في الإشعارات راسلنا على ${PLATFORM_EMAIL}</div>
      </div>
    </div>`
  );
}

// ═══════ CONTRACT EMAIL (sent to all parties on quotation acceptance) ═══════
async function sendContractEmail(email, recipientName, recipientRole, contractData) {
  const {
    projectTitle, projectType, projectLocation, projectArea, projectFloors,
    ownerName, ownerEmail, contractorName, contractorCompany, contractorEmail,
    totalPrice, durationMonths, warrantyMonths, boqItems,
    ownerConditions, platformConditions, projectDescription, contractDate
  } = contractData;

  const roleLabels = { owner: "صاحب المشروع", contractor: "المقاول", inspector: "مفتش الجودة" };
  const typeLabels = { villa: "فيلا", apartment: "شقة", commercial: "تجاري", residential: "سكني" };
  const roleLabel = roleLabels[recipientRole] || recipientRole;
  const typeLabel = typeLabels[projectType] || projectType;
  const dateStr = contractDate || new Date().toLocaleDateString("ar-BH", { year: "numeric", month: "long", day: "numeric" });

  const boqRows = (boqItems || []).map((item, i) => {
    const total = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
    return `<tr style="border-top:1px solid #E4E9F1;">
      <td style="padding:7px 10px; font-size:11px; color:#0B1D33;">${i + 1}</td>
      <td style="padding:7px 10px; font-size:11px; color:#0B1D33;">${item.stage || "—"}</td>
      <td style="padding:7px 10px; font-size:11px; color:#0B1D33;">${item.description || "—"}</td>
      <td style="padding:7px 10px; font-size:11px; color:#4A5B73;">${item.unit || "—"}</td>
      <td style="padding:7px 10px; font-size:11px; color:#4A5B73; text-align:center;">${item.quantity || "—"}</td>
      <td style="padding:7px 10px; font-size:11px; color:#E8720C; font-weight:700;">${Number(item.unit_price || 0).toLocaleString()}</td>
      <td style="padding:7px 10px; font-size:11px; color:#4A5B73;">${item.brand || "—"}</td>
      <td style="padding:7px 10px; font-size:11px; color:#0EAD69; font-weight:700;">${total.toLocaleString()}</td>
    </tr>`;
  }).join("");

  return sendEmail(email, `📄 عقد مشروع معتمد — ${projectTitle} | FIRST TOUCH`,
    `<div dir="rtl" style="font-family:Tahoma, Arial, sans-serif; max-width:700px; margin:0 auto; background:#F4F7FB;">

      <!-- Header -->
      <div style="background:linear-gradient(135deg, #0B1D33 0%, #163A5F 100%); padding:28px 24px; border-radius:12px 12px 0 0; text-align:center;">
        <div style="font-size:36px; margin-bottom:6px;">🐋</div>
        <div style="font-family:Arial; font-size:22px; font-weight:900; color:#fff;">FIRST <span style="color:#E8720C;">TOUCH</span></div>
        <div style="font-size:11px; color:rgba(255,255,255,.5); margin-top:2px;">Securing Your Build</div>
      </div>

      <!-- Contract Badge -->
      <div style="background:linear-gradient(135deg, #0EAD69 0%, #2ECC71 100%); padding:14px 24px; text-align:center;">
        <div style="font-size:15px; font-weight:700; color:#fff;">✅ عقد معتمد ورسمي — نسخة ${roleLabel}</div>
        <div style="font-size:10px; color:rgba(255,255,255,.7); margin-top:2px;">بتاريخ ${dateStr}</div>
      </div>

      <div style="background:#fff; padding:24px 28px; border-radius:0 0 12px 12px;">

        <div style="font-size:17px; font-weight:900; color:#0B1D33; margin-bottom:4px;">مرحباً ${recipientName}</div>
        <div style="font-size:12px; color:#8896A8; margin-bottom:24px;">
          يسعدنا إبلاغكم بأن العقد التالي قد تم اعتماده رسمياً على منصة FIRST TOUCH.
          يُرجى الاحتفاظ بهذا الإيميل كنسخة رسمية من العقد.
        </div>

        <!-- ═══ PROJECT INFO ═══ -->
        <div style="background:linear-gradient(135deg, #1A6FB5 0%, #5DADE2 100%); border-radius:12px; padding:18px 20px; margin-bottom:20px;">
          <div style="font-size:18px; font-weight:900; color:#fff; margin-bottom:8px;">🏗️ ${projectTitle}</div>
          <div style="display:flex; flex-wrap:wrap; gap:12px;">
            ${projectType ? `<span style="background:rgba(255,255,255,.15); color:#fff; padding:3px 10px; border-radius:10px; font-size:11px;">${typeLabel}</span>` : ""}
            ${projectLocation ? `<span style="background:rgba(255,255,255,.15); color:#fff; padding:3px 10px; border-radius:10px; font-size:11px;">📍 ${projectLocation}</span>` : ""}
            ${projectArea ? `<span style="background:rgba(255,255,255,.15); color:#fff; padding:3px 10px; border-radius:10px; font-size:11px;">${projectArea} م²</span>` : ""}
            ${projectFloors ? `<span style="background:rgba(255,255,255,.15); color:#fff; padding:3px 10px; border-radius:10px; font-size:11px;">${projectFloors} أدوار</span>` : ""}
          </div>
        </div>

        <!-- ═══ PARTIES ═══ -->
        <div style="border:1.5px solid #E4E9F1; border-radius:12px; overflow:hidden; margin-bottom:20px;">
          <div style="background:#F4F7FB; padding:10px 16px; font-size:13px; font-weight:800; color:#0B1D33;">👥 أطراف العقد</div>
          <div style="padding:16px;">
            <div style="display:flex; gap:12px; margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid #EDF1F7;">
              <div style="width:36px; height:36px; background:#1A6FB5; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; color:#fff;">👤</div>
              <div>
                <div style="font-size:12px; font-weight:700; color:#0B1D33;">${ownerName}</div>
                <div style="font-size:10px; color:#8896A8;">صاحب المشروع${ownerEmail ? " — " + ownerEmail : ""}</div>
              </div>
            </div>
            <div style="display:flex; gap:12px;">
              <div style="width:36px; height:36px; background:#E8720C; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; color:#fff;">👷</div>
              <div>
                <div style="font-size:12px; font-weight:700; color:#0B1D33;">${contractorName}${contractorCompany ? " — " + contractorCompany : ""}</div>
                <div style="font-size:10px; color:#8896A8;">المقاول${contractorEmail ? " — " + contractorEmail : ""}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ CONTRACT TERMS ═══ -->
        <div style="border:1.5px solid #E4E9F1; border-radius:12px; overflow:hidden; margin-bottom:20px;">
          <div style="background:#F4F7FB; padding:10px 16px; font-size:13px; font-weight:800; color:#0B1D33;">📋 بنود العقد الرئيسية</div>
          <div style="padding:16px;">
            <table style="width:100%; font-size:12px; color:#4A5B73; border-collapse:collapse;">
              <tr>
                <td style="padding:7px 0; font-weight:700; color:#0B1D33; width:40%;">💰 القيمة الإجمالية</td>
                <td style="padding:7px 0; font-weight:900; font-size:16px; color:#E8720C;">${Number(totalPrice).toLocaleString()} د.ب</td>
              </tr>
              <tr style="border-top:1px solid #EDF1F7;">
                <td style="padding:7px 0; font-weight:700; color:#0B1D33;">📅 مدة التنفيذ</td>
                <td style="padding:7px 0;">${durationMonths} شهر</td>
              </tr>
              ${warrantyMonths ? `<tr style="border-top:1px solid #EDF1F7;">
                <td style="padding:7px 0; font-weight:700; color:#0B1D33;">🛡️ فترة الضمان</td>
                <td style="padding:7px 0;">${warrantyMonths} شهر</td>
              </tr>` : ""}
              <tr style="border-top:1px solid #EDF1F7;">
                <td style="padding:7px 0; font-weight:700; color:#0B1D33;">💳 آلية الدفع</td>
                <td style="padding:7px 0;">دفعات مرحلية عبر المحفظة الضامنة</td>
              </tr>
              <tr style="border-top:1px solid #EDF1F7;">
                <td style="padding:7px 0; font-weight:700; color:#0B1D33;">📱 منصة الإدارة</td>
                <td style="padding:7px 0;">${PLATFORM_NAME} — Securing Your Build</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- ═══ BOQ TABLE ═══ -->
        ${boqItems && boqItems.length > 0 ? `
        <div style="border:1.5px solid #E4E9F1; border-radius:12px; overflow:hidden; margin-bottom:20px;">
          <div style="background:#F4F7FB; padding:10px 16px; font-size:13px; font-weight:800; color:#0B1D33;">📊 جدول الكميات (BOQ)</div>
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:11px;">
              <thead>
                <tr style="background:#0B1D33; color:#fff;">
                  <th style="padding:8px 10px; text-align:right;">#</th>
                  <th style="padding:8px 10px; text-align:right;">المرحلة</th>
                  <th style="padding:8px 10px; text-align:right;">البند</th>
                  <th style="padding:8px 10px; text-align:right;">الوحدة</th>
                  <th style="padding:8px 10px; text-align:center;">الكمية</th>
                  <th style="padding:8px 10px; text-align:right;">سعر الوحدة (د.ب)</th>
                  <th style="padding:8px 10px; text-align:right;">الماركة</th>
                  <th style="padding:8px 10px; text-align:right;">الإجمالي (د.ب)</th>
                </tr>
              </thead>
              <tbody>
                ${boqRows}
              </tbody>
              <tfoot>
                <tr style="background:#F4F7FB; border-top:2px solid #E4E9F1;">
                  <td colspan="7" style="padding:10px; font-weight:800; color:#0B1D33; font-size:13px;">الإجمالي الكلي</td>
                  <td style="padding:10px; font-weight:900; color:#E8720C; font-size:14px;">${Number(totalPrice).toLocaleString()} د.ب</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>` : ""}

        <!-- ═══ OWNER CONDITIONS ═══ -->
        ${ownerConditions ? `
        <div style="border:1.5px solid #E8720C; border-radius:10px; padding:16px; margin-bottom:16px; background:rgba(232,114,12,.04);">
          <div style="font-size:13px; font-weight:800; color:#E8720C; margin-bottom:8px;">📋 شروط صاحب المشروع</div>
          <div style="font-size:11px; color:#4A5B73; line-height:1.8; white-space:pre-wrap;">${ownerConditions}</div>
        </div>` : ""}

        <!-- ═══ PLATFORM CONDITIONS ═══ -->
        <div style="border:1.5px solid #1A6FB5; border-radius:10px; padding:16px; margin-bottom:16px; background:rgba(26,111,181,.04);">
          <div style="font-size:13px; font-weight:800; color:#1A6FB5; margin-bottom:8px;">🔒 شروط وأحكام منصة FIRST TOUCH</div>
          <ol style="font-size:11px; color:#4A5B73; margin:0; padding-right:18px; line-height:2;">
            <li>يُلزم المقاول بتوثيق جميع مراحل التنفيذ بالصور والفيديو قبل التسليم.</li>
            <li>تتم جميع المدفوعات حصراً عبر المحفظة الضامنة في منصة FIRST TOUCH.</li>
            <li>لا يُصرف أي مبلغ إلا بعد اعتماد المفتش وموافقة صاحب المشروع.</li>
            <li>في حال رفض أي بند، يجب ذكر السبب الواضح مع توثيق مرئي للمشكلة.</li>
            <li>يحق للمالك رفض أي بند لا يستوفي المواصفات المتفق عليها في جدول الكميات.</li>
            <li>الالتزام الكامل ببنود BOQ المقدمة وأي تعديل يستلزم موافقة المالك.</li>
            <li>تُعدّ المنصة حكماً محايداً في النزاعات وتملك صلاحية تعليق المدفوعات.</li>
            <li>فترة الضمان المذكورة تبدأ من تاريخ التسليم النهائي المعتمد من المالك.</li>
            ${platformConditions || ""}
          </ol>
        </div>

        <!-- Signature Lines -->
        <div style="border:1px solid #E4E9F1; border-radius:10px; padding:16px; margin-bottom:20px;">
          <div style="font-size:12px; font-weight:800; color:#0B1D33; margin-bottom:12px;">✍️ توقيع الأطراف</div>
          <div style="display:flex; gap:20px;">
            <div style="flex:1; border-top:1.5px solid #0B1D33; padding-top:6px; text-align:center;">
              <div style="font-size:10px; color:#8896A8;">صاحب المشروع</div>
              <div style="font-size:11px; font-weight:700; color:#0B1D33; margin-top:2px;">${ownerName}</div>
            </div>
            <div style="flex:1; border-top:1.5px solid #E8720C; padding-top:6px; text-align:center;">
              <div style="font-size:10px; color:#8896A8;">المقاول</div>
              <div style="font-size:11px; font-weight:700; color:#0B1D33; margin-top:2px;">${contractorName}</div>
            </div>
            <div style="flex:1; border-top:1.5px solid #0EAD69; padding-top:6px; text-align:center;">
              <div style="font-size:10px; color:#8896A8;">منصة FIRST TOUCH</div>
              <div style="font-size:11px; font-weight:700; color:#0B1D33; margin-top:2px;">الطرف الضامن</div>
            </div>
          </div>
        </div>

        <div style="background:#F4F7FB; border-radius:8px; padding:12px; font-size:10px; color:#8896A8; text-align:center;">
          هذا العقد صادر رسمياً من منصة FIRST TOUCH وله مرجعية قانونية.
          بتاريخ: ${dateStr}
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align:center; padding:16px; font-size:10px; color:#8896A8;">
        <div>🐋 ${PLATFORM_NAME} — Securing Your Build</div>
        <div style="margin-top:2px;">للاستفسارات: ${PLATFORM_EMAIL}</div>
      </div>
    </div>`
  );
}

// ═══════ QUOTATION OFFER NOTIFICATION (sent to owner when contractor submits offer) ═══════
async function sendQuotationNotification(email, ownerName, contractorName, contractorCompany, projectTitle, totalPrice, durationMonths) {
  return sendEmail(email, `💰 عرض سعر جديد من ${contractorName} — ${projectTitle} | FIRST TOUCH`,
    `<div dir="rtl" style="font-family:Tahoma, Arial, sans-serif; max-width:600px; margin:0 auto; background:#F4F7FB;">
      <div style="background:linear-gradient(135deg, #0B1D33 0%, #1A6FB5 100%); padding:24px; border-radius:12px 12px 0 0; text-align:center;">
        <div style="font-size:30px; margin-bottom:4px;">🐋</div>
        <div style="font-size:20px; font-weight:900; color:#fff;">FIRST <span style="color:#E8720C;">TOUCH</span></div>
      </div>
      <div style="background:#E8720C; padding:10px; text-align:center;">
        <div style="font-size:13px; font-weight:700; color:#fff;">💰 عرض سعر جديد يحتاج مراجعتك</div>
      </div>
      <div style="background:#fff; padding:24px; border-radius:0 0 12px 12px;">
        <div style="font-size:16px; font-weight:900; color:#0B1D33; margin-bottom:16px;">مرحباً ${ownerName}</div>
        <p style="font-size:12px; color:#4A5B73;">تلقيت عرض سعر جديد على مشروعك <strong>${projectTitle}</strong> من المقاول:</p>
        <div style="border:1.5px solid #E4E9F1; border-radius:10px; padding:16px; margin:16px 0;">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
            <div style="width:40px; height:40px; background:#E8720C; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; color:#fff; flex-shrink:0;">👷</div>
            <div>
              <div style="font-size:13px; font-weight:700; color:#0B1D33;">${contractorName}</div>
              <div style="font-size:11px; color:#8896A8;">${contractorCompany || "المقاول"}</div>
            </div>
          </div>
          <table style="width:100%; font-size:12px; color:#4A5B73; border-collapse:collapse;">
            <tr><td style="padding:6px 0; font-weight:700; color:#0B1D33;">💰 قيمة العرض:</td><td style="font-weight:900; font-size:16px; color:#E8720C;">${Number(totalPrice).toLocaleString()} د.ب</td></tr>
            <tr style="border-top:1px solid #EDF1F7;"><td style="padding:6px 0; font-weight:700; color:#0B1D33;">📅 مدة التنفيذ:</td><td>${durationMonths} شهر</td></tr>
          </table>
        </div>
        <div style="background:#F4F7FB; border-radius:8px; padding:12px; font-size:11px; color:#8896A8; margin-top:16px;">
          سجّل دخولك إلى تطبيق FIRST TOUCH لمراجعة تفاصيل العرض كاملاً وقبوله أو رفضه.
        </div>
      </div>
    </div>`
  );
}

module.exports = {
  initEmail, sendEmail, sendWelcome, sendPaymentNotification,
  sendNewProjectNotification, sendContractEmail, sendQuotationNotification,
  sendVerificationEmail, sendPasswordReset
};
