/**
 * FIRST TOUCH — Demo Data Seeder
 * يملأ المشروع الحالي بملفات وهمية وتعليقات وإشعارات
 * لإظهار تسلسل العمل كأنه مشروع حقيقي
 */

const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

// ═══════════════════════════════════════════════
// FAKE IMAGE GENERATOR — صور SVG تُحاكي مراحل البناء
// ═══════════════════════════════════════════════

function makeSitePhoto(stage, caption, color) {
  const svgColors = {
    foundation: ["#8B7355","#6B5B3E","#A0856A"],
    concrete:   ["#9E9E9E","#757575","#BDBDBD"],
    rebar:      ["#78909C","#546E7A","#90A4AE"],
    electric:   ["#FFB300","#F57F17","#FFF176"],
    plumbing:   ["#1565C0","#0D47A1","#42A5F5"],
    finish:     ["#E8F5E9","#C8E6C9","#A5D6A7"],
    inspection: ["#4CAF50","#388E3C","#81C784"],
    document:   ["#F5F5F5","#E0E0E0","#BDBDBD"],
  };
  const c = svgColors[color] || svgColors.concrete;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#87CEEB;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#E0F4FF;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="ground" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${c[0]};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${c[1]};stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Sky -->
  <rect width="800" height="350" fill="url(#sky)"/>
  <!-- Sun -->
  <circle cx="680" cy="80" r="45" fill="#FFD700" opacity="0.9"/>
  <!-- Clouds -->
  <ellipse cx="150" cy="100" rx="70" ry="30" fill="white" opacity="0.8"/>
  <ellipse cx="200" cy="90" rx="50" ry="25" fill="white" opacity="0.8"/>
  <ellipse cx="500" cy="120" rx="80" ry="28" fill="white" opacity="0.7"/>

  <!-- Ground/Site -->
  <rect y="350" width="800" height="250" fill="url(#ground)"/>

  <!-- Construction site elements -->
  <!-- Building structure -->
  <rect x="150" y="180" width="500" height="170" fill="${c[2]}" stroke="${c[1]}" stroke-width="3"/>
  <!-- Columns -->
  <rect x="160" y="160" width="30" height="190" fill="${c[0]}" opacity="0.9"/>
  <rect x="290" y="160" width="30" height="190" fill="${c[0]}" opacity="0.9"/>
  <rect x="420" y="160" width="30" height="190" fill="${c[0]}" opacity="0.9"/>
  <rect x="610" y="160" width="30" height="190" fill="${c[0]}" opacity="0.9"/>
  <!-- Beams -->
  <rect x="150" y="155" width="500" height="20" fill="${c[1]}" opacity="0.9"/>
  <rect x="150" y="240" width="500" height="15" fill="${c[1]}" opacity="0.7"/>

  <!-- Safety barriers -->
  <rect x="80" y="340" width="640" height="12" fill="#FF6600" rx="4"/>
  <rect x="80" y="330" width="12" height="100" fill="#FF6600"/>
  <rect x="710" y="330" width="12" height="100" fill="#FF6600"/>

  <!-- Crane -->
  <rect x="700" y="50" width="12" height="300" fill="#E0E0E0" stroke="#9E9E9E" stroke-width="2"/>
  <rect x="620" y="50" width="92" height="12" fill="#E0E0E0" stroke="#9E9E9E" stroke-width="2"/>
  <line x1="712" y1="62" x2="680" y2="200" stroke="#9E9E9E" stroke-width="2" stroke-dasharray="6,3"/>

  <!-- Workers (silhouettes) -->
  <g transform="translate(230, 300)">
    <circle r="12" fill="#4A4A4A"/>
    <rect x="-8" y="12" width="16" height="28" rx="3" fill="#FF6600"/>
    <rect x="-15" y="40" width="8" height="22" rx="3" fill="#3A3A3A"/>
    <rect x="7" y="40" width="8" height="22" rx="3" fill="#3A3A3A"/>
  </g>
  <g transform="translate(380, 310)">
    <circle r="12" fill="#4A4A4A"/>
    <rect x="-8" y="12" width="16" height="28" rx="3" fill="#1565C0"/>
    <rect x="-15" y="40" width="8" height="22" rx="3" fill="#3A3A3A"/>
    <rect x="7" y="40" width="8" height="22" rx="3" fill="#3A3A3A"/>
  </g>

  <!-- Equipment -->
  <rect x="90" y="380" width="100" height="60" rx="5" fill="#F57F17"/>
  <rect x="85" y="400" width="110" height="20" fill="#E65100"/>
  <circle cx="105" cy="445" r="14" fill="#424242"/>
  <circle cx="165" cy="445" r="14" fill="#424242"/>

  <!-- Timestamp overlay -->
  <rect x="0" y="545" width="800" height="55" fill="rgba(0,0,0,0.65)"/>
  <text x="20" y="570" font-family="Arial" font-size="16" fill="white" font-weight="bold">📷 FIRST TOUCH — ${stage}</text>
  <text x="20" y="590" font-family="Arial" font-size="13" fill="#FFD700">${caption}</text>
  <text x="650" y="590" font-family="Arial" font-size="12" fill="#CCC">${new Date().toLocaleDateString("ar-BH")}</text>
</svg>`;

  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
}

function makeInspectionReport(stage, result, notes) {
  const status = result === "approved" ? "✅ معتمد" : "❌ مرفوض";
  const color = result === "approved" ? "#4CAF50" : "#F44336";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="794" height="1123" viewBox="0 0 794 1123">
  <!-- A4 paper background -->
  <rect width="794" height="1123" fill="white" stroke="#E0E0E0" stroke-width="2"/>

  <!-- Header stripe -->
  <rect width="794" height="120" fill="#0B1D33"/>
  <text x="40" y="55" font-family="Arial" font-size="28" fill="white" font-weight="bold">🐋 FIRST TOUCH</text>
  <text x="40" y="80" font-family="Arial" font-size="14" fill="#5DADE2">Construction Quality Management Platform</text>
  <text x="40" y="105" font-family="Arial" font-size="12" fill="#888">www.firsttouch.bh | support@firsttouch.bh | +973 17 000 000</text>

  <!-- Report title -->
  <rect x="40" y="145" width="714" height="60" fill="#F5F5F5" rx="8" stroke="#E0E0E0"/>
  <text x="397" y="182" font-family="Arial" font-size="20" fill="#0B1D33" font-weight="bold" text-anchor="middle">تقرير فحص واعتماد الأعمال</text>
  <text x="397" y="200" font-family="Arial" font-size="12" fill="#666" text-anchor="middle">Inspection &amp; Approval Report</text>

  <!-- Status badge -->
  <rect x="300" y="220" width="194" height="44" fill="${color}" rx="22"/>
  <text x="397" y="248" font-family="Arial" font-size="18" fill="white" font-weight="bold" text-anchor="middle">${status}</text>

  <!-- Project info table -->
  <rect x="40" y="285" width="714" height="200" fill="#FAFAFA" rx="8" stroke="#E0E0E0"/>
  <text x="60" y="315" font-family="Arial" font-size="14" fill="#333" font-weight="bold">📋 بيانات المشروع</text>
  <line x1="40" y1="325" x2="754" y2="325" stroke="#E0E0E0"/>

  <text x="60" y="355" font-family="Arial" font-size="13" fill="#555">المشروع:</text>
  <text x="200" y="355" font-family="Arial" font-size="13" fill="#0B1D33" font-weight="bold">فيلا سكنية — الرفاع، البحرين</text>

  <text x="60" y="385" font-family="Arial" font-size="13" fill="#555">المرحلة:</text>
  <text x="200" y="385" font-family="Arial" font-size="13" fill="#0B1D33" font-weight="bold">${stage}</text>

  <text x="60" y="415" font-family="Arial" font-size="13" fill="#555">المفتش:</text>
  <text x="200" y="415" font-family="Arial" font-size="13" fill="#0B1D33">خالد المفتش — مهندس مدني معتمد</text>

  <text x="60" y="445" font-family="Arial" font-size="13" fill="#555">تاريخ الفحص:</text>
  <text x="200" y="445" font-family="Arial" font-size="13" fill="#0B1D33">${new Date().toLocaleDateString("ar-BH")}</text>

  <text x="60" y="475" font-family="Arial" font-size="13" fill="#555">رقم التقرير:</text>
  <text x="200" y="475" font-family="Arial" font-size="13" fill="#0B1D33">FT-INS-2026-${Math.floor(Math.random()*9000+1000)}</text>

  <!-- Checklist section -->
  <rect x="40" y="500" width="714" height="350" fill="#FAFAFA" rx="8" stroke="#E0E0E0"/>
  <text x="60" y="530" font-family="Arial" font-size="14" fill="#333" font-weight="bold">✅ قائمة الفحص التفصيلية</text>
  <line x1="40" y1="540" x2="754" y2="540" stroke="#E0E0E0"/>

  ${[
    ["مطابقة المواصفات الفنية", "✅"],
    ["جودة مواد البناء المستخدمة", "✅"],
    ["الالتزام بمعايير السلامة", "✅"],
    ["دقة الأبعاد والمقاسات", result === "approved" ? "✅" : "⚠️"],
    ["التشطيب والإتقان", result === "approved" ? "✅" : "❌"],
    ["التوثيق الصوري الكافي", "✅"],
  ].map((item, i) => `
  <text x="70" y="${565 + i * 45}" font-family="Arial" font-size="13" fill="#333">${item[1]} ${item[0]}</text>
  <line x1="60" y1="${578 + i * 45}" x2="734" y2="${578 + i * 45}" stroke="#F0F0F0"/>
  `).join("")}

  <!-- Notes -->
  <rect x="40" y="870" width="714" height="150" fill="#FFF8E1" rx="8" stroke="#FFD54F"/>
  <text x="60" y="900" font-family="Arial" font-size="14" fill="#333" font-weight="bold">📝 ملاحظات المفتش</text>
  <line x1="40" y1="910" x2="754" y2="910" stroke="#FFD54F"/>
  <text x="60" y="940" font-family="Arial" font-size="12" fill="#555">${notes}</text>

  <!-- Footer signature -->
  <rect x="40" y="1040" width="340" height="60" fill="#F5F5F5" rx="6" stroke="#E0E0E0"/>
  <text x="210" y="1065" font-family="Arial" font-size="12" fill="#333" text-anchor="middle">توقيع المفتش</text>
  <text x="210" y="1085" font-family="Arial" font-size="14" fill="#0B1D33" font-weight="bold" text-anchor="middle">خالد المفتش</text>

  <rect x="414" y="1040" width="340" height="60" fill="#F5F5F5" rx="6" stroke="#E0E0E0"/>
  <text x="584" y="1065" font-family="Arial" font-size="12" fill="#333" text-anchor="middle">اعتماد المالك</text>
  <text x="584" y="1085" font-family="Arial" font-size="14" fill="#0B1D33" font-weight="bold" text-anchor="middle">أحمد المالك ✅</text>
</svg>`;

  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
}

