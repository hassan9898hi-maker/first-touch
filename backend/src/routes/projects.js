const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { auth, requireRole } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { createProjectSchema, quotationSchema, inspectorApplySchema, contractorSubmitSchema, inspectorReviewSchema, ownerDecisionSchema } = require("../utils/validators");
const { notify, notifyRole } = require("../services/notification");
const { sendPaymentNotification, sendContractEmail, sendNewProjectNotification, sendQuotationNotification } = require("../services/email");
const { analyzeProject, matchContractors } = require("../services/ai");
const upload = require("../middleware/upload");
const { processUploadedFiles } = require("../middleware/upload");
const logger = require("../utils/logger");
const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const prisma = new PrismaClient();

// ═══════ Helper: compute project completion ═══════
async function getCompletion(projectId) {
  const total = await prisma.checklistItem.count({ where: { subStage: { stage: { projectId } } } });
  const done = await prisma.checklistItem.count({ where: { ownerDone: true, ownerApproved: true, subStage: { stage: { projectId } } } });
  return total > 0 ? Math.round(done / total * 100) : 0;
}

// ═══════ Helper: create default construction stages ═══════
async function createDefaultStages(projectId, budget) {
  const b = budget || 100000;
  const defs = [
    { name: "الأساسات والقواعد", en: "Foundation", pct: 0.20 },
    { name: "الهيكل الخرساني", en: "Structure", pct: 0.30 },
    { name: "الأعمال الكهربائية", en: "Electrical", pct: 0.15 },
    { name: "السباكة والصرف", en: "Plumbing", pct: 0.12 },
    { name: "التشطيبات والدهانات", en: "Finishing", pct: 0.23 }
  ];
  for (let i = 0; i < defs.length; i++) {
    const s = defs[i];
    const stageBudget = Math.round(b * s.pct);
    const stage = await prisma.stage.create({
      data: { projectId, nameAr: s.name, nameEn: s.en, orderNum: i + 1, budget: stageBudget, status: i === 0 ? "active" : "locked" }
    });
    const sub = await prisma.subStage.create({
      data: { stageId: stage.id, nameAr: s.name + " — أعمال عامة", orderNum: 1 }
    });
    await prisma.checklistItem.createMany({ data: [
      { subStageId: sub.id, textAr: "تجهيز المواد والمعدات", orderNum: 1, cost: Math.round(stageBudget * 0.3) },
      { subStageId: sub.id, textAr: "تنفيذ الأعمال الرئيسية", orderNum: 2, cost: Math.round(stageBudget * 0.5) },
      { subStageId: sub.id, textAr: "فحص واعتماد الأعمال", orderNum: 3, cost: Math.round(stageBudget * 0.2) }
    ]});
  }
}

