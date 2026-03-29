const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { auth, requireRole } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { financingSchema } = require("../utils/validators");
const logger = require("../utils/logger");

const router = express.Router();
const prisma = new PrismaClient();

// ═══════ APPLY FOR FINANCING ═══════
router.post("/apply", auth, requireRole("owner"), validate(financingSchema), async (req, res) => {
  try {
    const d = req.validated;
    await prisma.financingApplication.create({
      data: {
        userId: req.user.id,
        projectId: d.projectId || null,
        amount: d.amount,
        bank: d.bank,
        durationMonths: d.durationMonths,
        notes: d.notes
      }
    });

    logger.info("Financing application submitted", { userId: req.user.id, amount: d.amount });
    res.status(201).json({ success: true, message: "تم تقديم طلب التمويل" });
  } catch (e) {
    logger.error("Financing apply error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ GET MY FINANCING APPLICATIONS ═══════
router.get("/", auth, async (req, res) => {
  try {
    const applications = await prisma.financingApplication.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        project: { select: { titleAr: true } }
      }
    });

    const result = applications.map(a => ({
      ...a,
      project_title: a.project?.titleAr
    }));

    res.json({ applications: result });
  } catch (e) {
    logger.error("Get financing error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

module.exports = router;
