const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { auth, requireRole } = require("../middleware/auth");
const { notify } = require("../services/notification");
const logger = require("../utils/logger");

const router = express.Router();
const prisma = new PrismaClient();

// ═══════ Helper: default stages for compound units ═══════
const DEFAULT_STAGES = [
  { name: "الأساسات والقواعد", en: "Foundation", pct: 0.20 },
  { name: "الهيكل الخرساني", en: "Structure", pct: 0.30 },
  { name: "الأعمال الكهربائية", en: "Electrical", pct: 0.15 },
  { name: "السباكة والصرف", en: "Plumbing", pct: 0.12 },
  { name: "التشطيبات والدهانات", en: "Finishing", pct: 0.23 }
];

async function createUnitStages(unitId, budget) {
  const b = budget || 100000;
  for (let i = 0; i < DEFAULT_STAGES.length; i++) {
    const s = DEFAULT_STAGES[i];
    const stageBudget = Math.round(b * s.pct);
    const stage = await prisma.unitStage.create({
      data: { unitId, nameAr: s.name, nameEn: s.en, orderNum: i + 1, budget: stageBudget }
    });
    await prisma.unitChecklistItem.createMany({ data: [
      { stageId: stage.id, textAr: "تجهيز المواد والمعدات", orderNum: 1, cost: Math.round(stageBudget * 0.3) },
      { stageId: stage.id, textAr: "تنفيذ الأعمال الرئيسية", orderNum: 2, cost: Math.round(stageBudget * 0.5) },
      { stageId: stage.id, textAr: "فحص واعتماد الأعمال", orderNum: 3, cost: Math.round(stageBudget * 0.2) }
    ]});
  }
}

// ═══════ Helper: compute unit progress ═══════
async function getUnitProgress(unitId) {
  const total = await prisma.unitChecklistItem.count({ where: { stage: { unitId } } });
  const done = await prisma.unitChecklistItem.count({ where: { status: "completed", stage: { unitId } } });
  return total > 0 ? Math.round(done / total * 100) : 0;
}

// ═══════ Helper: compute compound progress ═══════
async function getCompoundProgress(compoundId) {
  const units = await prisma.compoundUnit.findMany({ where: { compoundId }, select: { progress: true } });
  if (units.length === 0) return 0;
  const total = units.reduce((sum, u) => sum + u.progress, 0);
  return Math.round(total / units.length);
}

// ══════════════════════════════════════════════
// COMPOUND CRUD
// ══════════════════════════════════════════════