function makeVideoThumb(stage) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
  <rect width="640" height="360" fill="#1A1A2E"/>
  <rect x="20" y="20" width="600" height="320" fill="#16213E" rx="12"/>
  <!-- Play button -->
  <circle cx="320" cy="180" r="60" fill="rgba(255,255,255,0.15)"/>
  <polygon points="305,155 305,205 355,180" fill="white"/>
  <!-- Duration badge -->
  <rect x="550" y="310" width="70" height="25" fill="rgba(0,0,0,0.7)" rx="4"/>
  <text x="585" y="328" font-family="Arial" font-size="12" fill="white" text-anchor="middle">0:${Math.floor(Math.random()*50+10)}</text>
  <!-- Title bar -->
  <rect x="0" y="0" width="640" height="50" fill="rgba(0,0,0,0.6)"/>
  <text x="20" y="32" font-family="Arial" font-size="16" fill="white">🎥 توثيق الموقع — ${stage}</text>
  <text x="600" y="32" font-family="Arial" font-size="11" fill="#FFD700" text-anchor="end">${new Date().toLocaleDateString("ar-BH")}</text>
</svg>`;
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
}

// ═══════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════

async function main() {
  console.log("🌱 بدء إدخال البيانات التجريبية...\n");

  // ── 1. تحديث بيانات المستخدمين ──────────────
  await p.user.update({
    where: { email: "contractor@firsttouch.bh" },
    data: {
      companyNameAr: "شركة البناء المتقدم",
      specialty: "مقاول عام — فلل وعمارات",
      phone: "+97333445566",
      crNumber: "CR-2019-45678",
      bioAr: "شركة متخصصة في تنفيذ المشاريع السكنية والتجارية بالبحرين منذ 2010، أكثر من 150 مشروع مكتمل.",
      rating: 4.7,
      totalProjects: 47,
      emailVerified: true,
    },
  });

  await p.user.update({
    where: { email: "inspector@firsttouch.bh" },
    data: {
      specialty: "هندسة مدنية — فحص جودة البناء",
      phone: "+97333778899",
      bioAr: "مهندس مدني معتمد بخبرة 15 عاماً في فحص الجودة وإدارة المشاريع الإنشائية.",
      rating: 4.9,
      totalProjects: 83,
      emailVerified: true,
    },
  });

  console.log("✅ تم تحديث بيانات المستخدمين");

  // ── 2. تحديث المشروع ────────────────────────
  await p.project.update({
    where: { id: 1 },
    data: {
      descriptionAr: "فيلا سكنية فاخرة على مساحة 600م²، طابقين + سطح. تشمل 5 غرف نوم، صالة رئيسية، غرفة خادمة، ومواقف سيارات. المواصفات حسب الكود الإنشائي البحريني.",
      areaSqm: 600,
      floors: 2,
      totalBudget: 185000,
      hasDesigns: true,
      ownerConditions: "• استخدام أسمنت عربي مكة 52.5 فقط\n• خرسانة بقوة لا تقل عن 300 كجم/سم²\n• حديد التسليح من نجران أو ينبع\n• تنظيف الموقع يومياً قبل 6م\n• موافقة المالك على أي تغيير في المواصفات",
    },
  });

  console.log("✅ تم تحديث بيانات المشروع");

  // ── 3. تحديث المرحلة 1 (الأساسات — مكتملة) ──
  const stage1Items = await p.checklistItem.findMany({
    where: { subStage: { stageId: 1 } },
    orderBy: { id: "asc" },
  });

  // البند 1: تجهيز المواد والمعدات
  const item1 = stage1Items[0];
  if (item1) {
    await p.checklistItem.update({
      where: { id: item1.id },
      data: {
        textAr: "تجهيز وتوريد مواد الأساسات (حصى، رمل، أسمنت، حديد)",
        cost: 12500,
        contractorDone: true,
        contractorNotes: "تم توريد جميع المواد المعتمدة: أسمنت مكة 52.5 (120 كيس)، حديد تسليح 12مم من ينبع (8 طن)، حصى مغسول (25م³)، رمل خشن (15م³). الفاتورة رقم INV-2026-0041.",
        contractorDate: new Date("2026-01-15"),
        inspectorDone: true,
        inspectorApproved: true,
        inspectorNotes: "تم فحص عينات المواد ومطابقتها للمواصفات. شهادات الجودة مستلمة ومحفوظة. المواد مخزنة بشكل سليم.",
        inspectorDate: new Date("2026-01-16"),
        ownerDone: true,
        ownerApproved: true,
        ownerDate: new Date("2026-01-17"),
      },
    });

    // صور المواد
    await p.itemFile.createMany({
      data: [
        { itemId: item1.id, fileName: "مواد_الاساسات_الرمل_والحصى.svg", filePath: makeSitePhoto("مواد الأساسات","رمل وحصى — مستودع الموقع","foundation"), fileType: "image", fileSize: 45000, role: "contractor" },
        { itemId: item1.id, fileName: "توريد_حديد_التسليح.svg", filePath: makeSitePhoto("حديد التسليح","8 طن حديد ينبع 12مم","rebar"), fileType: "image", fileSize: 48000, role: "contractor" },
        { itemId: item1.id, fileName: "شهادة_جودة_المواد.svg", filePath: makeInspectionReport("تجهيز المواد","approved","جميع المواد مطابقة للمواصفات البحرينية وشهادات الجودة مستلمة من الموردين المعتمدين."), fileType: "document", fileSize: 95000, role: "inspector" },
      ],
    });
  }

  // البند 2: تنفيذ الأعمال الرئيسية (الحفر والصب)
  const item2 = stage1Items[1];
  if (item2) {
    await p.checklistItem.update({
      where: { id: item2.id },
      data: {
        textAr: "حفر وتسوية وصب الأساسات الخرسانية",
        cost: 28000,
        contractorDone: true,
        contractorNotes: "تم الحفر على عمق 2.5م. تركيب القوالب الخشبية ووضع حديد التسليح على 3 طبقات. صب الخرسانة بقوة 300 كجم/سم² بتاريخ 20/1/2026. تم المعالجة المائية لمدة 7 أيام.",
        contractorDate: new Date("2026-01-20"),
        inspectorDone: true,
        inspectorApproved: true,
        inspectorNotes: "تم الفحص أثناء الصب والتأكد من صحة التسليح والتغطية. عينات خرسانة مرسلة للمختبر. النتيجة: 315 كجم/سم² ✅",
        inspectorDate: new Date("2026-01-21"),
        ownerDone: true,
        ownerApproved: true,
        ownerDate: new Date("2026-01-22"),
      },
    });

    await p.itemFile.createMany({
      data: [
        { itemId: item2.id, fileName: "حفر_الاساسات_عمق_2.5م.svg", filePath: makeSitePhoto("حفر الأساسات","عمق الحفر 2.5م — الموقع الرفاع","foundation"), fileType: "image", fileSize: 52000, role: "contractor" },
        { itemId: item2.id, fileName: "تسليح_الاساسات_قبل_الصب.svg", filePath: makeSitePhoto("تسليح الأساسات","حديد التسليح جاهز للصب","rebar"), fileType: "image", fileSize: 49000, role: "contractor" },
        { itemId: item2.id, fileName: "صب_الخرسانة_20_يناير.svg", filePath: makeSitePhoto("صب الخرسانة","صب أساسات الطابق الأرضي","concrete"), fileType: "image", fileSize: 55000, role: "contractor" },
        { itemId: item2.id, fileName: "فيديو_توثيق_صب_الخرسانة.svg", filePath: makeVideoThumb("صب أساسات الطابق الأرضي"), fileType: "video", fileSize: 185000, role: "contractor" },
        { itemId: item2.id, fileName: "تقرير_فحص_الاساسات.svg", filePath: makeInspectionReport("صب الأساسات","approved","الخرسانة بقوة 315 كجم/سم² — تتجاوز الحد المطلوب 300. التسليح سليم والتغطية كافية 4سم."), fileType: "document", fileSize: 110000, role: "inspector" },
      ],
    });
  }

  // البند 3: فحص واعتماد
  const item3 = stage1Items[2];
  if (item3) {
    await p.checklistItem.update({
      where: { id: item3.id },
      data: {
        textAr: "فحص نهائي واعتماد مرحلة الأساسات",
        cost: 3500,
        contractorDone: true,
        contractorNotes: "تم الانتهاء الكامل من مرحلة الأساسات. الموقع جاهز لمرحلة الهيكل الخرساني.",
        contractorDate: new Date("2026-01-28"),
        inspectorDone: true,
        inspectorApproved: true,
        inspectorNotes: "الفحص النهائي لمرحلة الأساسات مكتمل. جميع الأعمال مطابقة للمواصفات. أوصي بالمضي في مرحلة الهيكل.",
        inspectorDate: new Date("2026-01-29"),
        ownerDone: true,
        ownerApproved: true,
        ownerDate: new Date("2026-01-30"),
      },
    });

    await p.itemFile.createMany({
      data: [
        { itemId: item3.id, fileName: "الاساسات_مكتملة_نظرة_عامة.svg", filePath: makeSitePhoto("الأساسات مكتملة","نظرة عامة على الأساسات المكتملة","foundation"), fileType: "image", fileSize: 58000, role: "contractor" },
        { itemId: item3.id, fileName: "تقرير_اعتماد_مرحلة_الاساسات.svg", filePath: makeInspectionReport("الأساسات والقواعد","approved","تم الاعتماد النهائي لمرحلة الأساسات. جميع الأعمال مطابقة للمواصفات الفنية والكود الإنشائي البحريني. يُسمح بالمضي في مرحلة الهيكل الخرساني."), fileType: "document", fileSize: 125000, role: "inspector" },
      ],
    });
  }

  console.log("✅ تم تحديث مرحلة الأساسات بالملفات والبيانات");

  // ── 4. بنود المرحلة 2 (الهيكل — قيد التنفيذ) ──
  const stage2Items = await p.checklistItem.findMany({
    where: { subStage: { stageId: 2 } },
    orderBy: { id: "asc" },
  });

  // البند 4: جاهز للتنفيذ بانتظار المقاول
  const item4 = stage2Items[0];
  if (item4) {
    await p.checklistItem.update({
      where: { id: item4.id },
      data: {
        textAr: "تجهيز وتوريد مواد الهيكل الخرساني (أعمدة وجسور)",
        cost: 35000,
        contractorDone: true,
        contractorNotes: "تم توريد مواد الهيكل: حديد تسليح 16مم و20مم (22 طن)، خشب القوالب (200م²)، أسمنت مكة (300 كيس). جاهز للبدء في أعمال الأعمدة.",
        contractorDate: new Date("2026-02-05"),
        inspectorDone: false,
        ownerDone: false,
      },
    });

    await p.itemFile.createMany({
      data: [
        { itemId: item4.id, fileName: "توريد_حديد_الهيكل_16مم_20مم.svg", filePath: makeSitePhoto("مواد الهيكل","حديد تسليح 16مم و20مم جاهز","rebar"), fileType: "image", fileSize: 51000, role: "contractor" },
        { itemId: item4.id, fileName: "قوالب_الهيكل_الخشبية.svg", filePath: makeSitePhoto("قوالب الهيكل","قوالب خشبية للأعمدة والجسور","concrete"), fileType: "image", fileSize: 44000, role: "contractor" },
        { itemId: item4.id, fileName: "فيديو_الموقع_قبل_بدء_الهيكل.svg", filePath: makeVideoThumb("الموقع قبل بدء أعمال الهيكل"), fileType: "video", fileSize: 210000, role: "contractor" },
      ],
    });
  }

  // البند 5: جاري التنفيذ الآن
  const item5 = stage2Items[1];
  if (item5) {
    await p.checklistItem.update({
      where: { id: item5.id },
      data: {
        textAr: "تنفيذ أعمال الأعمدة والجسور — الطابق الأرضي",
        cost: 42000,
        // لم يُسلَّم بعد — قيد التنفيذ
        contractorDone: false,
      },
    });
  }

  console.log("✅ تم تحديث مرحلة الهيكل الخرساني");

  // ── 5. تعليقات واقعية بين الفريق ──────────────
  const comments = [
    // تعليقات على بند الحفر (item2)
    { itemId: item2 ? item2.id : 2, userId: 2, text: "تم الانتهاء من الحفر، عمق 2.5م كما في المخططات. الجهاز الإلكتروني أكد أن التربة مناسبة. غداً يبدأ وضع التسليح.", createdAt: new Date("2026-01-19T08:30:00") },
    { itemId: item2 ? item2.id : 2, userId: 3, text: "ممتاز. سأكون في الموقع الساعة 10 صباحاً للتفتيش قبل وضع التسليح. يرجى إبقاء منطقة الحفر جافة.", createdAt: new Date("2026-01-19T09:15:00") },
    { itemId: item2 ? item2.id : 2, userId: 1, text: "شكراً للجميع. هل يمكن الصب قبل العيد؟", createdAt: new Date("2026-01-19T10:00:00") },
    { itemId: item2 ? item2.id : 2, userId: 2, text: "نعم سيدي، خططنا للصب يوم 20/1. الجدول يسير بشكل مثالي ✅", createdAt: new Date("2026-01-19T10:30:00") },
    { itemId: item2 ? item2.id : 2, userId: 3, text: "تقرير المختبر وصل — قوة الخرسانة 315 كجم/سم². ممتاز جداً 💪", createdAt: new Date("2026-01-25T14:00:00") },
    // تعليقات على بند مواد الهيكل (item4)
    { itemId: item4 ? item4.id : 4, userId: 2, text: "وصلت مواد الهيكل صباح اليوم. كمية الحديد 22 طن كما تم الاتفاق. سنبدأ بالأعمدة الثلاثاء القادم.", createdAt: new Date("2026-02-05T07:00:00") },
    { itemId: item4 ? item4.id : 4, userId: 3, text: "سأفحص المواد الأثنين قبل بدء التنفيذ. يرجى إعداد شهادات المختبر للحديد.", createdAt: new Date("2026-02-05T08:30:00") },
    { itemId: item4 ? item4.id : 4, userId: 1, text: "هل المواصفات نفسها للحديد؟ أريد التأكد أنه من ينبع.", createdAt: new Date("2026-02-05T09:00:00") },
    { itemId: item4 ? item4.id : 4, userId: 2, text: "نعم سيدي أحمد، حديد ينبع 16مم و20مم. الفاتورة والشهادة مرفقة في الملفات 📄", createdAt: new Date("2026-02-05T09:20:00") },
    { itemId: item4 ? item4.id : 4, userId: 3, text: "فحصت الشهادات — كل شيء ممتاز. المواد معتمدة ✅ يمكن البدء بالتنفيذ.", createdAt: new Date("2026-02-06T10:00:00") },
  ];

  for (const c of comments) {
    await p.itemComment.create({ data: c });
  }

  console.log("✅ تم إضافة التعليقات الواقعية");

  // ── 6. إشعارات تعكس سير العمل ──────────────
  await p.notification.createMany({
    data: [
      // إشعارات المالك
      { userId: 1, type: "success", titleAr: "✅ تم اعتماد مرحلة الأساسات", messageAr: "المفتش خالد اعتمد جميع بنود مرحلة الأساسات. المشروع ينتقل لمرحلة الهيكل الخرساني.", isRead: true, createdAt: new Date("2026-01-30") },
      { userId: 1, type: "action", titleAr: "⏳ المقاول بدأ أعمال الهيكل", messageAr: "محمد المقاول رفع ملفات توريد مواد الهيكل. بانتظار فحص المفتش.", isRead: true, createdAt: new Date("2026-02-05") },
      { userId: 1, type: "info", titleAr: "📊 تقدم المشروع: 33%", messageAr: "مرحلة واحدة مكتملة من أصل 3 مراحل نشطة. الجدول الزمني على المسار الصحيح.", isRead: false, createdAt: new Date("2026-02-10") },
      // إشعارات المقاول
      { userId: 2, type: "success", titleAr: "💰 تم صرف دفعة مرحلة الأساسات", messageAr: "تم تحويل 44,000 د.ب إلى حسابك مقابل إنجاز مرحلة الأساسات. شكراً على الإتقان.", isRead: true, createdAt: new Date("2026-01-31") },
      { userId: 2, type: "action", titleAr: "⏳ بانتظار فحص مواد الهيكل", messageAr: "المفتش خالد سيفحص مواد الهيكل يوم الاثنين. يرجى تجهيز شهادات المختبر.", isRead: false, createdAt: new Date("2026-02-05") },
      // إشعارات المفتش
      { userId: 3, type: "action", titleAr: "🔍 مطلوب فحص بنود جديدة", messageAr: "المقاول سلّم بند (تجهيز مواد الهيكل) بانتظار فحصك واعتمادك.", isRead: false, createdAt: new Date("2026-02-05") },
      { userId: 3, type: "success", titleAr: "✅ تم تسجيل تقرير الأساسات", messageAr: "تقرير الفحص النهائي لمرحلة الأساسات تم حفظه في النظام.", isRead: true, createdAt: new Date("2026-01-29") },
    ],
  });

  console.log("✅ تم إضافة الإشعارات");

  // ── 7. تحديث المحفظة بمعاملات واقعية ────────
  const wallet = await p.wallet.findFirst({ where: { userId: 1 } });
  if (wallet) {
    await p.wallet.update({
      where: { id: wallet.id },
      data: { balance: 89500, reserved: 42000, totalPaid: 44000 },
    });

    await p.transaction.createMany({
      data: [
        { walletId: wallet.id, amount: 185000, type: "deposit", descriptionAr: "إيداع قيمة المشروع الكاملة — فيلا الرفاع", reference: "DEP-2026-001", createdAt: new Date("2026-01-10") },
        { walletId: wallet.id, amount: -44000, type: "payment", descriptionAr: "دفعة مرحلة الأساسات — محمد المقاول", reference: "PAY-2026-001", createdAt: new Date("2026-01-31") },
        { walletId: wallet.id, amount: -7500, type: "payment", descriptionAr: "رسوم المفتش — خالد المفتش (مرحلة الأساسات)", reference: "PAY-2026-002", createdAt: new Date("2026-01-31") },
        { walletId: wallet.id, amount: -2500, type: "fee", descriptionAr: "عمولة المنصة 3% — FIRST TOUCH", reference: "FEE-2026-001", createdAt: new Date("2026-01-31") },
        { walletId: wallet.id, amount: -500, type: "fee", descriptionAr: "رسوم تحقق الهوية والوثائق", reference: "FEE-2026-002", createdAt: new Date("2026-01-10") },
      ],
    });

    console.log("✅ تم تحديث المحفظة والمعاملات");
  }

  // ── 8. صور المشروع ──────────────────────────
  await p.projectImage.createMany({
    data: [
      { projectId: 1, imageUrl: makeSitePhoto("نظرة عامة","الموقع قبل البدء — يناير 2026","foundation"), captionAr: "الموقع قبل البدء — يناير 2026", isPrimary: true },
      { projectId: 1, imageUrl: makeSitePhoto("الأساسات مكتملة","الأساسات بعد الصب والمعالجة","concrete"), captionAr: "الأساسات مكتملة — فبراير 2026", isPrimary: false },
      { projectId: 1, imageUrl: makeSitePhoto("مواد الهيكل","توريد مواد الهيكل الخرساني","rebar"), captionAr: "استلام مواد الهيكل — فبراير 2026", isPrimary: false },
    ],
  });

  console.log("✅ تم إضافة صور المشروع");

  // ── 9. تقييمات وهمية لمشاريع سابقة ─────────
  // نُضيف مشروعاً مكتملاً سابقاً لإظهاره في معرض الإنجازات
  const completedProject = await p.project.create({
    data: {
      titleAr: "عمارة سكنية — المحرق",
      type: "apartment",
      areaSqm: 1200,
      floors: 4,
      locationAr: "المحرق، البحرين",
      totalBudget: 420000,
      descriptionAr: "عمارة سكنية 4 طوابق، 16 شقة، مواقف سيارات.",
      status: "completed",
      ownerId: 1,
      contractorId: 2,
      inspectorId: 3,
      completedAt: new Date("2025-11-15"),
      createdAt: new Date("2025-06-01"),
    },
  });

  // تقييمات للمشروع المكتمل
  await p.projectRating.createMany({
    data: [
      { projectId: completedProject.id, raterId: 1, ratedId: 2, ratedRole: "contractor", rating: 5, reviewAr: "عمل ممتاز وإتقان عالٍ، التزام تام بالجدول الزمني. شركة موثوقة بامتياز." },
      { projectId: completedProject.id, raterId: 1, ratedId: 3, ratedRole: "inspector", rating: 5, reviewAr: "دقيق جداً في الفحص، تقاريره شاملة واحترافية. ينصح به بشدة." },
    ],
  });

  // تحديث متوسط تقييم المقاول والمفتش
  await p.user.update({ where: { id: 2 }, data: { rating: 4.85, totalProjects: 48 } });
  await p.user.update({ where: { id: 3 }, data: { rating: 4.95, totalProjects: 84 } });

  console.log("✅ تم إضافة مشروع مكتمل سابق مع التقييمات");

  // ── ملخص ──────────────────────────────────────
  console.log("\n" + "═".repeat(50));
  console.log("🎉 اكتمل إدخال البيانات التجريبية بنجاح!\n");
  console.log("📋 ملخص ما تم إضافته:");
  console.log("  ✅ ملفات صور وتقارير لمرحلة الأساسات (5 بنود)");
  console.log("  ✅ ملفات صور وفيديو لمرحلة الهيكل (جاري)");
  console.log("  ✅ 10 تعليقات واقعية بين الفريق");
  console.log("  ✅ 7 إشعارات تعكس سير العمل");
  console.log("  ✅ محفظة مع 5 معاملات مالية");
  console.log("  ✅ 3 صور للمشروع الرئيسي");
  console.log("  ✅ مشروع مكتمل سابق مع تقييمات نجوم");
  console.log("═".repeat(50));
}

main().then(() => process.exit(0)).catch((e) => { console.error("❌ خطأ:", e.message); process.exit(1); });
