const Anthropic = require("@anthropic-ai/sdk").default;
const logger = require("../utils/logger");

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

function getClient() {
  if (!ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: ANTHROPIC_API_KEY });
}

/**
 * Analyze a project file (text extracted from PDF/DOCX) + owner description
 * Returns structured project data with stages, BOQ, and contractor matching criteria
 */
async function analyzeProject(fileText, ownerDescription, ownerGoals) {
  const client = getClient();
  // Fallback mode: if no API key, use rule-based analyzer
  if (!client) {
    logger.info("AI fallback mode — no ANTHROPIC_API_KEY, using rule-based analyzer");
    return ruleBasedAnalyze(fileText, ownerDescription, ownerGoals);
  }

  const prompt = `أنت خبير في إدارة مشاريع البناء والتشييد في البحرين والخليج العربي.
قم بتحليل ملف المشروع التالي وإرجاع البيانات بصيغة JSON فقط بدون أي نص إضافي.

═══ ملف المشروع ═══
${fileText}

═══ وصف المالك للمشروع ═══
${ownerDescription || "لم يتم تقديم وصف"}

═══ أهداف المالك ═══
${ownerGoals || "لم يتم تحديد أهداف"}

═══ المطلوب ═══
أرجع JSON بالهيكل التالي بالضبط:
{
  "projectName": "اسم المشروع بالعربي",
  "projectType": "villa أو apartment أو commercial أو residential",
  "areaSqm": رقم المساحة بالمتر المربع أو 0,
  "floors": عدد الأدوار (رقم),
  "location": "الموقع بالعربي",
  "estimatedBudget": الميزانية التقديرية بالدينار البحريني (رقم),
  "description": "وصف شامل للمشروع بالعربي - فقرة واحدة",
  "ownerConditions": "شروط وملاحظات مهمة مستخرجة من الملف بالعربي",
  "stages": [
    {
      "nameAr": "اسم المرحلة بالعربي",
      "nameEn": "Stage Name in English",
      "order": رقم الترتيب (1, 2, 3...),
      "budgetPercent": نسبة من الميزانية (0.0 - 1.0),
      "subStages": [
        {
          "nameAr": "اسم المرحلة الفرعية",
          "items": [
            {
              "textAr": "وصف البند",
              "unit": "م² أو عدد أو وظيفة أو م.ط أو طقم",
              "quantity": الكمية (رقم),
              "estimatedCost": التكلفة التقديرية بالدينار (رقم)
            }
          ]
        }
      ]
    }
  ],
  "contractorRequirements": {
    "specialties": ["قائمة التخصصات المطلوبة"],
    "minimumRating": الحد الأدنى للتقييم (1-5),
    "experienceLevel": "مبتدئ أو متوسط أو متقدم أو خبير",
    "description": "وصف المقاول المثالي لهذا المشروع بالعربي"
  },
  "summary": "ملخص تحليلي للمشروع في 2-3 جمل بالعربي"
}

مهم جداً:
- قسّم المراحل بذكاء بناءً على محتوى الملف الفعلي وليس مراحل افتراضية
- إذا كان الملف يحتوي على BOQ (جدول كميات)، استخرج البنود منه بدقة
- قدّر الميزانية من BOQ إن وُجد، وإلا قدّر بناءً على المساحة والنوع
- أرجع JSON فقط بدون markdown أو backticks أو نص إضافي`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }]
  });

  const text = response.content[0].text.trim();

  // Parse JSON - handle potential markdown wrapping
  let jsonStr = text;
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    logger.error("AI response parse error", { error: e.message, response: text.substring(0, 500) });
    throw new Error("فشل في تحليل رد الذكاء الاصطناعي");
  }
}

/**
 * Match contractors based on project requirements
 */
