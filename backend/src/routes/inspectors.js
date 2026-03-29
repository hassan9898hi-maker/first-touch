const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { auth } = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();
const prisma = new PrismaClient();

// ═══════ LIST ALL INSPECTORS ═══════
router.get("/", auth, async (req, res) => {
  try {
    const inspectors = await prisma.user.findMany({
      where: {
        OR: [
          { role: "inspector" },
          { roles: { contains: "inspector" } }
        ]
      },
      select: {
        id: true, nameAr: true, nameEn: true, specialty: true,
        rating: true, totalProjects: true, bioAr: true, profileImage: true
      },
      orderBy: { rating: "desc" }
    });

    const result = await Promise.all(inspectors.map(async (i) => {
      const completedCount = await prisma.project.count({
        where: { inspectorId: i.id, status: "completed" }
      });
      return { ...i, completed_projects: completedCount };
    }));

    res.json({ inspectors: result });
  } catch (e) {
    logger.error("Get inspectors error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ GET SINGLE INSPECTOR ═══════
router.get("/:id", auth, async (req, res) => {
  try {
    const inspector = await prisma.user.findFirst({
      where: {
        id: parseInt(req.params.id),
        OR: [{ role: "inspector" }, { roles: { contains: "inspector" } }]
      },
      select: {
        id: true, nameAr: true, nameEn: true, specialty: true,
        rating: true, totalProjects: true, bioAr: true, profileImage: true, phone: true
      }
    });
    if (!inspector) return res.status(404).json({ error: "المفتش غير موجود" });

    const [completedCount, activeCount, totalInspections] = await Promise.all([
      prisma.project.count({ where: { inspectorId: inspector.id, status: "completed" } }),
      prisma.project.count({ where: { inspectorId: inspector.id, status: "active" } }),
      prisma.checklistItem.count({
        where: { inspectorDone: true, subStage: { stage: { project: { inspectorId: inspector.id } } } }
      })
    ]);

    res.json({
      inspector: {
        ...inspector,
        completed_projects: completedCount,
        active_projects: activeCount,
        total_inspections: totalInspections
      }
    });
  } catch (e) {
    logger.error("Get inspector error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

module.exports = router;
