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
  if (!client) {
    throw new Error("مفتاح API الذكاء الاصطناعي غير مُعد — أضف ANTHROPIC_API_KEY");
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

module.exports = { analyzeProject, matchContractors };