async function matchContractors(prisma, projectAnalysis) {
  const reqs = projectAnalysis.contractorRequirements || {};

  // Get all active contractors
  const contractors = await prisma.user.findMany({
    where: {
      OR: [
        { role: "contractor" },
        { roles: { contains: "contractor" } }
      ],
      isActive: true
    },
    select: {
      id: true, nameAr: true, companyNameAr: true, specialty: true,
      rating: true, totalProjects: true, bioAr: true, profileImage: true
    }
  });

  // Score each contractor
  const scored = contractors.map(function (c) {
    let score = 50; // base score

    // Rating bonus
    if (c.rating >= (reqs.minimumRating || 0)) score += 20;
    if (c.rating >= 4) score += 10;

    // Experience bonus
    if (c.totalProjects >= 10) score += 15;
    else if (c.totalProjects >= 5) score += 10;
    else if (c.totalProjects >= 1) score += 5;

    // Specialty match
    const specialties = reqs.specialties || [];
    if (c.specialty && specialties.length > 0) {
      for (const s of specialties) {
        if (c.specialty.includes(s) || c.bioAr?.includes(s)) {
          score += 15;
          break;
        }
      }
    }

    return { ...c, matchScore: Math.min(score, 100) };
  });

  // Sort by score descending
  scored.sort((a, b) => b.matchScore - a.matchScore);

  return scored;
}