// ═══════ GET ALL COMPOUNDS (for developer) ═══════
router.get("/", auth, requireRole("developer", "admin"), async (req, res) => {
  try {
    const where = req.user.role === "admin" ? {} : { developerId: req.user.id };
    const compounds = await prisma.compound.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { units: true, qualityIssues: true } }
      }
    });

    const result = await Promise.all(compounds.map(async (c) => ({
      ...c,
      overallProgress: await getCompoundProgress(c.id),
      totalUnitsCount: c._count.units,
      openIssues: c._count.qualityIssues
    })));

    res.json({ compounds: result });
  } catch (e) {
    logger.error("Get compounds error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ CREATE COMPOUND ═══════
router.post("/", auth, requireRole("developer"), async (req, res) => {
  try {
    const { compoundNumber, nameAr, nameEn, type, area, city, country, totalArea, totalBudget, contractorId, inspectorId, paymentType, startDate, expectedEndDate, description, units } = req.body;

    if (!compoundNumber || !nameAr) {
      return res.status(400).json({ error: "رقم المجمع واسمه مطلوبان" });
    }

    const existing = await prisma.compound.findUnique({ where: { compoundNumber } });
    if (existing) return res.status(409).json({ error: "رقم المجمع مستخدم مسبقاً" });

    const compound = await prisma.compound.create({
      data: {
        compoundNumber, nameAr, nameEn: nameEn || null,
        developerId: req.user.id,
        type: type || "residential",
        area: area || null, city: city || null, country: country || "البحرين",
        totalArea: totalArea || null,
        totalBudget: totalBudget || 0,
        totalUnits: units ? units.length : 0,
        contractorId: contractorId || null,
        inspectorId: inspectorId || null,
        paymentType: paymentType || "per_unit",
        startDate: startDate ? new Date(startDate) : null,
        expectedEndDate: expectedEndDate ? new Date(expectedEndDate) : null,
        description: description || null,
        status: contractorId ? "team_assigned" : "setup"
      }
    });

    // Create units if provided
    if (units && units.length > 0) {
      for (const u of units) {
        const unit = await prisma.compoundUnit.create({
          data: {
            compoundId: compound.id,
            unitNumber: u.unitNumber,
            type: u.type || "villa",
            modelType: u.modelType || null,
            block: u.block || null,
            floor: u.floor || null,
            area: u.area || null,
            budget: u.budget || 0,
            plannedStart: u.plannedStart ? new Date(u.plannedStart) : null,
            plannedEnd: u.plannedEnd ? new Date(u.plannedEnd) : null
          }
        });
        await createUnitStages(unit.id, u.budget);
      }
    }

    logger.info("Compound created", { compoundId: compound.id, developer: req.user.id });

    const full = await prisma.compound.findUnique({
      where: { id: compound.id },
      include: { units: true, _count: { select: { units: true } } }
    });

    res.status(201).json({ compound: full });
  } catch (e) {
    logger.error("Create compound error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ GET COMPOUND DETAILS ═══════
router.get("/:id", auth, async (req, res) => {
  try {
    const compound = await prisma.compound.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        units: { orderBy: { unitNumber: "asc" } },
        supervisors: true,
        _count: { select: { units: true, qualityIssues: true, payments: true } }
      }
    });

    if (!compound) return res.status(404).json({ error: "المجمع غير موجود" });

    const progress = await getCompoundProgress(compound.id);
    res.json({ compound: { ...compound, overallProgress: progress } });
  } catch (e) {
    logger.error("Get compound error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ UPDATE COMPOUND ═══════
router.patch("/:id", auth, requireRole("developer"), async (req, res) => {
  try {
    const { nameAr, nameEn, contractorId, inspectorId, paymentType, status, startDate, expectedEndDate, description } = req.body;

    const compound = await prisma.compound.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!compound) return res.status(404).json({ error: "المجمع غير موجود" });
    if (compound.developerId !== req.user.id) return res.status(403).json({ error: "ليس لديك صلاحية" });

    const data = {};
    if (nameAr) data.nameAr = nameAr;
    if (nameEn !== undefined) data.nameEn = nameEn;
    if (contractorId) data.contractorId = contractorId;
    if (inspectorId) data.inspectorId = inspectorId;
    if (paymentType) data.paymentType = paymentType;
    if (status) data.status = status;
    if (startDate) data.startDate = new Date(startDate);
    if (expectedEndDate) data.expectedEndDate = new Date(expectedEndDate);
    if (description !== undefined) data.description = description;

    if (contractorId && compound.status === "setup") {
      data.status = "team_assigned";
    }

    const updated = await prisma.compound.update({ where: { id: compound.id }, data });
    res.json({ compound: updated });
  } catch (e) {
    logger.error("Update compound error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ══════════════════════════════════════════════
// COMPOUND DASHBOARD
// ══════════════════════════════════════════════

router.get("/:id/dashboard", auth, async (req, res) => {
  try {
    const compoundId = parseInt(req.params.id);
    const compound = await prisma.compound.findUnique({ where: { id: compoundId } });
    if (!compound) return res.status(404).json({ error: "المجمع غير موجود" });

    const units = await prisma.compoundUnit.findMany({ where: { compoundId } });
    const completed = units.filter(u => u.status === "completed").length;
    const inProgress = units.filter(u => u.status === "in_progress").length;
    const delayed = units.filter(u => u.status === "delayed").length;
    const pending = units.filter(u => u.status === "pending").length;
    const onHold = units.filter(u => u.status === "on_hold").length;

    const totalSpent = units.reduce((sum, u) => sum + u.spent, 0);
    const overallProgress = await getCompoundProgress(compoundId);

    const openIssues = await prisma.qualityIssue.count({ where: { compoundId, status: { in: ["open", "in_progress"] } } });
    const totalIssues = await prisma.qualityIssue.count({ where: { compoundId } });
    const resolvedIssues = await prisma.qualityIssue.count({ where: { compoundId, status: { in: ["resolved", "closed"] } } });

    // Alerts: delayed units + budget overruns + quality issues
    const alerts = [];
    for (const u of units) {
      if (u.status === "delayed") {
        alerts.push({ type: "delay", unitNumber: u.unitNumber, unitId: u.id, message: `${u.unitNumber}: تأخر عن الجدول الزمني` });
      }
      if (u.budget > 0 && u.spent > u.budget) {
        const overrun = Math.round((u.spent - u.budget) / u.budget * 100);
        alerts.push({ type: "budget", unitNumber: u.unitNumber, unitId: u.id, message: `${u.unitNumber}: تجاوز الميزانية بـ ${overrun}%` });
      }
    }

    const criticalIssues = await prisma.qualityIssue.findMany({
      where: { compoundId, priority: { in: ["high", "critical"] }, status: { in: ["open", "in_progress"] } },
      take: 5, orderBy: { createdAt: "desc" }
    });
    for (const issue of criticalIssues) {
      alerts.push({ type: "quality", issueId: issue.id, unitId: issue.unitId, message: `${issue.title}` });
    }

    res.json({
      overview: { total: units.length, completed, inProgress, delayed, pending, onHold },
      overallProgress,
      budget: {
        total: compound.totalBudget,
        spent: totalSpent,
        remaining: compound.totalBudget - totalSpent,
        spentPercentage: compound.totalBudget > 0 ? Math.round(totalSpent / compound.totalBudget * 100) : 0
      },
      quality: { total: totalIssues, open: openIssues, resolved: resolvedIssues, closeRate: totalIssues > 0 ? Math.round(resolvedIssues / totalIssues * 100) : 0 },
      alerts
    });
  } catch (e) {
    logger.error("Compound dashboard error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ══════════════════════════════════════════════
// UNITS MANAGEMENT
// ══════════════════════════════════════════════

// ═══════ GET ALL UNITS IN COMPOUND ═══════
router.get("/:id/units", auth, async (req, res) => {
  try {
    const compoundId = parseInt(req.params.id);
    const { block, status } = req.query;

    const where = { compoundId };
    if (block) where.block = block;
    if (status) where.status = status;

    const units = await prisma.compoundUnit.findMany({
      where,
      orderBy: { unitNumber: "asc" },
      include: {
        stages: { orderBy: { orderNum: "asc" }, select: { id: true, nameAr: true, progress: true, status: true } }
      }
    });

    res.json({ units });
  } catch (e) {
    logger.error("Get units error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ GET UNITS GRID VIEW ═══════
router.get("/:id/units/grid", auth, async (req, res) => {
  try {
    const compoundId = parseInt(req.params.id);
    const units = await prisma.compoundUnit.findMany({
      where: { compoundId },
      orderBy: { unitNumber: "asc" },
      select: { id: true, unitNumber: true, block: true, progress: true, status: true, budget: true, spent: true }
    });

    const blocks = {};
    for (const u of units) {
      const blockName = u.block || "عام";
      if (!blocks[blockName]) blocks[blockName] = [];
      blocks[blockName].push(u);
    }

    res.json({ blocks: Object.entries(blocks).map(([name, units]) => ({ name, units })) });
  } catch (e) {
    logger.error("Get units grid error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ GET UNIT DETAILS ═══════
router.get("/:id/units/:unitId", auth, async (req, res) => {
  try {
    const unit = await prisma.compoundUnit.findUnique({
      where: { id: parseInt(req.params.unitId) },
      include: {
        stages: {
          orderBy: { orderNum: "asc" },
          include: { items: { orderBy: { orderNum: "asc" } } }
        },
        materials: { orderBy: { createdAt: "desc" } },
        qualityIssues: { orderBy: { createdAt: "desc" }, take: 10 }
      }
    });

    if (!unit) return res.status(404).json({ error: "الوحدة غير موجودة" });
    res.json({ unit });
  } catch (e) {
    logger.error("Get unit detail error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ ADD UNIT TO COMPOUND ═══════
router.post("/:id/units", auth, requireRole("developer"), async (req, res) => {
  try {
    const compoundId = parseInt(req.params.id);
    const compound = await prisma.compound.findUnique({ where: { id: compoundId } });
    if (!compound) return res.status(404).json({ error: "المجمع غير موجود" });
    if (compound.developerId !== req.user.id) return res.status(403).json({ error: "ليس لديك صلاحية" });

    const { unitNumber, type, modelType, block, floor, area, budget, plannedStart, plannedEnd } = req.body;
    if (!unitNumber) return res.status(400).json({ error: "رقم الوحدة مطلوب" });

    const unit = await prisma.compoundUnit.create({
      data: {
        compoundId, unitNumber,
        type: type || "villa", modelType: modelType || null,
        block: block || null, floor: floor || null,
        area: area || null, budget: budget || 0,
        plannedStart: plannedStart ? new Date(plannedStart) : null,
        plannedEnd: plannedEnd ? new Date(plannedEnd) : null
      }
    });

    await createUnitStages(unit.id, budget);

    await prisma.compound.update({
      where: { id: compoundId },
      data: { totalUnits: { increment: 1 } }
    });

    const full = await prisma.compoundUnit.findUnique({
      where: { id: unit.id },
      include: { stages: { include: { items: true } } }
    });

    res.status(201).json({ unit: full });
  } catch (e) {
    if (e.code === "P2002") return res.status(409).json({ error: "رقم الوحدة مستخدم مسبقاً في هذا المجمع" });
    logger.error("Add unit error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ UPDATE UNIT STATUS / PROGRESS ═══════
router.patch("/:id/units/:unitId", auth, async (req, res) => {
  try {
    const { status, progress, notes, spent } = req.body;
    const data = {};
    if (status) data.status = status;
    if (progress !== undefined) data.progress = progress;
    if (notes !== undefined) data.notes = notes;
    if (spent !== undefined) data.spent = spent;

    if (status === "in_progress" && !data.actualStart) {
      data.actualStart = new Date();
    }
    if (status === "completed") {
      data.actualEnd = new Date();
      data.progress = 100;
    }

    const unit = await prisma.compoundUnit.update({ where: { id: parseInt(req.params.unitId) }, data });
    res.json({ unit });
  } catch (e) {
    logger.error("Update unit error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ══════════════════════════════════════════════
// CHECKLIST ITEM STATUS (for compound units)
// ══════════════════════════════════════════════

router.patch("/:id/units/:unitId/items/:itemId", auth, async (req, res) => {
  try {
    const { action, notes } = req.body;
    const itemId = parseInt(req.params.itemId);
    const unitId = parseInt(req.params.unitId);

    const item = await prisma.unitChecklistItem.findUnique({ where: { id: itemId }, include: { stage: true } });
    if (!item) return res.status(404).json({ error: "البند غير موجود" });

    const data = {};

    if (action === "contractor_done") {
      data.contractorDone = true;
      data.contractorDate = new Date();
      data.contractorNotes = notes || null;
      data.status = "contractor_done";
    } else if (action === "inspector_approve") {
      data.inspectorApproved = true;
      data.inspectorDate = new Date();
      data.inspectorNotes = notes || null;
      data.status = "inspector_approved";
    } else if (action === "inspector_reject") {
      data.inspectorApproved = false;
      data.inspectorNotes = notes || null;
      data.status = "rejected";
      data.contractorDone = false;
    } else if (action === "developer_approve") {
      data.developerApproved = true;
      data.developerDate = new Date();
      data.developerNotes = notes || null;
      data.status = "completed";
    } else if (action === "developer_reject") {
      data.developerApproved = false;
      data.developerNotes = notes || null;
      data.status = "rejected";
      data.inspectorApproved = false;
      data.contractorDone = false;
    } else {
      return res.status(400).json({ error: "إجراء غير معروف" });
    }

    const updated = await prisma.unitChecklistItem.update({ where: { id: itemId }, data });

    // Recalculate stage progress
    const stageItems = await prisma.unitChecklistItem.findMany({ where: { stageId: item.stageId } });
    const completedItems = stageItems.filter(i => i.status === "completed").length;
    const stageProgress = stageItems.length > 0 ? Math.round(completedItems / stageItems.length * 100) : 0;

    await prisma.unitStage.update({
      where: { id: item.stageId },
      data: { progress: stageProgress, status: stageProgress === 100 ? "completed" : stageProgress > 0 ? "in_progress" : "pending" }
    });

    // Recalculate unit progress
    const unitProgress = await getUnitProgress(unitId);
    await prisma.compoundUnit.update({
      where: { id: unitId },
      data: { progress: unitProgress, status: unitProgress === 100 ? "completed" : unitProgress > 0 ? "in_progress" : "pending" }
    });

    res.json({ item: updated, stageProgress, unitProgress });
  } catch (e) {
    logger.error("Update checklist item error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ══════════════════════════════════════════════
// MATERIAL TRACKING (تتبع الكميات)
// ══════════════════════════════════════════════

router.get("/:id/quantities", auth, async (req, res) => {
  try {
    const compoundId = parseInt(req.params.id);
    const materials = await prisma.materialTracking.findMany({
      where: { compoundId },
      orderBy: { materialNameAr: "asc" }
    });

    // Aggregate by material name for compound-level summary
    const summary = {};
    for (const m of materials) {
      const key = m.materialNameAr;
      if (!summary[key]) {
        summary[key] = { materialNameAr: m.materialNameAr, materialNameEn: m.materialNameEn, unit: m.unit, plannedTotal: 0, usedTotal: 0, totalCost: 0 };
      }
      summary[key].plannedTotal += m.plannedQty;
      summary[key].usedTotal += m.usedQty;
      summary[key].totalCost += m.usedQty * m.costPerUnit;
    }

    res.json({ materials, summary: Object.values(summary) });
  } catch (e) {
    logger.error("Get quantities error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.get("/:id/units/:unitId/quantities", auth, async (req, res) => {
  try {
    const materials = await prisma.materialTracking.findMany({
      where: { compoundId: parseInt(req.params.id), unitId: parseInt(req.params.unitId) },
      orderBy: { materialNameAr: "asc" }
    });
    res.json({ materials });
  } catch (e) {
    logger.error("Get unit quantities error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/:id/units/:unitId/quantities", auth, async (req, res) => {
  try {
    const compoundId = parseInt(req.params.id);
    const unitId = parseInt(req.params.unitId);
    const { materials } = req.body;

    if (!materials || !Array.isArray(materials)) {
      return res.status(400).json({ error: "بيانات المواد مطلوبة" });
    }

    const created = [];
    for (const m of materials) {
      const record = await prisma.materialTracking.create({
        data: {
          compoundId, unitId,
          materialNameAr: m.materialNameAr,
          materialNameEn: m.materialNameEn || null,
          unit: m.unit || "piece",
          plannedQty: m.plannedQty || 0,
          usedQty: m.usedQty || 0,
          costPerUnit: m.costPerUnit || 0,
          stage: m.stage || null,
          notes: m.notes || null,
          updatedBy: req.user.id
        }
      });
      created.push(record);
    }

    res.status(201).json({ materials: created });
  } catch (e) {
    logger.error("Add quantities error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.patch("/:id/quantities/:materialId", auth, async (req, res) => {
  try {
    const { usedQty, notes } = req.body;
    const data = { updatedBy: req.user.id };
    if (usedQty !== undefined) data.usedQty = usedQty;
    if (notes !== undefined) data.notes = notes;

    const material = await prisma.materialTracking.update({ where: { id: parseInt(req.params.materialId) }, data });
    res.json({ material });
  } catch (e) {
    logger.error("Update quantity error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// Quantity alerts (materials exceeding planned)
router.get("/:id/quantities/alerts", auth, async (req, res) => {
  try {
    const materials = await prisma.materialTracking.findMany({
      where: { compoundId: parseInt(req.params.id) }
    });

    const alerts = materials
      .filter(m => m.plannedQty > 0 && m.usedQty > m.plannedQty)
      .map(m => ({
        id: m.id, unitId: m.unitId,
        materialNameAr: m.materialNameAr,
        planned: m.plannedQty, used: m.usedQty,
        overrun: Math.round((m.usedQty - m.plannedQty) / m.plannedQty * 100),
        unit: m.unit
      }));

    res.json({ alerts });
  } catch (e) {
    logger.error("Quantity alerts error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ══════════════════════════════════════════════
// QUALITY ISSUES (ملاحظات الجودة)
// ══════════════════════════════════════════════

router.get("/:id/quality-issues", auth, async (req, res) => {
  try {
    const compoundId = parseInt(req.params.id);
    const { status, priority, unitId } = req.query;

    const where = { compoundId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (unitId) where.unitId = parseInt(unitId);

    const issues = await prisma.qualityIssue.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { compoundUnit: { select: { unitNumber: true, block: true } } }
    });

    res.json({ issues });
  } catch (e) {
    logger.error("Get quality issues error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/:id/quality-issues", auth, async (req, res) => {
  try {
    const compoundId = parseInt(req.params.id);
    const { unitId, title, description, stage, priority, images, assignedTo, dueDate } = req.body;

    if (!title) return res.status(400).json({ error: "عنوان الملاحظة مطلوب" });

    const issue = await prisma.qualityIssue.create({
      data: {
        compoundId,
        unitId: unitId || null,
        title, description: description || null,
        stage: stage || null,
        priority: priority || "medium",
        images: images ? JSON.stringify(images) : null,
        reportedBy: req.user.id,
        assignedTo: assignedTo || null,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });

    // Notify developer about new quality issue
    const compound = await prisma.compound.findUnique({ where: { id: compoundId } });
    if (compound) {
      await notify(compound.developerId, "quality_new", "ملاحظة جودة جديدة", `${title} - المجمع: ${compound.nameAr}`);
    }

    res.status(201).json({ issue });
  } catch (e) {
    logger.error("Create quality issue error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.patch("/:id/quality-issues/:issueId", auth, async (req, res) => {
  try {
    const { status, resolution, inspectorNotes, assignedTo, priority } = req.body;
    const data = {};
    if (status) {
      data.status = status;
      if (status === "resolved" || status === "closed") data.resolvedAt = new Date();
    }
    if (resolution !== undefined) data.resolution = resolution;
    if (inspectorNotes !== undefined) data.inspectorNotes = inspectorNotes;
    if (assignedTo) data.assignedTo = assignedTo;
    if (priority) data.priority = priority;

    const issue = await prisma.qualityIssue.update({ where: { id: parseInt(req.params.issueId) }, data });
    res.json({ issue });
  } catch (e) {
    logger.error("Update quality issue error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.get("/:id/quality-issues/stats", auth, async (req, res) => {
  try {
    const compoundId = parseInt(req.params.id);
    const total = await prisma.qualityIssue.count({ where: { compoundId } });
    const open = await prisma.qualityIssue.count({ where: { compoundId, status: "open" } });
    const inProgress = await prisma.qualityIssue.count({ where: { compoundId, status: "in_progress" } });
    const resolved = await prisma.qualityIssue.count({ where: { compoundId, status: { in: ["resolved", "closed"] } } });
    const high = await prisma.qualityIssue.count({ where: { compoundId, priority: { in: ["high", "critical"] }, status: { in: ["open", "in_progress"] } } });

    res.json({ total, open, inProgress, resolved, high, closeRate: total > 0 ? Math.round(resolved / total * 100) : 0 });
  } catch (e) {
    logger.error("Quality stats error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ══════════════════════════════════════════════
// GAP ANALYSIS (تحليل الفجوات)
// ══════════════════════════════════════════════

router.get("/:id/gap-analysis", auth, async (req, res) => {
  try {
    const compoundId = parseInt(req.params.id);
    const units = await prisma.compoundUnit.findMany({ where: { compoundId } });

    // Schedule gaps
    const scheduleGaps = units
      .filter(u => u.plannedEnd && u.actualStart)
      .map(u => {
        const planned = u.plannedEnd ? new Date(u.plannedEnd) : null;
        const now = u.actualEnd ? new Date(u.actualEnd) : new Date();
        const gapDays = planned ? Math.round((now - planned) / (1000 * 60 * 60 * 24)) : 0;
        return {
          unitId: u.id, unitNumber: u.unitNumber, block: u.block,
          plannedEnd: u.plannedEnd, currentStatus: u.status,
          gapDays,
          status: gapDays > 7 ? "critical" : gapDays > 0 ? "warning" : "ok"
        };
      })
      .filter(g => g.gapDays !== 0)
      .sort((a, b) => b.gapDays - a.gapDays);

    // Budget gaps
    const budgetGaps = units
      .filter(u => u.budget > 0)
      .map(u => {
        const gap = u.budget > 0 ? Math.round((u.spent - u.budget) / u.budget * 100) : 0;
        return {
          unitId: u.id, unitNumber: u.unitNumber, block: u.block,
          planned: u.budget, actual: u.spent,
          gapPercentage: gap,
          status: gap > 5 ? "critical" : gap > 0 ? "warning" : "ok"
        };
      })
      .filter(g => g.gapPercentage !== 0)
      .sort((a, b) => b.gapPercentage - a.gapPercentage);

    // Quantity gaps
    const materials = await prisma.materialTracking.findMany({ where: { compoundId } });
    const matSummary = {};
    for (const m of materials) {
      const key = m.materialNameAr;
      if (!matSummary[key]) matSummary[key] = { materialNameAr: key, unit: m.unit, planned: 0, used: 0 };
      matSummary[key].planned += m.plannedQty;
      matSummary[key].used += m.usedQty;
    }
    const quantityGaps = Object.values(matSummary)
      .map(m => {
        const gap = m.planned > 0 ? Math.round((m.used - m.planned) / m.planned * 100) : 0;
        return { ...m, gapPercentage: gap, status: gap > 5 ? "critical" : gap > 0 ? "warning" : "ok" };
      })
      .filter(g => g.gapPercentage !== 0)
      .sort((a, b) => b.gapPercentage - a.gapPercentage);

    // Recommendations
    const recommendations = [];
    if (scheduleGaps.filter(g => g.status === "critical").length > 0) {
      recommendations.push("مراجعة أسباب التأخر في الوحدات المتأخرة واتخاذ إجراء تصحيحي");
    }
    if (budgetGaps.filter(g => g.status === "critical").length > 0) {
      recommendations.push("مراجعة الوحدات التي تجاوزت الميزانية وتحديد أسباب التجاوز");
    }
    if (quantityGaps.filter(g => g.status === "critical").length > 0) {
      recommendations.push("مراجعة استهلاك المواد الزائد عن المخطط وتحسين التقديرات");
    }

    res.json({ scheduleGaps, budgetGaps, quantityGaps, recommendations });
  } catch (e) {
    logger.error("Gap analysis error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ══════════════════════════════════════════════
// SUPERVISORS (إدارة المشرفين)
// ══════════════════════════════════════════════

router.get("/:id/supervisors", auth, async (req, res) => {
  try {
    const supervisors = await prisma.compoundSupervisor.findMany({
      where: { compoundId: parseInt(req.params.id) }
    });
    res.json({ supervisors });
  } catch (e) {
    logger.error("Get supervisors error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/:id/supervisors", auth, requireRole("developer"), async (req, res) => {
  try {
    const compoundId = parseInt(req.params.id);
    const { userId, role, assignedUnits, permissions } = req.body;

    if (!userId) return res.status(400).json({ error: "معرف المشرف مطلوب" });

    const compound = await prisma.compound.findUnique({ where: { id: compoundId } });
    if (!compound || compound.developerId !== req.user.id) {
      return res.status(403).json({ error: "ليس لديك صلاحية" });
    }

    const supervisor = await prisma.compoundSupervisor.create({
      data: {
        compoundId, userId,
        role: role || "site_supervisor",
        assignedUnits: assignedUnits ? JSON.stringify(assignedUnits) : null,
        permissions: permissions ? JSON.stringify(permissions) : null
      }
    });

    res.status(201).json({ supervisor });
  } catch (e) {
    if (e.code === "P2002") return res.status(409).json({ error: "المشرف مضاف مسبقاً لهذا المجمع" });
    logger.error("Add supervisor error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.patch("/:id/supervisors/:supId", auth, requireRole("developer"), async (req, res) => {
  try {
    const { assignedUnits, permissions, isActive, role } = req.body;
    const data = {};
    if (assignedUnits) data.assignedUnits = JSON.stringify(assignedUnits);
    if (permissions) data.permissions = JSON.stringify(permissions);
    if (isActive !== undefined) data.isActive = isActive;
    if (role) data.role = role;

    const supervisor = await prisma.compoundSupervisor.update({ where: { id: parseInt(req.params.supId) }, data });
    res.json({ supervisor });
  } catch (e) {
    logger.error("Update supervisor error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.delete("/:id/supervisors/:supId", auth, requireRole("developer"), async (req, res) => {
  try {
    await prisma.compoundSupervisor.delete({ where: { id: parseInt(req.params.supId) } });
    res.json({ message: "تم إزالة المشرف بنجاح" });
  } catch (e) {
    logger.error("Delete supervisor error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ══════════════════════════════════════════════
// COMPOUND PAYMENTS (دفعات المجمع)
// ══════════════════════════════════════════════

router.get("/:id/payments", auth, async (req, res) => {
  try {
    const payments = await prisma.compoundPayment.findMany({
      where: { compoundId: parseInt(req.params.id) },
      orderBy: { createdAt: "desc" }
    });

    const totalPaid = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
    const totalPending = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);

    res.json({ payments, summary: { totalPaid, totalPending } });
  } catch (e) {
    logger.error("Get payments error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/:id/payments", auth, requireRole("developer"), async (req, res) => {
  try {
    const compoundId = parseInt(req.params.id);
    const { stageNameAr, stageNameEn, amount, percentage, type, notes } = req.body;

    if (!amount || amount <= 0) return res.status(400).json({ error: "المبلغ مطلوب" });

    const payment = await prisma.compoundPayment.create({
      data: {
        compoundId,
        stageNameAr: stageNameAr || null,
        stageNameEn: stageNameEn || null,
        amount, percentage: percentage || null,
        type: type || "bulk",
        notes: notes || null
      }
    });

    res.status(201).json({ payment });
  } catch (e) {
    logger.error("Create payment error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.patch("/:id/payments/:paymentId", auth, requireRole("developer"), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const data = {};
    if (status) {
      data.status = status;
      if (status === "paid") {
        data.paidAt = new Date();
        data.approvedBy = req.user.id;
      }
    }
    if (notes !== undefined) data.notes = notes;

    const payment = await prisma.compoundPayment.update({ where: { id: parseInt(req.params.paymentId) }, data });
    res.json({ payment });
  } catch (e) {
    logger.error("Update payment error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ══════════════════════════════════════════════
// REPORTS (التقارير)
// ══════════════════════════════════════════════

router.get("/:id/reports/progress", auth, async (req, res) => {
  try {
    const compoundId = parseInt(req.params.id);
    const compound = await prisma.compound.findUnique({ where: { id: compoundId } });
    const units = await prisma.compoundUnit.findMany({
      where: { compoundId },
      orderBy: { unitNumber: "asc" },
      include: { stages: { orderBy: { orderNum: "asc" }, select: { nameAr: true, progress: true, status: true } } }
    });

    const overallProgress = await getCompoundProgress(compoundId);

    // Stage-level progress across all units
    const stageNames = DEFAULT_STAGES.map(s => s.name);
    const stageProgress = stageNames.map(name => {
      const stagesOfType = units.flatMap(u => u.stages.filter(s => s.nameAr === name));
      const avg = stagesOfType.length > 0 ? Math.round(stagesOfType.reduce((sum, s) => sum + s.progress, 0) / stagesOfType.length) : 0;
      return { stageName: name, averageProgress: avg, totalUnits: stagesOfType.length, completed: stagesOfType.filter(s => s.status === "completed").length };
    });

    res.json({
      compound: { id: compound.id, nameAr: compound.nameAr, compoundNumber: compound.compoundNumber },
      overallProgress,
      unitProgress: units.map(u => ({ unitNumber: u.unitNumber, block: u.block, progress: u.progress, status: u.status })),
      stageProgress,
      generatedAt: new Date().toISOString()
    });
  } catch (e) {
    logger.error("Progress report error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.get("/:id/reports/financial", auth, async (req, res) => {
  try {
    const compoundId = parseInt(req.params.id);
    const compound = await prisma.compound.findUnique({ where: { id: compoundId } });
    const units = await prisma.compoundUnit.findMany({ where: { compoundId }, orderBy: { unitNumber: "asc" } });
    const payments = await prisma.compoundPayment.findMany({ where: { compoundId } });

    const totalSpent = units.reduce((sum, u) => sum + u.spent, 0);
    const totalPaid = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);

    res.json({
      budget: { total: compound.totalBudget, spent: totalSpent, remaining: compound.totalBudget - totalSpent },
      unitBudgets: units.map(u => ({
        unitNumber: u.unitNumber, block: u.block,
        budget: u.budget, spent: u.spent,
        variance: u.budget > 0 ? Math.round((u.spent - u.budget) / u.budget * 100) : 0
      })),
      payments: { totalPaid, totalPending: payments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0) },
      generatedAt: new Date().toISOString()
    });
  } catch (e) {
    logger.error("Financial report error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.get("/:id/reports/quality", auth, async (req, res) => {
  try {
    const compoundId = parseInt(req.params.id);
    const issues = await prisma.qualityIssue.findMany({
      where: { compoundId },
      include: { compoundUnit: { select: { unitNumber: true } } }
    });

    const byUnit = {};
    const byStage = {};
    for (const i of issues) {
      const uKey = i.compoundUnit?.unitNumber || "عام";
      if (!byUnit[uKey]) byUnit[uKey] = { total: 0, open: 0, resolved: 0 };
      byUnit[uKey].total++;
      if (i.status === "open" || i.status === "in_progress") byUnit[uKey].open++;
      else byUnit[uKey].resolved++;

      const sKey = i.stage || "غير محدد";
      if (!byStage[sKey]) byStage[sKey] = 0;
      byStage[sKey]++;
    }

    res.json({
      total: issues.length,
      open: issues.filter(i => i.status === "open").length,
      inProgress: issues.filter(i => i.status === "in_progress").length,
      resolved: issues.filter(i => i.status === "resolved" || i.status === "closed").length,
      byUnit: Object.entries(byUnit).map(([unit, data]) => ({ unit, ...data })),
      byStage: Object.entries(byStage).map(([stage, count]) => ({ stage, count })).sort((a, b) => b.count - a.count),
      generatedAt: new Date().toISOString()
    });
  } catch (e) {
    logger.error("Quality report error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

module.exports = router;
