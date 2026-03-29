const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { auth } = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();
const prisma = new PrismaClient();

// ═══════ LIST ALL CONTRACTORS ═══════
router.get("/", auth, async (req, res) => {
  try {
    const contractors = await prisma.user.findMany({
      where: {
        OR: [
          { role: "contractor" },
          { roles: { contains: "contractor" } }
        ]
      },
      select: {
        id: true, nameAr: true, nameEn: true, companyNameAr: true,
        rating: true, totalProjects: true, bioAr: true,
        profileImage: true, crNumber: true
      },
      orderBy: { rating: "desc" }
    });

    const result = await Promise.all(contractors.map(async (c) => {
      const [completedCount, activeCount] = await Promise.all([
        prisma.project.count({ where: { contractorId: c.id, status: "completed" } }),
        prisma.project.count({ where: { contractorId: c.id, status: "active" } })
      ]);
      return { ...c, completed_projects: completedCount, active_projects: activeCount };
    }));

    res.json({ contractors: result });
  } catch (e) {
    logger.error("Get contractors error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ GET SINGLE CONTRACTOR ═══════
router.get("/:id", auth, async (req, res) => {
  try {
    const contractor = await prisma.user.findFirst({
      where: {
        id: parseInt(req.params.id),
        OR: [{ role: "contractor" }, { roles: { contains: "contractor" } }]
      },
      select: {
        id: true, nameAr: true, nameEn: true, companyNameAr: true,
        rating: true, totalProjects: true, bioAr: true, profileImage: true,
        crNumber: true, specialty: true, phone: true
      }
    });
    if (!contractor) return res.status(404).json({ error: "المقاول غير موجود" });

    const [completedCount, activeCount, earnings] = await Promise.all([
      prisma.project.count({ where: { contractorId: contractor.id, status: "completed" } }),
      prisma.project.count({ where: { contractorId: contractor.id, status: "active" } }),
      prisma.contractorEarning.aggregate({
        where: { contractorId: contractor.id },
        _sum: { amount: true }
      })
    ]);

    res.json({
      contractor: {
        ...contractor,
        completed_projects: completedCount,
        active_projects: activeCount,
        total_earned: earnings._sum.amount || 0
      }
    });
  } catch (e) {
    logger.error("Get contractor error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

module.exports = router;