// ═══════════════════════════════════════════════════════════════════
// REAL FILE ANALYZER — extracts ONLY data that exists in the uploaded
// file. No hardcoded defaults, no fake quantities. If the file has no
// usable BOQ / project data, the analyzer throws and asks for a
// proper file. Used as the fallback path when ANTHROPIC_API_KEY is
// not configured — or invoked directly by the /ai-analyze route.
// ═══════════════════════════════════════════════════════════════════
function ruleBasedAnalyze(fileText, ownerDescription, ownerGoals) {
  const raw = (fileText || "").trim();
  if (!raw || raw.length < 20 || raw.startsWith("[ملف")) {
    throw new Error(
      "لم نتمكن من استخراج نص قابل للقراءة من الملف المرفوع. " +
      "يرجى رفع ملف PDF أو Word يحتوي على جدول الكميات (BOQ) والوصف الفعلي للمشروع."
    );
  }

  const lowerBlob = (raw + "\n" + (ownerDescription || "") + "\n" + (ownerGoals || "")).toLowerCase();

  // ─── 1. PROJECT NAME (real: from file heading or description) ───
  let projectName = "";
  const headingMatch = raw.match(/(?:مشروع|اسم\s*المشروع|project\s*name)\s*[:：\-]?\s*([^\n]{5,120})/i);
  if (headingMatch) projectName = headingMatch[1].trim();
  if (!projectName && ownerDescription) {
    const firstLine = ownerDescription.split(/[\n.،]/)[0].trim();
    if (firstLine.length >= 5 && firstLine.length <= 120) projectName = firstLine;
  }
  if (!projectName) {
    // Use first non-empty line of file
    const firstFileLine = raw.split(/\n/).map(l => l.trim()).find(l => l.length >= 5 && l.length <= 120);
    if (firstFileLine) projectName = firstFileLine;
  }
  if (!projectName) {
    throw new Error("تعذّر استخراج اسم المشروع من الملف. يرجى كتابة اسم المشروع في الوصف أو في الملف.");
  }

  // ─── 2. PROJECT TYPE (real: from file content only) ───
  let projectType = null;
  if (/فيلا|villa|فلل/i.test(lowerBlob)) projectType = "villa";
  else if (/شقة|شقق|apartment/i.test(lowerBlob)) projectType = "apartment";
  else if (/تجاري|مكتب|محل|مركز|commercial|مطعم|كافيه|مقهى/i.test(lowerBlob)) projectType = "commercial";
  else if (/سكني|مبنى|residential/i.test(lowerBlob)) projectType = "residential";
  if (!projectType) projectType = "residential"; // neutral default — NOT used to fabricate data

  // ─── 3. AREA (real: from file text, no default fill) ───
  let areaSqm = 0;
  const areaMatch = raw.match(/(\d{2,6}(?:[.,]\d+)?)\s*(?:م[²2]|م\s*مربع|sqm|m2|متر\s*مربع)/i);
  if (areaMatch) areaSqm = parseFloat(areaMatch[1].replace(",", ""));

  // ─── 4. FLOORS (real) ───
  let floors = 0;
  const floorMatch = raw.match(/(\d{1,2})\s*(طابق|طوابق|دور|أدوار|floors?|stories)/i);
  if (floorMatch) floors = parseInt(floorMatch[1]);
  if (!floors) floors = 1;

  // ─── 5. LOCATION (real — from file) ───
  let location = "";
  const locMatches = raw.match(/(الرفاع|المنامة|المحرق|عيسى\s*تاون|سترة|الحد|البديع|جد\s*حفص|توبلي|السيف|سار|الجفير|عراد|الزلاق|الزنج|الحورة|العدلية|بوعشيرة|النعيم|السنابس|الدراز|الدير|حمد\s*تاون|مدينة\s*حمد|البسيتين|الصخير|الرفاع\s*الشرقي|الرفاع\s*الغربي)/);
  if (locMatches) location = locMatches[1];
  // Also check owner description for location if still empty
  if (!location && ownerDescription) {
    const ownerLoc = ownerDescription.match(/(الرفاع|المنامة|المحرق|عيسى\s*تاون|سترة|الحد|البديع|جد\s*حفص|توبلي|السيف|سار|الجفير|عراد|الزلاق)/);
    if (ownerLoc) location = ownerLoc[1];
  }

  // ─── 6. EXTRACT REAL BOQ LINE ITEMS FROM FILE TEXT ───
  const boqItems = extractBoqLines(raw);

  // ─── 7. GROUP REAL ITEMS INTO STAGES BY DETECTED KEYWORDS ───
  const stages = groupItemsIntoStages(boqItems, raw);

  if (stages.length === 0 || boqItems.length === 0) {
    throw new Error(
      "لم نعثر على جدول كميات (BOQ) أو بنود أعمال في الملف المرفوع. " +
      "يرجى رفع ملف يحتوي على جدول الكميات بصيغة: الوصف • الوحدة • الكمية • السعر."
    );
  }

  // ─── 8. BUDGET = SUM OF REAL ITEM COSTS (no estimation) ───
  let estimatedBudget = 0;
  for (const s of stages) {
    for (const ss of s.subStages) {
      for (const it of ss.items) estimatedBudget += (it.estimatedCost || 0);
    }
  }
  // If BOQ had no prices, try to extract total budget line from file
  if (estimatedBudget === 0) {
    const totalMatch = raw.match(/(?:إجمالي|الإجمالي|مجموع|total|grand\s*total|قيمة\s*المشروع)[\s:]*([0-9]{1,3}(?:[,.][0-9]{3})*(?:[.,][0-9]+)?)\s*(?:دينار|د\.?ب|bhd)?/i);
    if (totalMatch) estimatedBudget = parseFloat(totalMatch[1].replace(/,/g, ""));
  }

  if (estimatedBudget === 0) {
    throw new Error(
      "جدول الكميات لا يحتوي على أسعار — لم نتمكن من حساب ميزانية المشروع. " +
      "يرجى إضافة أسعار الوحدات (أو إجمالي المشروع) في الملف."
    );
  }

  // Compute budgetPercent for each stage from real sums
  const stagesWithPercent = stages.map(function (s, idx) {
    let stageSum = 0;
    for (const ss of s.subStages) for (const it of ss.items) stageSum += (it.estimatedCost || 0);
    return {
      nameAr: s.nameAr,
      nameEn: s.nameEn || "",
      order: idx + 1,
      budgetPercent: estimatedBudget > 0 ? stageSum / estimatedBudget : 0,
      subStages: s.subStages
    };
  });

  return {
    projectName: projectName,
    projectType: projectType,
    areaSqm: areaSqm,  // 0 if not found in file — honest
    floors: floors,
    location: location,  // empty if not found — honest
    estimatedBudget: estimatedBudget,
    description: ownerDescription || projectName,
    ownerConditions: ownerGoals || "",
    stages: stagesWithPercent,
    contractorRequirements: {
      specialties: detectSpecialtiesFromText(raw),
      minimumRating: 3,
      experienceLevel: "متوسط",
      description: "مقاول مناسب لتنفيذ البنود المذكورة في جدول الكميات المرفوع"
    },
    summary:
      "مشروع «" + projectName + "»" +
      (location ? " في " + location : "") +
      (areaSqm ? " — مساحة " + areaSqm + " م²" : "") +
      " — ميزانية " + estimatedBudget.toLocaleString() + " د.ب" +
      " — عدد بنود جدول الكميات: " + boqItems.length + " بند." +
      " (البيانات مستخرجة مباشرةً من الملف المرفوع)."
  };
}

