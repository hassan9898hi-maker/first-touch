const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { auth } = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();
const prisma = new PrismaClient();

// Helper: get accepted contract data for a project (FIXED/IMMUTABLE after agreement)
async function getContractData(projectId) {
  const q = await prisma.quotation.findFirst({
    where: { projectId, status: "accepted" },
    include: { contractor: { select: { nameAr: true, companyNameAr: true, rating: true, phone: true } } }
  });
  if (!q) return null;
  let boqItems = [];
  try { boqItems = JSON.parse(q.breakdown || "[]"); } catch (e) { /* */ }
  return {
    locked: true,
    acceptedAt: q.createdAt,
    contractorName: q.contractor?.nameAr,
    contractorCompany: q.contractor?.companyNameAr,
    contractorRating: q.contractor?.rating,
    contractorPhone: q.contractor?.phone,
    agreedPrice: q.price,
    durationMonths: q.durationMonths,
    warrantyMonths: q.warrantyMonths,
    notes: q.notes,
    boqItems: boqItems
  };
}

// Helper: compute project completion
async function getCompletion(projectId) {
  const total = await prisma.checklistItem.count({ where: { subStage: { stage: { projectId } } } });
  const done = await prisma.checklistItem.count({ where: { ownerDone: true, ownerApproved: true, subStage: { stage: { projectId } } } });
  return total > 0 ? Math.round(done / total * 100) : 0;
}

// Helper: get stage-by-stage progress for a project
async function getStageProgress(projectId) {
  const stages = await prisma.stage.findMany({
    where: { projectId },
    orderBy: { orderNum: "asc" },
    include: {
      subStages: {
        include: {
          items: { select: { id: true, contractorDone: true, inspectorApproved: true, ownerApproved: true, cost: true } }
        }
      }
    }
  });
  return stages.map(s => {
    const items = s.subStages.flatMap(ss => ss.items);
    const total = items.length;
    const done = items.filter(i => i.ownerApproved).length;
    const contrDone = items.filter(i => i.contractorDone).length;
    const inspDone = items.filter(i => i.inspectorApproved).length;
    const totalCost = items.reduce((sum, i) => sum + (i.cost || 0), 0);
    const paidCost = items.filter(i => i.ownerApproved).reduce((sum, i) => sum + (i.cost || 0), 0);
    return {
      id: s.id, nameAr: s.nameAr, nameEn: s.nameEn, status: s.status, budget: s.budget, orderNum: s.orderNum,
      totalItems: total, completedItems: done, contractorDone: contrDone, inspectorDone: inspDone,
      progress: total > 0 ? Math.round(done / total * 100) : 0,
      totalCost, paidCost
    };
  });
}

