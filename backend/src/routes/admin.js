const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { auth } = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();
const prisma = new PrismaClient();

// ═══════ ADMIN MIDDLEWARE ═══════
function adminOnly(req, res, next) {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: "صلاحيات المشرف مطلوبة" });
  }
  next();
}

// ═══════ DASHBOARD STATS ═══════
router.get("/stats", auth, adminOnly, async (req, res) => {
  try {
    const [
      totalUsers,
      totalProjects,
      activeProjects,
      completedProjects,
      totalOwners,
      totalContractors,
      totalInspectors,
      totalWalletBalance
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.project.count({ where: { status: { in: ["accepted", "in_progress"] } } }),
      prisma.project.count({ where: { status: "completed" } }),
      prisma.user.count({ where: { role: "owner" } }),
      prisma.user.count({ where: { role: "contractor" } }),
      prisma.user.count({ where: { role: "inspector" } }),
      prisma.wallet.aggregate({ _sum: { balance: true } })
    ]);

    res.json({
      users: { total: totalUsers, owners: totalOwners, contractors: totalContractors, inspectors: totalInspectors },
      projects: { total: totalProjects, active: activeProjects, completed: completedProjects },
      wallet: { total_balance: totalWalletBalance._sum.balance || 0 }
    });
  } catch (e) {
    logger.error("Admin stats error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ LIST ALL USERS ═══════
router.get("/users", auth, adminOnly, async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { nameAr: { contains: search } },
        { email: { contains: search } },
        { companyNameAr: { contains: search } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        select: {
          id: true, nameAr: true, nameEn: true, email: true, role: true, roles: true,
          companyNameAr: true, specialty: true, phone: true, crNumber: true,
          rating: true, totalProjects: true, isActive: true, isAdmin: true,
          emailVerified: true, createdAt: true,
          _count: {
            select: {
              ownedProjects: true,
              contractedProjects: true,
              inspectedProjects: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (e) {
    logger.error("Admin list users error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ GET SINGLE USER ═══════
router.get("/users/:id", auth, adminOnly, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        wallet: true,
        ownedProjects: { select: { id: true, titleAr: true, status: true, createdAt: true } },
        contractedProjects: { select: { id: true, titleAr: true, status: true, createdAt: true } },
        inspectedProjects: { select: { id: true, titleAr: true, status: true, createdAt: true } }
      }
    });

    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });

    const { passwordHash, verifyToken, resetToken, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (e) {
    logger.error("Admin get user error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ UPDATE USER (activate/deactivate/promote) ═══════
router.patch("/users/:id", auth, adminOnly, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { isActive, isAdmin, emailVerified, nameAr, phone, role } = req.body;

    // Prevent admin from demoting themselves
    if (userId === req.user.id && isAdmin === false) {
      return res.status(400).json({ error: "لا يمكنك إزالة صلاحياتك الخاصة" });
    }

    const data = {};
    if (isActive !== undefined) data.isActive = isActive;
    if (isAdmin !== undefined) data.isAdmin = isAdmin;
    if (emailVerified !== undefined) data.emailVerified = emailVerified;
    if (nameAr) data.nameAr = nameAr;
    if (phone !== undefined) data.phone = phone;
    if (role) {
      data.role = role;
      data.roles = role;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true, nameAr: true, email: true, role: true, isActive: true,
        isAdmin: true, emailVerified: true, phone: true
      }
    });

    logger.info("Admin updated user", { adminId: req.user.id, targetUserId: userId, changes: data });
    res.json({ success: true, user: updated });
  } catch (e) {
    logger.error("Admin update user error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ RESET USER PASSWORD ═══════
router.post("/users/:id/reset-password", auth, adminOnly, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    await prisma.refreshToken.deleteMany({ where: { userId } });

    logger.info("Admin reset user password", { adminId: req.user.id, targetUserId: userId });
    res.json({ success: true, message: "تم تغيير كلمة المرور" });
  } catch (e) {
    logger.error("Admin reset password error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ LIST ALL PROJECTS ═══════
router.get("/projects", auth, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          owner: { select: { id: true, nameAr: true, email: true } },
          contractor: { select: { id: true, nameAr: true, companyNameAr: true } },
          inspector: { select: { id: true, nameAr: true } },
          _count: { select: { stages: true, quotations: true } }
        }
      }),
      prisma.project.count({ where })
    ]);

    res.json({
      projects,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (e) {
    logger.error("Admin list projects error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ CREATE ADMIN USER (first-time setup) ═══════
router.post("/create-admin", auth, adminOnly, async (req, res) => {
  try {
    const { email, nameAr, password } = req.body;
    if (!email || !nameAr || !password) {
      return res.status(400).json({ error: "البيانات ناقصة" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // If user exists, promote to admin
      await prisma.user.update({
        where: { email },
        data: { isAdmin: true, emailVerified: true }
      });
      return res.json({ success: true, message: "تم ترقية المستخدم إلى مشرف" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        nameAr, email, passwordHash,
        role: "owner", roles: "owner",
        isAdmin: true, emailVerified: true, isActive: true
      }
    });

    logger.info("Admin user created", { adminId: req.user.id, newAdmin: email });
    res.status(201).json({ success: true, message: "تم إنشاء حساب المشرف" });
  } catch (e) {
    logger.error("Create admin error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

module.exports = router;