// Extract real BOQ rows from file text. Returns array of
// { textAr, unit, quantity, unitPrice, estimatedCost }.
function extractBoqLines(text) {
  const UNIT_RE = /(م²|م2|م³|م3|م\.?\s*ط|متر\s*مربع|متر\s*مكعب|متر\s*طولي|طن|كغ|كيلو|عدد|قطعة|قطع|طقم|أطقم|وحدة|وحدات|مقطوعية|لتر|كيس|كرتون|بدل|lot|ls|no\.?|pcs?|pc|sqm|m2|cum|m3|kg|ton|ea)/i;

  const lines = text.split(/\n/).map(l => l.replace(/\s+/g, " ").trim()).filter(Boolean);
  const items = [];

  for (const line of lines) {
    // Line must have unit keyword
    const unitMatch = line.match(UNIT_RE);
    if (!unitMatch) continue;

    // Must have at least one number
    const nums = line.match(/\d{1,3}(?:[,.]\d{3})*(?:[.,]\d+)?/g);
    if (!nums || nums.length === 0) continue;

    // Parse numbers into floats
    const parsedNums = nums.map(n => parseFloat(n.replace(/,/g, "")));
    // Description = line with numbers + unit removed
    let desc = line
      .replace(new RegExp("\\b" + parsedNums.map(n => n.toString().replace(".", "\\.")).join("|") + "\\b", "g"), " ")
      .replace(/\d{1,3}(?:[,.]\d{3})*(?:[.,]\d+)?/g, " ")
      .replace(UNIT_RE, " ")
      .replace(/[|│┃┆]/g, " ")
      .replace(/^\s*\d+[\.\)\-]\s*/, "") // strip leading row number
      .replace(/\s+/g, " ")
      .trim();

    // Description must contain Arabic letters or be clearly a BOQ description
    if (desc.length < 3) continue;
    if (!/[\u0600-\u06FF]/.test(desc) && !/[a-zA-Z]{3,}/.test(desc)) continue;

    // Heuristic for quantity / unit_price / total:
    //   - 1 number  → quantity only (no price)
    //   - 2 numbers → quantity + unit_price
    //   - 3+ numbers → quantity + unit_price + total (take last as total)
    let quantity = 0, unitPrice = 0, total = 0;
    if (parsedNums.length === 1) {
      quantity = parsedNums[0];
    } else if (parsedNums.length === 2) {
      quantity = parsedNums[0];
      unitPrice = parsedNums[1];
      total = Math.round(quantity * unitPrice);
    } else {
      // 3+ — assume last is total, prior are qty & unit price
      total = parsedNums[parsedNums.length - 1];
      unitPrice = parsedNums[parsedNums.length - 2];
      quantity = parsedNums[parsedNums.length - 3];
      // Sanity check: if total ≠ qty×price ±5%, keep total as authoritative
      const calc = quantity * unitPrice;
      if (calc > 0 && Math.abs(calc - total) / total > 0.1) {
        // Trust the total from the file; leave quantity/unitPrice as-is
      }
    }

    items.push({
      textAr: desc,
      unit: unitMatch[0],
      quantity: quantity,
      unitPrice: unitPrice,
      estimatedCost: total || Math.round(quantity * unitPrice) || 0
    });
  }

  return items;
}