// ═══════ GET COMPLETED PROJECTS (Public showcase) ═══════
router.get("/completed", async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { status: "completed" },
      orderBy: { completedAt: "desc" },
      take: 20,
      include: {
        contractor: { select: { id: true, nameAr: true, companyNameAr: true, rating: true, profileImage: true, totalProjects: true } },
        images: { take: 3, orderBy: { isPrimary: "desc" } },
        ratings: { select: { rating: true } }
      }
    });

    const result = projects.map(p => ({
      id: p.id,
      titleAr: p.titleAr,
      type: p.type,
      areaSqm: p.areaSqm,
      locationAr: p.locationAr,
      completedAt: p.completedAt,
      contractor: p.contractor,
      images: p.images.map(i => i.imageUrl),
      avgRating: p.ratings.length ? (p.ratings.reduce((a, r) => a + r.rating, 0) / p.ratings.length).toFixed(1) : null,
      ratingsCount: p.ratings.length
    }));

    res.json({ projects: result });
  } catch (e) {
    logger.error("Get completed projects error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ BANK FINANCING REQUEST ═══════
router.post("/bank-request", auth, requireRole("owner"), async (req, res) => {
  try {
    const { bankName, amount, durationYears, purpose, projectId } = req.body;
    if (!bankName || !amount) return res.status(400).json({ error: "بيانات ناقصة" });

    const request = await prisma.bankRequest.create({
      data: {
        userId: req.user.id,
        projectId: projectId ? Number(projectId) : null,
        bankName,
        amount: Number(amount),
        durationYears: Number(durationYears) || 15,
        purpose: purpose || null,
        status: "pending"
      }
    });

    // Notify admin
    const admins = await prisma.user.findMany({ where: { isAdmin: true }, select: { id: true } });
    for (const a of admins) {
      await prisma.notification.create({
        data: {
          userId: a.id,
          type: "bank_request",
          titleAr: "طلب تمويل بنكي جديد",
          messageAr: `طلب تمويل من ${req.user.id} — ${bankName} — ${amount} د.ب`
        }
      });
    }

    logger.info("Bank request created", { requestId: request.id, userId: req.user.id });
    res.status(201).json({ success: true, message: "تم تقديم طلب التمويل بنجاح — سيتم مراجعته خلال 3-5 أيام عمل", requestId: request.id });
  } catch (e) {
    logger.error("Bank request error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ GET MY BANK REQUESTS ═══════
router.get("/bank-requests", auth, requireRole("owner"), async (req, res) => {
  try {
    const requests = await prisma.bankRequest.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });
    res.json({ requests });
  } catch (e) {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ GET ALL PROJECTS ═══════
router.get("/", auth, async (req, res) => {
  try {
    const uid = req.user.id;
    const role = req.user.role;
    let where;

    if (role === "owner") {
      where = { ownerId: uid };
    } else if (role === "contractor") {
      where = { OR: [{ contractorId: uid }, { status: "awaiting_pricing" }, { status: "new", contractorId: null }] };
    } else {
      where = { OR: [{ inspectorId: uid }, { status: "awaiting_pricing" }, { status: "new", inspectorId: null }] };
    }

    const projects = await prisma.project.findMany({
      where, orderBy: { createdAt: "desc" },
      include: {
        contractor: { select: { nameAr: true, companyNameAr: true } },
        inspector: { select: { nameAr: true } }
      }
    });

    const result = await Promise.all(projects.map(async (p) => {
      const pct = await getCompletion(p.id);
      return {
        ...p, completion_percentage: pct,
        contractor_name: p.contractor?.nameAr, contractor_company: p.contractor?.companyNameAr,
        inspector_name: p.inspector?.nameAr
      };
    }));

    res.json({ projects: result });
  } catch (e) {
    logger.error("Get projects error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ AI: ANALYZE PROJECT FILE ═══════
router.post("/ai-analyze", auth, requireRole("owner"), upload.single("file"), processUploadedFiles, async (req, res) => {
  try {
    const { description, goals } = req.body;
    if (!description || !description.trim()) {
      return res.status(400).json({ error: "يرجى كتابة وصف المشروع وأهدافه" });
    }

    let fileText = "";

    if (req.file) {
      const mime = req.file.mimetype;
      // Extract text from file
      if (mime === "application/pdf") {
        // For PDF files — use pdf-parse
        try {
          const { PDFParse } = require("pdf-parse");
          const pdfParser = new PDFParse();
          const buf = req.file.buffer || fs.readFileSync(req.file.path);
          const result = await pdfParser.parseBuffer(buf);
          fileText = result.pages.map(p => p.lines.map(l => l.text || "").join(" ")).join("\n");
        } catch (pdfErr) {
          logger.warn("PDF parse failed, continuing without file text", { error: pdfErr.message });
          fileText = "[ملف PDF — لم يتم استخراج النص]";
        }
      } else if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        // For DOCX files — use mammoth
        try {
          const buf = req.file.buffer || fs.readFileSync(req.file.path);
          const result = await mammoth.extractRawText({ buffer: buf });
          fileText = result.value;
        } catch (docErr) {
          logger.warn("DOCX parse failed", { error: docErr.message });
          fileText = "[ملف Word — لم يتم استخراج النص]";
        }
      } else {
        fileText = "[ملف مرفق: " + req.file.originalname + "]";
      }
    }

    // Call AI analysis
    const analysis = await analyzeProject(fileText, description, goals);

    // Match contractors
    const matchedContractors = await matchContractors(prisma, analysis);

    logger.info("AI project analysis completed", { userId: req.user.id, projectName: analysis.projectName });
    res.json({
      success: true,
      analysis,
      matchedContractors: matchedContractors.slice(0, 10)
    });
  } catch (e) {
    logger.error("AI analysis error", { error: e.message, stack: e.stack });
    res.status(500).json({ error: e.message || "خطأ في تحليل المشروع" });
  }
});

// ═══════ AI: CREATE PROJECT FROM ANALYSIS ═══════
router.post("/ai-create", auth, requireRole("owner"), async (req, res) => {
  try {
    const { analysis } = req.body;
    if (!analysis || !analysis.projectName) {
      return res.status(400).json({ error: "بيانات التحليل مفقودة" });
    }

    const a = analysis;
    const budget = a.estimatedBudget || 0;

    // Create the project
    const project = await prisma.project.create({
      data: {
        titleAr: a.projectName,
        type: a.projectType || "commercial",
        areaSqm: a.areaSqm || 0,
        floors: a.floors || 1,
        locationAr: a.location || "",
        totalBudget: budget,
        status: "awaiting_pricing",
        ownerId: req.user.id,
        hasDesigns: true,
        needsDesign: false,
        descriptionAr: a.description,
        ownerConditions: a.ownerConditions
      }
    });

    // Create AI-generated stages
    if (a.stages && a.stages.length > 0) {
      for (const stg of a.stages) {
        const stageBudget = Math.round(budget * (stg.budgetPercent || 0));
        const stage = await prisma.stage.create({
          data: {
            projectId: project.id,
            nameAr: stg.nameAr,
            nameEn: stg.nameEn || "",
            orderNum: stg.order || 0,
            budget: stageBudget,
            status: stg.order === 1 ? "active" : "locked"
          }
        });

        // Create sub-stages and items
        if (stg.subStages && stg.subStages.length > 0) {
          for (let si = 0; si < stg.subStages.length; si++) {
            const ss = stg.subStages[si];
            const subStage = await prisma.subStage.create({
              data: { stageId: stage.id, nameAr: ss.nameAr, orderNum: si + 1 }
            });

            if (ss.items && ss.items.length > 0) {
              await prisma.checklistItem.createMany({
                data: ss.items.map(function (item, idx) {
                  return {
                    subStageId: subStage.id,
                    textAr: item.textAr,
                    orderNum: idx + 1,
                    cost: item.estimatedCost || 0
                  };
                })
              });
            }
          }
        }
      }
    }

    // Notify contractors & inspectors
    const owner = await prisma.user.findUnique({ where: { id: req.user.id }, select: { nameAr: true } });
    const projectData = {
      title: a.projectName, location: a.location, type: a.projectType,
      area: a.areaSqm, budget: budget, ownerName: owner?.nameAr || "صاحب المشروع",
      ownerConditions: a.ownerConditions, description: a.description
    };

    const contractors = await prisma.user.findMany({
      where: { OR: [{ role: "contractor" }, { roles: { contains: "contractor" } }] },
      select: { id: true, email: true, nameAr: true }
    });
    for (const c of contractors) {
      notify(c.id, "info", "مشروع جديد متاح للتسعير", a.projectName + " — " + (a.location || "")).catch(() => {});
      sendNewProjectNotification(c.email, c.nameAr, projectData).catch(() => {});
    }

    const inspectors = await prisma.user.findMany({
      where: { OR: [{ role: "inspector" }, { roles: { contains: "inspector" } }] },
      select: { id: true, email: true, nameAr: true }
    });
    for (const ins of inspectors) {
      notify(ins.id, "info", "مشروع جديد يحتاج مفتش", a.projectName + " — " + (a.location || "")).catch(() => {});
    }

    logger.info("AI project created", { projectId: project.id, ownerId: req.user.id, stages: a.stages?.length || 0 });
    res.status(201).json({ success: true, message: "تم إنشاء المشروع بنجاح بواسطة الذكاء الاصطناعي", project_id: project.id });
  } catch (e) {
    logger.error("AI create project error", { error: e.message });
    res.status(500).json({ error: "خطأ في إنشاء المشروع" });
  }
});

// ═══════ CREATE PROJECT (Owner) ═══════
router.post("/", auth, requireRole("owner"), validate(createProjectSchema), async (req, res) => {
  try {
    const d = req.validated;
    const status = d.hasDesigns ? "awaiting_pricing" : "design_required";

    const project = await prisma.project.create({
      data: {
        titleAr: d.titleAr, type: d.type, areaSqm: d.areaSqm, floors: d.floors,
        locationAr: d.locationAr, totalBudget: d.totalBudget, status,
        ownerId: req.user.id, hasDesigns: d.hasDesigns, needsDesign: !d.hasDesigns,
        descriptionAr: d.descriptionAr,
        ownerConditions: d.ownerConditions
      }
    });

    // If no designs → create design stage
    if (!d.hasDesigns) {
      const stage = await prisma.stage.create({
        data: { projectId: project.id, nameAr: "التصميم والمخططات", nameEn: "Design & Plans", orderNum: 0, status: "active" }
      });
      const sub = await prisma.subStage.create({
        data: { stageId: stage.id, nameAr: "التصميم المعماري", nameEn: "Architectural Design", orderNum: 1 }
      });
      await prisma.checklistItem.createMany({ data: [
        { subStageId: sub.id, textAr: "إعداد المخططات المعمارية", orderNum: 1 },
        { subStageId: sub.id, textAr: "إعداد المخططات الإنشائية", orderNum: 2 },
        { subStageId: sub.id, textAr: "إعداد مخططات الكهرباء والسباكة", orderNum: 3 },
        { subStageId: sub.id, textAr: "اعتماد المخططات النهائية", orderNum: 4 }
      ]});
    }

    // Notify contractors & inspectors (in-app + email)
    const owner = await prisma.user.findUnique({ where: { id: req.user.id }, select: { nameAr: true } });
    const projectData = {
      title: d.titleAr, location: d.locationAr, type: d.type,
      area: d.areaSqm, budget: d.totalBudget, ownerName: owner?.nameAr || "صاحب المشروع",
      ownerConditions: d.ownerConditions, description: d.descriptionAr
    };

    // Notify all contractors
    const contractors = await prisma.user.findMany({
      where: { OR: [{ role: "contractor" }, { roles: { contains: "contractor" } }] },
      select: { id: true, email: true, nameAr: true }
    });
    for (const c of contractors) {
      notify(c.id, "info", "مشروع جديد متاح للتسعير", d.titleAr + " — " + (d.locationAr || "")).catch(() => {});
      sendNewProjectNotification(c.email, c.nameAr, projectData).catch(() => {});
    }

    // Notify all inspectors
    const inspectors = await prisma.user.findMany({
      where: { OR: [{ role: "inspector" }, { roles: { contains: "inspector" } }] },
      select: { id: true, email: true, nameAr: true }
    });
    for (const ins of inspectors) {
      notify(ins.id, "info", "مشروع جديد يحتاج مفتش", d.titleAr + " — " + (d.locationAr || "")).catch(() => {});
      sendNewProjectNotification(ins.email, ins.nameAr, { ...projectData, ownerConditions: null }).catch(() => {});
    }

    logger.info("Project created", { projectId: project.id, ownerId: req.user.id });
    res.status(201).json({ success: true, message: "تم إنشاء المشروع", project_id: project.id });
  } catch (e) {
    logger.error("Create project error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ GET SINGLE PROJECT ═══════
router.get("/:id", auth, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        contractor: { select: { nameAr: true, companyNameAr: true, rating: true } },
        inspector: { select: { nameAr: true, specialty: true, rating: true } },
        stages: {
          orderBy: { orderNum: "asc" },
          include: {
            files: { orderBy: { uploadedAt: "desc" } },
            subStages: {
              orderBy: { orderNum: "asc" },
              include: { items: { orderBy: { orderNum: "asc" }, include: { files: true, comments: { orderBy: { createdAt: "asc" }, include: { user: { select: { nameAr: true, role: true } } } } } } }
            }
          }
        },
        quotations: {
          orderBy: { createdAt: "desc" },
          include: { contractor: { select: { nameAr: true, companyNameAr: true, rating: true } } }
        },
        inspectorApps: {
          orderBy: { createdAt: "desc" },
          include: { inspector: { select: { nameAr: true, specialty: true, rating: true } } }
        }
      }
    });
    if (!project) return res.status(404).json({ error: "المشروع غير موجود" });

    const pct = await getCompletion(project.id);

    // Reshape for frontend compatibility (convert camelCase → snake_case for files)
    const normalizeFile = f => ({
      id: f.id, item_id: f.itemId,
      file_name: f.fileName, file_path: f.filePath,
      file_type: f.fileType, file_size: f.fileSize,
      role: f.role, uploaded_at: f.uploadedAt
    });
    const normalizeComment = c => ({
      id: c.id, item_id: c.itemId, user_id: c.userId,
      text: c.text, created_at: c.createdAt,
      user_name: c.user?.nameAr, user_role: c.user?.role
    });
    const normalizeStageFile = f => ({
      id: f.id, stage_id: f.stageId,
      file_name: f.fileName, file_path: f.filePath,
      file_type: f.fileType, file_size: f.fileSize,
      role: f.role, uploaded_by: f.uploadedBy, uploaded_at: f.uploadedAt
    });
    const stagesData = project.stages.map(st => ({
      ...st, stage_files: (st.files || []).map(normalizeStageFile), sub_stages: st.subStages.map(ss => ({
        sub_stage: ss,
        items: ss.items.map(it => ({
          ...it,
          contractor_done: it.contractorDone ? 1 : 0,
          contractor_notes: it.contractorNotes,
          contractor_date: it.contractorDate,
          inspector_done: it.inspectorDone ? 1 : 0,
          inspector_approved: it.inspectorApproved ? 1 : 0,
          inspector_notes: it.inspectorNotes,
          inspector_date: it.inspectorDate,
          owner_done: it.ownerDone ? 1 : 0,
          owner_approved: it.ownerApproved ? 1 : 0,
          owner_date: it.ownerDate,
          text_ar: it.textAr,
          files: (it.files || []).map(normalizeFile),
          comments: (it.comments || []).map(normalizeComment)
        }))
      }))
    }));
    const quots = project.quotations.map(q => ({
      ...q, contractor_name: q.contractor?.nameAr, company_name_ar: q.contractor?.companyNameAr, rating: q.contractor?.rating
    }));
    const iApps = project.inspectorApps.map(ia => ({
      ...ia, name_ar: ia.inspector?.nameAr, specialty: ia.inspector?.specialty, rating: ia.inspector?.rating
    }));

    res.json({
      project: {
        ...project, completion_percentage: pct,
        contractor_name: project.contractor?.nameAr, contractor_company: project.contractor?.companyNameAr, contractor_rating: project.contractor?.rating,
        inspector_name: project.inspector?.nameAr, inspector_specialty: project.inspector?.specialty, inspector_rating: project.inspector?.rating
      },
      stages: stagesData,
      quotations: quots,
      inspector_applications: iApps
    });
  } catch (e) {
    logger.error("Get project error", { error: e.message, projectId: req.params.id });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ UPLOAD FILES TO STAGE ═══════
router.post("/stages/:stageId/files", auth, upload.array("files", 10), processUploadedFiles, async (req, res) => {
  try {
    const stageId = parseInt(req.params.stageId);
    const stage = await prisma.stage.findUnique({ where: { id: stageId }, include: { project: true } });
    if (!stage) return res.status(404).json({ error: "المرحلة غير موجودة" });

    // Check access
    const p = stage.project;
    const uid = req.user.id;
    if (p.ownerId !== uid && p.contractorId !== uid && p.inspectorId !== uid) {
      return res.status(403).json({ error: "ليس لديك صلاحية رفع ملفات لهذه المرحلة" });
    }

    const files = req.files || [];
    if (files.length === 0) return res.status(400).json({ error: "لم يتم اختيار ملفات" });

    const records = [];
    for (const file of files) {
      const isImg = file.mimetype.startsWith("image/");
      const isVid = file.mimetype.startsWith("video/");
      const fType = isImg ? "image" : isVid ? "video" : "document";
      const record = await prisma.stageFile.create({
        data: {
          stageId, fileName: file.originalname, filePath: file.fileUrl || file.path || null,
          fileType: fType, fileSize: file.size || null,
          uploadedBy: uid, role: req.user.role
        }
      });
      records.push(record);
    }

    logger.info("Stage files uploaded", { stageId, count: records.length, userId: uid });
    res.status(201).json({
      success: true,
      message: "تم رفع " + records.length + " ملف بنجاح",
      files: records.map(f => ({
        id: f.id, file_name: f.fileName, file_path: f.filePath,
        file_type: f.fileType, file_size: f.fileSize, role: f.role, uploaded_at: f.uploadedAt
      }))
    });
  } catch (e) {
    logger.error("Stage file upload error", { error: e.message });
    res.status(500).json({ error: "خطأ في رفع الملفات" });
  }
});

// ═══════ DELETE STAGE FILE ═══════
router.delete("/stage-files/:fileId", auth, async (req, res) => {
  try {
    const fileId = parseInt(req.params.fileId);
    const file = await prisma.stageFile.findUnique({ where: { id: fileId }, include: { stage: { include: { project: true } } } });
    if (!file) return res.status(404).json({ error: "الملف غير موجود" });

    // Only uploader or project owner can delete
    if (file.uploadedBy !== req.user.id && file.stage.project.ownerId !== req.user.id) {
      return res.status(403).json({ error: "ليس لديك صلاحية حذف هذا الملف" });
    }

    await prisma.stageFile.delete({ where: { id: fileId } });
    res.json({ success: true, message: "تم حذف الملف" });
  } catch (e) {
    logger.error("Delete stage file error", { error: e.message });
    res.status(500).json({ error: "خطأ في حذف الملف" });
  }
});

// ═══════ GET ALL PROJECT FILES (complete file for download) ═══════
router.get("/:id/all-files", auth, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        stages: {
          orderBy: { orderNum: "asc" },
          include: {
            files: { orderBy: { uploadedAt: "desc" } },
            subStages: {
              orderBy: { orderNum: "asc" },
              include: { items: { orderBy: { orderNum: "asc" }, include: { files: true } } }
            }
          }
        }
      }
    });
    if (!project) return res.status(404).json({ error: "المشروع غير موجود" });

    // Build a structured file tree
    const fileTree = project.stages.map(st => {
      const stageFiles = (st.files || []).map(f => ({
        id: f.id, file_name: f.fileName, file_path: f.filePath,
        file_type: f.fileType, file_size: f.fileSize, role: f.role, uploaded_at: f.uploadedAt, source: "stage"
      }));

      const itemFiles = [];
      (st.subStages || []).forEach(ss => {
        (ss.items || []).forEach(item => {
          (item.files || []).forEach(f => {
            itemFiles.push({
              id: f.id, file_name: f.fileName, file_path: f.filePath,
              file_type: f.fileType, file_size: f.fileSize, role: f.role, uploaded_at: f.uploadedAt,
              source: "item", item_name: item.textAr, sub_stage_name: ss.nameAr
            });
          });
        });
      });

      return {
        stage_id: st.id, stage_name: st.nameAr, stage_name_en: st.nameEn,
        stage_files: stageFiles, item_files: itemFiles,
        total_files: stageFiles.length + itemFiles.length
      };
    });

    const totalFiles = fileTree.reduce((acc, st) => acc + st.total_files, 0);

    res.json({
      project_id: projectId,
      project_name: project.titleAr,
      total_files: totalFiles,
      stages: fileTree
    });
  } catch (e) {
    logger.error("Get all project files error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ AWAITING PRICING PROJECTS ═══════
router.get("-awaiting", auth, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { status: { in: ["awaiting_pricing", "design_required", "new"] } },
      orderBy: { createdAt: "desc" },
      include: { owner: { select: { nameAr: true } } }
    });
    const result = await Promise.all(projects.map(async (p) => {
      const [qc, ic] = await Promise.all([
        prisma.quotation.count({ where: { projectId: p.id } }),
        prisma.inspectorApplication.count({ where: { projectId: p.id } })
      ]);
      return { ...p, owner_name: p.owner?.nameAr, quotation_count: qc, inspector_count: ic };
    }));
    res.json({ projects: result });
  } catch (e) {
    logger.error("Get awaiting projects error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ SUBMIT QUOTATION (Contractor) ═══════
router.post("/:id/quotation", auth, requireRole("contractor"), validate(quotationSchema), async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = await prisma.project.findFirst({ where: { id: projectId, status: { in: ["awaiting_pricing", "new", "design_required"] } } });
    if (!project) return res.status(404).json({ error: "المشروع غير متاح للتسعير" });

    const existing = await prisma.quotation.findFirst({ where: { projectId, contractorId: req.user.id } });
    if (existing) return res.status(409).json({ error: "لديك عرض سعر مقدم مسبقاً" });

    const d = req.validated;
    const boqData = d.boqItems ? JSON.stringify(d.boqItems) : JSON.stringify(d.breakdown || {});
    await prisma.quotation.create({
      data: {
        projectId, contractorId: req.user.id, price: d.price,
        durationMonths: d.durationMonths, warrantyMonths: d.warrantyMonths || null,
        notes: d.notes, breakdown: boqData
      }
    });

    // In-app notification to owner
    notify(project.ownerId, "info", "عرض سعر جديد", "تم استلام عرض سعر لمشروع " + project.titleAr).catch(() => {});

    // Email notification to owner
    const owner = await prisma.user.findUnique({ where: { id: project.ownerId }, select: { nameAr: true, email: true } });
    const contractor = await prisma.user.findUnique({ where: { id: req.user.id }, select: { nameAr: true, companyNameAr: true } });
    if (owner?.email) {
      sendQuotationNotification(owner.email, owner.nameAr, contractor?.nameAr, contractor?.companyNameAr, project.titleAr, d.price, d.durationMonths).catch(() => {});
    }

    logger.info("Quotation submitted", { projectId, contractorId: req.user.id });
    res.status(201).json({ success: true, message: "تم تقديم عرض السعر" });
  } catch (e) {
    logger.error("Quotation error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ ACCEPT QUOTATION (Owner) — sends contract email to all parties ═══════
router.post("/quotations/:id/accept", auth, requireRole("owner"), async (req, res) => {
  try {
    const q = await prisma.quotation.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        project: { include: { owner: { select: { nameAr: true, email: true } } } },
        contractor: { select: { nameAr: true, companyNameAr: true, email: true } }
      }
    });
    if (!q || q.project.ownerId !== req.user.id) return res.status(404).json({ error: "العرض غير موجود" });

    await prisma.$transaction(async (tx) => {
      await tx.quotation.update({ where: { id: q.id }, data: { status: "accepted" } });
      await tx.quotation.updateMany({ where: { projectId: q.projectId, id: { not: q.id } }, data: { status: "rejected" } });
      await tx.project.update({ where: { id: q.projectId }, data: { contractorId: q.contractorId, status: "active", totalBudget: q.price } });
    });

    const stageCount = await prisma.stage.count({ where: { projectId: q.projectId } });
    if (stageCount === 0) await createDefaultStages(q.projectId, q.price);

    // Notify contractor in-app
    notify(q.contractorId, "success", "تم قبول عرضك", "تمت الموافقة على عرضك لمشروع " + q.project.titleAr).catch(() => {});

    // Parse BOQ items
    let boqItems = [];
    try { boqItems = JSON.parse(q.breakdown || "[]"); } catch (e) { /* ignore */ }

    const contractData = {
      projectTitle: q.project.titleAr,
      projectType: q.project.type,
      projectLocation: q.project.locationAr,
      projectArea: q.project.areaSqm,
      projectFloors: q.project.floors,
      ownerName: q.project.owner?.nameAr || "صاحب المشروع",
      ownerEmail: q.project.owner?.email,
      contractorName: q.contractor?.nameAr || "المقاول",
      contractorCompany: q.contractor?.companyNameAr,
      contractorEmail: q.contractor?.email,
      totalPrice: q.price,
      durationMonths: q.durationMonths,
      warrantyMonths: q.warrantyMonths || null,
      boqItems,
      ownerConditions: q.project.ownerConditions || q.notes || null,
      projectDescription: q.project.descriptionAr,
      contractDate: new Date().toLocaleDateString("ar-BH", { year: "numeric", month: "long", day: "numeric" })
    };

    // Send contract email to owner and contractor
    if (q.project.owner?.email) {
      sendContractEmail(q.project.owner.email, q.project.owner.nameAr, "owner", contractData).catch(() => {});
    }
    if (q.contractor?.email) {
      sendContractEmail(q.contractor.email, q.contractor.nameAr, "contractor", contractData).catch(() => {});
    }

    // If inspector assigned, send contract to them too
    if (q.project.inspectorId) {
      const inspector = await prisma.user.findUnique({ where: { id: q.project.inspectorId }, select: { nameAr: true, email: true } });
      if (inspector?.email) {
        sendContractEmail(inspector.email, inspector.nameAr, "inspector", contractData).catch(() => {});
      }
    }

    logger.info("Quotation accepted + contract emails sent", { quotationId: q.id, projectId: q.projectId });
    res.json({ success: true, message: "تم قبول العرض وتفعيل المشروع — تم إرسال العقد بالإيميل" });
  } catch (e) {
    logger.error("Accept quotation error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ APPLY INSPECTOR ═══════
router.post("/:id/apply-inspector", auth, requireRole("inspector"), validate(inspectorApplySchema), async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ error: "المشروع غير موجود" });

    const existing = await prisma.inspectorApplication.findFirst({ where: { projectId, inspectorId: req.user.id } });
    if (existing) return res.status(409).json({ error: "لديك طلب مقدم مسبقاً" });

    const d = req.validated;
    await prisma.inspectorApplication.create({
      data: { projectId, inspectorId: req.user.id, fee: d.fee, notes: d.notes }
    });

    notify(project.ownerId, "info", "ترشيح مفتش جودة", "مفتش يرغب بإدارة الجودة لمشروع " + project.titleAr).catch(() => {});
    res.status(201).json({ success: true, message: "تم الترشيح" });
  } catch (e) {
    logger.error("Inspector apply error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ ACCEPT INSPECTOR (Owner) ═══════
router.post("/inspector-applications/:id/accept", auth, requireRole("owner"), async (req, res) => {
  try {
    const app = await prisma.inspectorApplication.findUnique({ where: { id: parseInt(req.params.id) }, include: { project: true } });
    if (!app || app.project.ownerId !== req.user.id) return res.status(404).json({ error: "الطلب غير موجود" });

    await prisma.$transaction(async (tx) => {
      await tx.inspectorApplication.update({ where: { id: app.id }, data: { status: "accepted" } });
      await tx.inspectorApplication.updateMany({ where: { projectId: app.projectId, id: { not: app.id } }, data: { status: "rejected" } });
      await tx.project.update({ where: { id: app.projectId }, data: { inspectorId: app.inspectorId } });
    });

    notify(app.inspectorId, "success", "تم قبول ترشيحك", "تمت الموافقة على ترشيحك لمشروع " + app.project.titleAr).catch(() => {});
    res.json({ success: true, message: "تم تعيين المفتش" });
  } catch (e) {
    logger.error("Accept inspector error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ CONTRACTOR SUBMIT ═══════
router.post("/items/:id/contractor-submit", auth, requireRole("contractor"), validate(contractorSubmitSchema), async (req, res) => {
  try {
    const item = await prisma.checklistItem.findUnique({ where: { id: parseInt(req.params.id) }, include: { subStage: { include: { stage: { include: { project: true } } } } } });
    if (!item) return res.status(404).json({ error: "البند غير موجود" });
    if (item.contractorDone) return res.status(409).json({ error: "تم التسليم مسبقاً" });

    await prisma.checklistItem.update({
      where: { id: item.id },
      data: { contractorDone: true, contractorNotes: req.validated.notes || "تم التنفيذ", contractorDate: new Date() }
    });

    if (req.validated.files) {
      await prisma.itemFile.createMany({
        data: req.validated.files.map(f => ({ itemId: item.id, fileName: f.name, fileType: f.type, role: "contractor" }))
      });
    }

    const project = item.subStage.stage.project;
    if (project.inspectorId) {
      notify(project.inspectorId, "action", "بند جاهز للفحص", item.textAr + " — " + item.subStage.stage.nameAr).catch(() => {});
    }

    logger.info("Item submitted by contractor", { itemId: item.id, projectId: project.id });
    res.json({ success: true, message: "تم تسليم البند بنجاح" });
  } catch (e) {
    logger.error("Contractor submit error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ INSPECTOR REVIEW ═══════
router.post("/items/:id/inspector-review", auth, requireRole("inspector"), validate(inspectorReviewSchema), async (req, res) => {
  try {
    const item = await prisma.checklistItem.findUnique({ where: { id: parseInt(req.params.id) }, include: { subStage: { include: { stage: { include: { project: true } } } } } });
    if (!item) return res.status(404).json({ error: "البند غير موجود" });
    if (!item.contractorDone) return res.status(400).json({ error: "لم يتم تسليم البند بعد" });

    const approved = req.validated.approved;
    await prisma.checklistItem.update({
      where: { id: item.id },
      data: { inspectorDone: true, inspectorApproved: approved, inspectorNotes: req.validated.notes || "", inspectorDate: new Date() }
    });

    const project = item.subStage.stage.project;
    if (approved) {
      notify(project.ownerId, "action", "بند معتمد — بانتظار موافقتك", item.textAr).catch(() => {});
    } else {
      await prisma.checklistItem.update({ where: { id: item.id }, data: { contractorDone: false, contractorNotes: null, contractorDate: null } });
      notify(project.contractorId, "warning", "بند مرفوض — يحتاج إعادة تنفيذ", item.textAr + ": " + (req.validated.notes || "")).catch(() => {});
    }

    res.json({ success: true, approved, message: approved ? "تم اعتماد البند" : "تم رفض البند" });
  } catch (e) {
    logger.error("Inspector review error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ OWNER DECISION ═══════
router.post("/items/:id/owner-decision", auth, requireRole("owner"), validate(ownerDecisionSchema), async (req, res) => {
  try {
    const item = await prisma.checklistItem.findUnique({ where: { id: parseInt(req.params.id) }, include: { subStage: { include: { stage: { include: { project: true } } } } } });
    if (!item) return res.status(404).json({ error: "البند غير موجود" });
    if (!item.inspectorDone || !item.inspectorApproved) return res.status(400).json({ error: "لم يتم اعتماد البند بعد" });

    const approved = req.validated.approved;
    await prisma.checklistItem.update({
      where: { id: item.id },
      data: { ownerDone: true, ownerApproved: approved, ownerDate: new Date() }
    });

    const project = item.subStage.stage.project;
    const stage = item.subStage.stage;

    // Payment via escrow wallet
    if (approved && item.cost > 0) {
      const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
      if (wallet && wallet.balance >= item.cost) {
        await prisma.$transaction(async (tx) => {
          await tx.wallet.update({ where: { id: wallet.id }, data: { balance: { decrement: item.cost }, totalPaid: { increment: item.cost } } });
          await tx.transaction.create({ data: { walletId: wallet.id, amount: -item.cost, type: "payment", description: "Payment: " + item.textAr, descriptionAr: "دفع: " + item.textAr } });
          await tx.contractorEarning.create({ data: { contractorId: project.contractorId, projectId: project.id, itemId: item.id, amount: item.cost } });
        });
        notify(project.contractorId, "success", "تم صرف مستحقات بند", item.textAr + " — " + item.cost.toLocaleString() + " د.ب").catch(() => {});
      }
    }

    // Reject → reset all
    if (!approved) {
      await prisma.checklistItem.update({
        where: { id: item.id },
        data: { contractorDone: false, contractorNotes: null, contractorDate: null, inspectorDone: false, inspectorApproved: false, inspectorNotes: null, inspectorDate: null, ownerDone: false, ownerApproved: false, ownerDate: null }
      });
      notify(project.contractorId, "warning", "بند مرفوض من المالك", item.textAr + " — يحتاج إعادة تنفيذ").catch(() => {});
    }

    // Check stage completion → unlock next
    if (approved) {
      const stageItems = await prisma.checklistItem.findMany({ where: { subStage: { stageId: stage.id } } });
      const allDone = stageItems.every(i => i.ownerDone && i.ownerApproved);
      if (allDone) {
        await prisma.stage.update({ where: { id: stage.id }, data: { status: "completed" } });
        const next = await prisma.stage.findFirst({ where: { projectId: project.id, orderNum: stage.orderNum + 1 } });
        if (next) {
          await prisma.stage.update({ where: { id: next.id }, data: { status: "active" } });
        } else {
          const allStages = await prisma.stage.findMany({ where: { projectId: project.id } });
          if (allStages.every(s => s.status === "completed" || s.id === stage.id)) {
            await prisma.project.update({ where: { id: project.id }, data: { status: "completed", completedAt: new Date() } });
          }
        }
      }
    }

    res.json({ success: true, approved, message: approved ? "تم الموافقة وصرف المبلغ" : "تم رفض البند" });
  } catch (e) {
    logger.error("Owner decision error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

module.exports = router;
