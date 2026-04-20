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
const { deleteFromCloudinary, isCloudinaryConfigured, signedPrivateUrl } = require("../services/cloudinary");
const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");
const mammoth = require("mammoth");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

// ═══════ Rate limit: BOQ Excel upload — prevent abuse / parse-storms ═══════
// 10 uploads / minute / contractor (keyed on auth user, falls back to IP)
const boqUploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "محاولات كثيرة — يرجى الانتظار دقيقة قبل رفع ملف BOQ جديد" },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: function (req) { return req.user && req.user.id ? "user:" + req.user.id : req.ip; }
});

// ═══════ Helper: remove BOQ blob from disk or Cloudinary ═══════
// Best-effort cleanup — never throws, always logs.
async function deleteBoqBlob(q) {
  if (!q) return;
  // Cloudinary first (if we recorded the publicId) — BOQ uploads use type:"authenticated"
  if (q.boqFilePublicId && isCloudinaryConfigured()) {
    try {
      await deleteFromCloudinary(q.boqFilePublicId, "raw", "authenticated");
      logger.info("BOQ blob removed from Cloudinary", { quotationId: q.id, publicId: q.boqFilePublicId });
    } catch (e) {
      logger.warn("BOQ Cloudinary cleanup failed", { quotationId: q.id, error: e.message });
    }
  }
  // Disk
  if (q.boqFilePath) {
    try {
      if (fs.existsSync(q.boqFilePath)) {
        fs.unlinkSync(q.boqFilePath);
        logger.info("BOQ blob removed from disk", { quotationId: q.id, path: q.boqFilePath });
      }
    } catch (e) {
      logger.warn("BOQ disk cleanup failed", { quotationId: q.id, error: e.message });
    }
  }
}

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
        inspector: { select: { nameAr: true } },
        _count: { select: { quotations: true, inspectorApps: true } }
      }
    });

    const result = await Promise.all(projects.map(async (p) => {
      const pct = await getCompletion(p.id);
      return {
        ...p, completion_percentage: pct,
        // snake_case aliases for frontend compatibility
        title_ar: p.titleAr, title_en: p.titleEn,
        area_sqm: p.areaSqm, total_budget: p.totalBudget,
        location_ar: p.locationAr, location_en: p.locationEn,
        description_ar: p.descriptionAr, description_en: p.descriptionEn,
        owner_id: p.ownerId, contractor_id: p.contractorId, inspector_id: p.inspectorId,
        has_designs: p.hasDesigns, needs_design: p.needsDesign,
        current_stage: p.currentStage, owner_conditions: p.ownerConditions,
        contractor_name: p.contractor?.nameAr, contractor_company: p.contractor?.companyNameAr,
        inspector_name: p.inspector?.nameAr,
        quotation_count: p._count?.quotations || 0,
        inspector_count: p._count?.inspectorApps || 0
      };
    }));

    res.json({ projects: result });
  } catch (e) {
    logger.error("Get projects error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ AI: ANALYZE PROJECT FILE ═══════
// Requires a REAL uploaded file (PDF or Word) containing a BOQ or
// project description. Text is extracted from the file and passed
// to the analyzer — no fake/dummy data is ever fabricated.
router.post("/ai-analyze", auth, requireRole("owner"), upload.single("file"), processUploadedFiles, async (req, res) => {
  try {
    const { description, goals } = req.body;

    // 1. File is MANDATORY — projects are created from real files only
    if (!req.file) {
      return res.status(400).json({
        error: "يجب رفع ملف المشروع (PDF أو Word) — لا يمكن إنشاء المشروع بدون ملف حقيقي"
      });
    }

    const mime = req.file.mimetype;
    const allowedMimes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword"
    ];
    if (!allowedMimes.includes(mime)) {
      return res.status(400).json({
        error: "نوع الملف غير مدعوم — يُقبل فقط PDF أو Word (.pdf / .docx)"
      });
    }

    // 2. Extract real text from the file (no fallback to fake text)
    let fileText = "";
    if (mime === "application/pdf") {
      try {
        const { PDFParse } = require("pdf-parse");
        const pdfParser = new PDFParse();
        const buf = req.file.buffer || fs.readFileSync(req.file.path);
        const result = await pdfParser.parseBuffer(buf);
        fileText = result.pages.map(p => p.lines.map(l => l.text || "").join(" ")).join("\n");
      } catch (pdfErr) {
        logger.warn("PDF parse failed", { error: pdfErr.message });
        return res.status(400).json({
          error: "تعذّر قراءة ملف PDF — قد يكون الملف محمياً أو صورة ممسوحة ضوئياً. يرجى رفع ملف PDF نصي أو ملف Word."
        });
      }
    } else {
      // DOCX / DOC
      try {
        const buf = req.file.buffer || fs.readFileSync(req.file.path);
        const result = await mammoth.extractRawText({ buffer: buf });
        fileText = result.value;
      } catch (docErr) {
        logger.warn("DOCX parse failed", { error: docErr.message });
        return res.status(400).json({
          error: "تعذّر قراءة ملف Word — تأكد أن الملف غير تالف وبصيغة .docx"
        });
      }
    }

    // 3. Extracted text must contain meaningful content
    const cleanText = (fileText || "").replace(/\s+/g, " ").trim();
    if (cleanText.length < 50) {
      return res.status(400).json({
        error: "الملف المرفوع لا يحتوي على نص كافٍ للتحليل. تأكد أن الملف يتضمّن وصفاً للمشروع وجدول الكميات."
      });
    }

    // 4. Call analyzer — it will throw if the text has no real BOQ data
    let analysis;
    try {
      analysis = await analyzeProject(fileText, description || "", goals || "");
    } catch (analyzeErr) {
      logger.warn("AI analysis rejected file", { error: analyzeErr.message });
      return res.status(400).json({ error: analyzeErr.message });
    }

    // 5. Match contractors based on real extracted requirements
    const matchedContractors = await matchContractors(prisma, analysis);

    logger.info("AI project analysis completed", {
      userId: req.user.id, projectName: analysis.projectName,
      stagesCount: analysis.stages?.length || 0,
      budget: analysis.estimatedBudget
    });
    res.json({
      success: true,
      analysis,
      matchedContractors: matchedContractors.slice(0, 10),
      extractedFrom: req.file.originalname
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
        inspector: { select: { nameAr: true, companyNameAr: true, specialty: true, rating: true } },
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
          include: { contractor: { select: { nameAr: true, companyNameAr: true, crNumber: true, phone: true, rating: true } } }
        },
        inspectorApps: {
          orderBy: { createdAt: "desc" },
          include: { inspector: { select: { nameAr: true, companyNameAr: true, specialty: true, rating: true } } }
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
    const quots = project.quotations.map(q => {
      // Strip internal file path; expose only a flag + filename + size
      const { boqFilePath, boqFileUrl, ...safe } = q;
      return {
        ...safe,
        total_price: q.price,
        contractor_name: q.contractor?.nameAr,
        company_name_ar: q.contractor?.companyNameAr,
        cr_number: q.contractor?.crNumber,
        rating: q.contractor?.rating,
        duration_months: q.durationMonths,
        warranty_months: q.warrantyMonths,
        has_boq_file: !!(q.boqFilePath || q.boqFileUrl),
        boq_file_name: q.boqFileName || null,
        boq_file_size: q.boqFileSize || null
      };
    });
    const iApps = project.inspectorApps.map(ia => ({
      ...ia,
      name_ar: ia.inspector?.nameAr,
      company_name_ar: ia.inspector?.companyNameAr,
      specialty: ia.inspector?.specialty,
      rating: ia.inspector?.rating
    }));

    res.json({
      project: {
        ...project, completion_percentage: pct,
        title_ar: project.titleAr, title_en: project.titleEn,
        description_ar: project.descriptionAr, location_ar: project.locationAr,
        area_sqm: project.areaSqm, total_budget: project.totalBudget,
        owner_id: project.ownerId, contractor_id: project.contractorId, inspector_id: project.inspectorId,
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

// ═══════ Helper: parse BOQ Excel → normalized breakdown JSON ═══════
function parseBoqExcel(buffer) {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const firstSheet = wb.Sheets[wb.SheetNames[0]];
  if (!firstSheet) return { items: [], total: 0, error: "ورقة العمل فارغة" };
  const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: "", raw: false });
  if (rows.length === 0) return { items: [], total: 0, error: "لا توجد صفوف في ملف الإكسل" };

  // Column-name aliases (Arabic + English — match loose)
  const pick = (row, aliases) => {
    const keys = Object.keys(row);
    for (const a of aliases) {
      const found = keys.find(k => k.toString().trim().toLowerCase().includes(a.toLowerCase()));
      if (found && row[found] !== "" && row[found] != null) return row[found];
    }
    return "";
  };

  const items = [];
  let total = 0;
  for (const row of rows) {
    const description = String(pick(row, ["وصف", "البند", "description", "item"])).trim();
    if (!description) continue; // skip empty rows
    const stage = String(pick(row, ["مرحله", "مرحلة", "stage", "category", "قسم", "فئة"])).trim() || "أعمال عامة";
    const unit = String(pick(row, ["وحده", "وحدة", "unit"])).trim() || "عدد";
    const quantity = Number(pick(row, ["كميه", "كمية", "quantity", "qty"])) || 1;
    const unit_price = Number(pick(row, ["سعر الوحده", "سعر الوحدة", "unit price", "price", "سعر"])) || 0;
    const brand = String(pick(row, ["ماركه", "ماركة", "brand", "مواصفات", "spec"])).trim();
    const rowTotalRaw = Number(pick(row, ["اجمالي", "إجمالي", "total", "الإجمالي", "الاجمالي"]));
    const rowTotal = rowTotalRaw > 0 ? rowTotalRaw : (quantity * unit_price);
    items.push({ stage, description, unit, quantity, unit_price, brand, total: rowTotal });
    total += rowTotal;
  }

  return { items, total, sheetName: wb.SheetNames[0], rowCount: rows.length };
}

// ═══════ SUBMIT QUOTATION VIA EXCEL (Contractor) ═══════
// multipart/form-data with:
//   - boqFile: .xlsx (required)
//   - durationMonths, warrantyMonths, notes (text fields)
router.post("/:id/quotation-excel", auth, requireRole("contractor"), boqUploadLimiter, function (req, _res, next) {
  // BOQ files are private: Cloudinary will upload as type:"authenticated" → no public URL
  req.uploadFolder = "boq";
  req.uploadPrivate = true;
  next();
}, upload.single("boqFile"), processUploadedFiles, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    if (!req.file) return res.status(400).json({ error: "يرجى رفع ملف Excel يحتوي على جدول الكميات (BOQ)" });

    const mime = req.file.mimetype || "";
    const origName = req.file.originalname || "";
    const isXlsx = mime.includes("spreadsheet") || mime.includes("excel") || /\.(xlsx|xls)$/i.test(origName);
    if (!isXlsx) return res.status(400).json({ error: "صيغة الملف غير مدعومة — يرجى رفع ملف Excel (.xlsx)" });

    const project = await prisma.project.findFirst({ where: { id: projectId, status: { in: ["awaiting_pricing", "new", "design_required"] } } });
    if (!project) return res.status(404).json({ error: "المشروع غير متاح للتسعير" });

    const existing = await prisma.quotation.findFirst({ where: { projectId, contractorId: req.user.id } });
    if (existing) return res.status(409).json({ error: "لديك عرض سعر مقدم مسبقاً" });

    // Read buffer (memory-storage or disk-storage both supported)
    let buffer;
    if (req.file.buffer) buffer = req.file.buffer;
    else if (req.file.path) buffer = fs.readFileSync(req.file.path);
    else return res.status(500).json({ error: "تعذر قراءة ملف الإكسل" });

    let parsed;
    try { parsed = parseBoqExcel(buffer); }
    catch (e) {
      logger.error("Excel parse error", { error: e.message });
      return res.status(400).json({ error: "تعذر قراءة ملف الإكسل — تأكد من صيغة الجدول" });
    }

    if (!parsed.items || parsed.items.length === 0) {
      return res.status(400).json({ error: "لم يتم العثور على بنود في الملف — تأكد من وجود أعمدة: الوصف، الوحدة، الكمية، سعر الوحدة" });
    }

    // Price: prefer form field, else parsed total
    const formPrice = Number(req.body.price);
    const price = formPrice > 0 ? formPrice : parsed.total;
    const durationMonths = parseInt(req.body.durationMonths) || 6;
    const warrantyMonths = req.body.warrantyMonths ? parseInt(req.body.warrantyMonths) : null;
    const notes = req.body.notes || null;

    const created = await prisma.quotation.create({
      data: {
        projectId,
        contractorId: req.user.id,
        price,
        durationMonths,
        warrantyMonths,
        notes,
        breakdown: JSON.stringify(parsed.items),
        boqFilePath: req.file.path || null,
        boqFileName: origName,
        boqFileSize: req.file.size || (buffer ? buffer.length : null),
        boqFileUrl: req.file.cloudinaryUrl || req.file.fileUrl || null,
        boqFilePublicId: req.file.cloudinaryPublicId || null
      }
    });

    notify(project.ownerId, "info", "عرض سعر جديد (BOQ)", "تم استلام عرض سعر مرفق مع ملف BOQ لمشروع " + project.titleAr).catch(() => {});
    const owner = await prisma.user.findUnique({ where: { id: project.ownerId }, select: { nameAr: true, email: true } });
    const contractor = await prisma.user.findUnique({ where: { id: req.user.id }, select: { nameAr: true, companyNameAr: true } });
    if (owner?.email) {
      sendQuotationNotification(owner.email, owner.nameAr, contractor?.nameAr, contractor?.companyNameAr, project.titleAr, price, durationMonths).catch(() => {});
    }

    logger.info("Quotation via Excel submitted", { projectId, contractorId: req.user.id, quotationId: created.id, items: parsed.items.length, total: parsed.total });
    res.status(201).json({
      success: true,
      message: "تم تقديم عرض السعر بنجاح",
      quotation: {
        id: created.id,
        price,
        itemCount: parsed.items.length,
        parsedTotal: parsed.total,
        fileName: origName
      }
    });
  } catch (e) {
    logger.error("Quotation via Excel error", { error: e.message, stack: e.stack });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ DOWNLOAD BOQ EXCEL FILE — owner + submitter + admin only ═══════
router.get("/quotations/:id/boq-file", auth, async (req, res) => {
  try {
    const q = await prisma.quotation.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { project: { select: { ownerId: true, titleAr: true } } }
    });
    if (!q) return res.status(404).json({ error: "عرض السعر غير موجود" });
    if (!q.boqFilePath && !q.boqFileUrl) return res.status(404).json({ error: "لا يوجد ملف BOQ مرفق" });

    // ACL: owner of project, contractor who submitted, or admin
    const isOwner = q.project.ownerId === req.user.id;
    const isSubmitter = q.contractorId === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isSubmitter && !isAdmin) {
      logger.warn("BOQ file access denied", { quotationId: q.id, userId: req.user.id, role: req.user.role });
      return res.status(403).json({ error: "هذا الملف متاح فقط للمالك والمقاول المقدِّم للعرض" });
    }

    const filename = (q.boqFileName || ("BOQ-" + q.id + ".xlsx")).replace(/[\r\n"]/g, "");

    // Cloudinary: private (type:"authenticated") → generate a short-lived signed URL
    // from the stored publicId. Fallback to the raw boqFileUrl for legacy records.
    if ((q.boqFilePublicId || (q.boqFileUrl && /^https?:\/\//i.test(q.boqFileUrl)))) {
      let fetchUrl = null;
      if (q.boqFilePublicId && isCloudinaryConfigured()) {
        try {
          fetchUrl = signedPrivateUrl(q.boqFilePublicId, { resourceType: "raw", expiresInSec: 120 });
        } catch (e) {
          logger.warn("BOQ signed URL generation failed; falling back to stored URL", { error: e.message });
        }
      }
      if (!fetchUrl) fetchUrl = q.boqFileUrl;

      if (fetchUrl && /^https?:\/\//i.test(fetchUrl)) {
        try {
          const r = await fetch(fetchUrl);
          if (!r.ok) throw new Error("upstream " + r.status);
          const arr = Buffer.from(await r.arrayBuffer());
          res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
          res.setHeader("Content-Disposition", 'attachment; filename="' + encodeURIComponent(filename) + '"');
          return res.send(arr);
        } catch (e) {
          logger.error("BOQ cloud fetch failed", { error: e.message });
          return res.status(502).json({ error: "تعذر جلب الملف من التخزين السحابي" });
        }
      }
    }

    // Local disk
    if (q.boqFilePath && fs.existsSync(q.boqFilePath)) {
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", 'attachment; filename="' + encodeURIComponent(filename) + '"');
      return fs.createReadStream(q.boqFilePath).pipe(res);
    }

    return res.status(404).json({ error: "ملف BOQ غير متوفر" });
  } catch (e) {
    logger.error("BOQ download error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ WITHDRAW QUOTATION — contractor (submitter) or admin ═══════
// Deletes the quotation row AND the attached BOQ blob (disk or Cloudinary).
// Blocked once the quotation has been accepted — owner must cancel the project instead.
router.delete("/quotations/:id", auth, async (req, res) => {
  try {
    const q = await prisma.quotation.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { project: { select: { titleAr: true, ownerId: true } } }
    });
    if (!q) return res.status(404).json({ error: "عرض السعر غير موجود" });

    const isSubmitter = q.contractorId === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isSubmitter && !isAdmin) {
      return res.status(403).json({ error: "لا يمكنك حذف هذا العرض" });
    }
    if (q.status === "accepted") {
      return res.status(409).json({ error: "تعذّر السحب — تم قبول هذا العرض بالفعل" });
    }

    // Delete blob first (best-effort), then the row
    await deleteBoqBlob(q);
    await prisma.quotation.delete({ where: { id: q.id } });

    // Let the owner know the offer was pulled (non-blocking)
    notify(q.project.ownerId, "info", "تم سحب عرض سعر", "قام المقاول بسحب عرضه لمشروع " + q.project.titleAr).catch(function(){});

    logger.info("Quotation withdrawn", { quotationId: q.id, by: req.user.id, role: req.user.role });
    res.json({ success: true, message: "تم سحب العرض بنجاح" });
  } catch (e) {
    logger.error("Quotation withdraw error", { error: e.message });
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

    // ═══ WALLET BALANCE GATE — owner must have sufficient funds ═══
    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
    if (!wallet) {
      return res.status(400).json({
        error: "لم يتم العثور على محفظتك — يرجى التواصل مع الإدارة",
        errorCode: "NO_WALLET"
      });
    }
    const availableBalance = wallet.balance - wallet.reserved;
    if (availableBalance < q.price) {
      return res.status(400).json({
        error: "رصيد المحفظة غير كافٍ لقبول هذا العرض. " +
               "المطلوب: " + q.price.toLocaleString() + " د.ب — " +
               "المتاح: " + availableBalance.toLocaleString() + " د.ب. " +
               "يرجى إيداع المبلغ أولاً ثم قبول العرض.",
        errorCode: "INSUFFICIENT_BALANCE",
        required: q.price,
        available: availableBalance
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.quotation.update({ where: { id: q.id }, data: { status: "accepted" } });
      await tx.quotation.updateMany({ where: { projectId: q.projectId, id: { not: q.id } }, data: { status: "rejected" } });
      await tx.project.update({ where: { id: q.projectId }, data: { contractorId: q.contractorId, status: "active", totalBudget: q.price } });
      // Reserve the quotation amount in the wallet
      await tx.wallet.update({
        where: { userId: req.user.id },
        data: { reserved: { increment: q.price } }
      });
      // Log the reservation transaction
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount: q.price,
          type: "reserve",
          descriptionAr: "حجز مبلغ عرض المقاول — " + (q.contractor?.companyNameAr || q.contractor?.nameAr || "المقاول"),
          reference: "quotation-" + q.id
        }
      });
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
    const project = item.subStage.stage.project;
    const stage = item.subStage.stage;

    // ═══ PRE-FLIGHT BALANCE CHECK ═══ (before any DB writes — atomic guarantee)
    let wallet = null;
    if (approved && item.cost > 0) {
      wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
      if (!wallet || wallet.balance < item.cost) {
        logger.warn("Payment rejected: insufficient balance", { itemId: item.id, cost: item.cost, balance: wallet?.balance || 0 });
        return res.status(402).json({
          error: "رصيد المحفظة غير كافٍ — يرجى الإيداع قبل الاعتماد",
          required: item.cost,
          available: wallet?.balance || 0,
          deficit: item.cost - (wallet?.balance || 0)
        });
      }
    }

    // ═══ ATOMIC TRANSACTION ═══ (item update + wallet debit + earning in one commit)
    await prisma.$transaction(async (tx) => {
      // 1. Update the checklist item (approve or reset on reject)
      if (approved) {
        await tx.checklistItem.update({
          where: { id: item.id },
          data: { ownerDone: true, ownerApproved: true, ownerDate: new Date() }
        });
      } else {
        // Reject → reset all flags
        await tx.checklistItem.update({
          where: { id: item.id },
          data: {
            contractorDone: false, contractorNotes: null, contractorDate: null,
            inspectorDone: false, inspectorApproved: false, inspectorNotes: null, inspectorDate: null,
            ownerDone: false, ownerApproved: false, ownerDate: new Date()
          }
        });
      }

      // 2. Payment (only on approval with cost)
      if (approved && item.cost > 0 && wallet) {
        const releaseReserved = Math.min(wallet.reserved, item.cost);
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: { decrement: item.cost },
            reserved: { decrement: releaseReserved },
            totalPaid: { increment: item.cost }
          }
        });
        await tx.transaction.create({ data: { walletId: wallet.id, amount: -item.cost, type: "payment", descriptionAr: "صرف مستحقات: " + item.textAr, reference: "item-" + item.id } });
        await tx.contractorEarning.create({ data: { contractorId: project.contractorId, projectId: project.id, itemId: item.id, amount: item.cost } });
      }
    });

    // ═══ POST-TRANSACTION NOTIFICATIONS ═══ (fire-and-forget)
    if (approved && item.cost > 0) {
      notify(project.contractorId, "success", "تم صرف مستحقات بند", item.textAr + " — " + item.cost.toLocaleString() + " د.ب").catch(() => {});
    }
    if (!approved) {
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