router.get("/", auth, async (req, res) => {
  try {
    const uid = req.user.id;
    const role = req.user.role;

    if (role === "owner") {
      const [pendingItems, activeProjects, completedProjects, totalProjects, wallet, pendingQuotations, financing] = await Promise.all([
        prisma.checklistItem.count({
          where: { inspectorDone: true, inspectorApproved: true, ownerDone: false,
            subStage: { stage: { project: { ownerId: uid } } } }
        }),
        prisma.project.count({ where: { ownerId: uid, status: "active" } }),
        prisma.project.count({ where: { ownerId: uid, status: "completed" } }),
        prisma.project.count({ where: { ownerId: uid } }),
        prisma.wallet.findUnique({ where: { userId: uid } }),
        prisma.quotation.count({
          where: { status: "pending", project: { ownerId: uid } }
        }),
        prisma.financingApplication.findMany({
          where: { userId: uid }, orderBy: { createdAt: "desc" }, take: 5
        })
      ]);

      // Get active project contract + stage progress
      const activeProject = await prisma.project.findFirst({
        where: { ownerId: uid, status: "active" },
        include: {
          contractor: { select: { nameAr: true, companyNameAr: true, rating: true } },
          inspector: { select: { nameAr: true, specialty: true, rating: true } }
        }
      });
      let contract = null;
      let stageProgress = [];
      let totalPaid = 0;
      if (activeProject) {
        contract = await getContractData(activeProject.id);
        stageProgress = await getStageProgress(activeProject.id);
        totalPaid = stageProgress.reduce((s, st) => s + st.paidCost, 0);
      }

      res.json({
        pending_approvals: pendingItems,
        active_projects: activeProjects,
        completed_projects: completedProjects,
        total_projects: totalProjects,
        wallet: wallet || { balance: 0, reserved: 0, totalPaid: 0 },
        pending_quotations: pendingQuotations,
        financing_applications: financing,
        contract: contract,
        stage_progress: stageProgress,
        total_paid_to_contractor: totalPaid,
        active_project_info: activeProject ? {
          id: activeProject.id,
          titleAr: activeProject.titleAr,
          contractorName: activeProject.contractor?.nameAr,
          contractorCompany: activeProject.contractor?.companyNameAr,
          inspectorName: activeProject.inspector?.nameAr,
          ownerConditions: activeProject.ownerConditions,
          totalBudget: activeProject.totalBudget
        } : null
      });
    } else if (role === "contractor") {
      const [pending, activeProjects, awaitingPricing, myQuotations, earnings, completedItems, totalItems] = await Promise.all([
        prisma.checklistItem.count({
          where: { contractorDone: false,
            subStage: { stage: { status: "active", project: { contractorId: uid } } } }
        }),
        prisma.project.count({ where: { contractorId: uid, status: "active" } }),
        prisma.project.count({ where: { status: "awaiting_pricing" } }),
        prisma.quotation.count({ where: { contractorId: uid, status: "pending" } }),
        prisma.contractorEarning.aggregate({
          where: { contractorId: uid }, _sum: { amount: true }
        }),
        prisma.checklistItem.count({
          where: { contractorDone: true,
            subStage: { stage: { project: { contractorId: uid } } } }
        }),
        prisma.checklistItem.count({
          where: { subStage: { stage: { project: { contractorId: uid, status: "active" } } } }
        })
      ]);

      // Get active project contract data (FIXED)
      const activeProject = await prisma.project.findFirst({
        where: { contractorId: uid, status: "active" },
        include: {
          owner: { select: { nameAr: true } },
          inspector: { select: { nameAr: true } }
        }
      });
      let contract = null;
      let stageProgress = [];
      if (activeProject) {
        contract = await getContractData(activeProject.id);
        stageProgress = await getStageProgress(activeProject.id);
      }

      // Completed projects count
      const completedProjects = await prisma.project.count({ where: { contractorId: uid, status: "completed" } });

      res.json({
        pending_deliveries: pending,
        active_projects: activeProjects,
        awaiting_pricing: awaitingPricing,
        my_quotations: myQuotations,
        total_earned: earnings._sum.amount || 0,
        completed_items: completedItems,
        total_items: totalItems,
        delivery_progress: totalItems > 0 ? Math.round(completedItems / totalItems * 100) : 0,
        completed_projects: completedProjects,
        contract: contract,
        stage_progress: stageProgress,
        active_project_info: activeProject ? {
          id: activeProject.id,
          titleAr: activeProject.titleAr,
          ownerName: activeProject.owner?.nameAr,
          inspectorName: activeProject.inspector?.nameAr,
          totalBudget: activeProject.totalBudget,
          ownerConditions: activeProject.ownerConditions
        } : null
      });
    } else if (role === "developer") {
      const [compounds, totalUnits, completedUnits, inProgressUnits, delayedUnits, openIssues, wallet] = await Promise.all([
        prisma.compound.count({ where: { developerId: uid } }),
        prisma.compoundUnit.count({ where: { compound: { developerId: uid } } }),
        prisma.compoundUnit.count({ where: { compound: { developerId: uid }, status: "completed" } }),
        prisma.compoundUnit.count({ where: { compound: { developerId: uid }, status: "in_progress" } }),
        prisma.compoundUnit.count({ where: { compound: { developerId: uid }, status: "delayed" } }),
        prisma.qualityIssue.count({ where: { compound: { developerId: uid }, status: { in: ["open", "in_progress"] } } }),
        prisma.wallet.findUnique({ where: { userId: uid } })
      ]);

      // Overall progress
      const allUnits = await prisma.compoundUnit.findMany({
        where: { compound: { developerId: uid } },
        select: { progress: true }
      });
      const overallProgress = allUnits.length > 0
        ? Math.round(allUnits.reduce((sum, u) => sum + u.progress, 0) / allUnits.length)
        : 0;

      // Total budget/spent across compounds
      const compoundsList = await prisma.compound.findMany({
        where: { developerId: uid },
        select: { totalBudget: true }
      });
      const totalBudget = compoundsList.reduce((s, c) => s + (c.totalBudget || 0), 0);
      const allUnitsSpent = await prisma.compoundUnit.findMany({
        where: { compound: { developerId: uid } },
        select: { spent: true }
      });
      const totalSpent = allUnitsSpent.reduce((s, u) => s + (u.spent || 0), 0);

      res.json({
        total_compounds: compounds,
        total_units: totalUnits,
        completed_units: completedUnits,
        in_progress_units: inProgressUnits,
        delayed_units: delayedUnits,
        open_quality_issues: openIssues,
        overall_progress: overallProgress,
        total_budget: totalBudget,
        total_spent: totalSpent,
        wallet: wallet || { balance: 0, reserved: 0, totalPaid: 0 }
      });
    } else if (role === "inspector") {
      const [pending, activeProjects, awaitingSig, completedInsp, totalInspected, rejectedItems] = await Promise.all([
        prisma.checklistItem.count({
          where: { contractorDone: true, inspectorDone: false,
            subStage: { stage: { project: { inspectorId: uid } } } }
        }),
        prisma.project.count({ where: { inspectorId: uid, status: "active" } }),
        prisma.project.count({ where: { status: "awaiting_pricing", inspectorId: null } }),
        prisma.checklistItem.count({
          where: { inspectorDone: true,
            subStage: { stage: { project: { inspectorId: uid } } } }
        }),
        prisma.checklistItem.count({
          where: { subStage: { stage: { project: { inspectorId: uid } } } }
        }),
        prisma.checklistItem.count({
          where: { inspectorDone: true, inspectorApproved: false,
            subStage: { stage: { project: { inspectorId: uid } } } }
        })
      ]);

      // Get active project + stage progress
      const activeProject = await prisma.project.findFirst({
        where: { inspectorId: uid, status: "active" },
        include: {
          owner: { select: { nameAr: true } },
          contractor: { select: { nameAr: true, companyNameAr: true } }
        }
      });
      let stageProgress = [];
      if (activeProject) {
        stageProgress = await getStageProgress(activeProject.id);
      }

      const completedProjects = await prisma.project.count({ where: { inspectorId: uid, status: "completed" } });

      // Inspector fee from accepted application
      let inspectorFee = 0;
      if (activeProject) {
        const app = await prisma.inspectorApplication.findFirst({
          where: { projectId: activeProject.id, inspectorId: uid, status: "accepted" }
        });
        if (app) inspectorFee = app.fee;
      }

      res.json({
        pending_inspections: pending,
        active_projects: activeProjects,
        awaiting_signature: awaitingSig,
        completed_inspections: completedInsp,
        total_inspected: totalInspected,
        rejected_items: rejectedItems,
        approval_rate: completedInsp > 0 ? Math.round(((completedInsp - rejectedItems) / completedInsp) * 100) : 100,
        completed_projects: completedProjects,
        inspector_fee: inspectorFee,
        stage_progress: stageProgress,
        active_project_info: activeProject ? {
          id: activeProject.id,
          titleAr: activeProject.titleAr,
          ownerName: activeProject.owner?.nameAr,
          contractorName: activeProject.contractor?.nameAr,
          contractorCompany: activeProject.contractor?.companyNameAr,
          totalBudget: activeProject.totalBudget
        } : null
      });
    }
  } catch (e) {
    logger.error("Dashboard error", { error: e.message, userId: req.user.id });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

module.exports = router;