// Group extracted items into construction stages using keyword detection
// in each item's description. Only creates stages that actually have
// items assigned — no empty "standard" stages injected.
function groupItemsIntoStages(items, fullText) {
  if (!items || items.length === 0) return [];

  const STAGE_RULES = [
    {
      key: "design",
      nameAr: "التصميم والمخططات",
      nameEn: "Design & Plans",
      keywords: /تصميم|مخطط|رسوم|رسومات|اعتماد|دراسة|design|drawing|plan/i
    },
    {
      key: "foundation",
      nameAr: "الحفر والأساسات",
      nameEn: "Excavation & Foundation",
      keywords: /حفر|تسوية|أساس|اساس|قواعد|عزل\s*مائي|ردم|دك|excavation|foundation|earthwork/i
    },
    {
      key: "structure",
      nameAr: "الهيكل الخرساني",
      nameEn: "Concrete Structure",
      keywords: /خرسان|خرسانة|حديد\s*تسليح|عمود|أعمدة|عامود|سقف|بلاطة|جسور|كمرة|بلوك|بناء|دراج|سلم|structure|concrete|column|slab|rebar|steel/i
    },
    {
      key: "mep",
      nameAr: "التمديدات الكهربائية والصحية",
      nameEn: "Electrical & Plumbing",
      keywords: /كهرب|كهرباء|إنارة|اضاءة|إضاءة|لوحة\s*توزيع|سباك|صحي|صرف|مياه|تكييف|تهوية|hvac|electrical|plumbing|mep/i
    },
    {
      key: "finishes",
      nameAr: "التشطيبات",
      nameEn: "Finishes",
      keywords: /بلاط|سيراميك|رخام|بورسلان|دهان|جبس|أبواب|نوافذ|واجه|واجهات|ألمنيوم|ديكور|تشطيب|أرضيات|جدران|finish|tile|paint|door|window/i
    },
    {
      key: "handover",
      nameAr: "التسليم والاعتماد النهائي",
      nameEn: "Handover",
      keywords: /تسليم|تنظيف|فحص\s*نهائي|اختبار|ضمان|handover|cleaning|testing|warranty/i
    }
  ];

  const buckets = Object.fromEntries(STAGE_RULES.map(r => [r.key, []]));
  const uncategorized = [];

  for (const item of items) {
    let matched = false;
    for (const rule of STAGE_RULES) {
      if (rule.keywords.test(item.textAr)) {
        buckets[rule.key].push(item);
        matched = true;
        break;
      }
    }
    if (!matched) uncategorized.push(item);
  }

  // If items didn't match any stage, put them all under a single "أعمال المشروع" stage
  if (uncategorized.length > 0 && Object.values(buckets).every(arr => arr.length === 0)) {
    return [{
      nameAr: "أعمال المشروع",
      nameEn: "Project Works",
      subStages: [{ nameAr: "بنود جدول الكميات", items: uncategorized }]
    }];
  }

  // Distribute uncategorized into the "finishes" bucket as a catch-all
  for (const u of uncategorized) buckets.finishes.push(u);

  // Build stages — skip empty buckets
  const stages = [];
  for (const rule of STAGE_RULES) {
    const list = buckets[rule.key];
    if (list.length === 0) continue;
    stages.push({
      nameAr: rule.nameAr,
      nameEn: rule.nameEn,
      subStages: [{ nameAr: rule.nameAr, items: list }]
    });
  }

  return stages;
}

// Detect real contractor specialties from file content
function detectSpecialtiesFromText(text) {
  const specs = [];
  if (/خرسان|هيكل|حديد|عمود|أعمدة|structural/i.test(text)) specs.push("إنشاءات");
  if (/كهرب|إنارة|لوحة\s*توزيع|electrical/i.test(text)) specs.push("كهرباء");
  if (/سباك|صحي|مياه|صرف|plumbing/i.test(text)) specs.push("سباكة");
  if (/تكييف|تهوية|hvac/i.test(text)) specs.push("تكييف");
  if (/دهان|بلاط|جبس|ديكور|تشطيب|finishes/i.test(text)) specs.push("تشطيبات");
  if (specs.length === 0) specs.push("أعمال عامة");
  return specs;
}

module.exports = { analyzeProject, matchContractors };
