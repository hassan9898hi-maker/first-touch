const ExcelJS = require("exceljs");

async function main() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "FIRST TOUCH";
  wb.created = new Date();

  // ═══════ COLORS ═══════
  const NAVY = "0D1B2A";
  const OCEAN = "1565C0";
  const WHITE = "FFFFFF";
  const LT_BLUE = "D6E4F0";
  const LT_GREEN = "C6EFCE";
  const LT_RED = "FFC7CE";
  const LT_YELLOW = "FFFFCC";
  const LT_PURPLE = "E8D5F5";
  const LT_GRAY = "F2F2F2";
  const GREEN_TXT = "006100";
  const RED_TXT = "9C0006";
  const AMBER_TXT = "9C6500";

  const headerFill = (color) => ({ type: "pattern", pattern: "solid", fgColor: { argb: color } });
  const thinBorder = { style: "thin", color: { argb: "999999" } };
  const allBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

  function styleHeaderRow(ws, row, fill = OCEAN) {
    row.eachCell((cell) => {
      cell.font = { name: "Arial", bold: true, size: 10, color: { argb: WHITE } };
      cell.fill = headerFill(fill);
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = allBorders;
    });
    row.height = 28;
  }

  function styleDataRow(ws, row) {
    row.eachCell((cell, colNumber) => {
      cell.font = { name: "Arial", size: 10 };
      cell.alignment = { horizontal: colNumber <= 2 ? "right" : "center", vertical: "middle", wrapText: true };
      cell.border = allBorders;
    });
  }

  function statusFill(status) {
    if (status === "مكتمل") return headerFill(LT_GREEN);
    if (status === "جزئي" || status.includes("جزئي")) return headerFill(LT_YELLOW);
    return headerFill(LT_RED);
  }

  function priorityFill(p) {
    if (p === "حرج") return headerFill(LT_RED);
    if (p === "عالي") return headerFill("FFD7D7");
    if (p === "متوسط") return headerFill(LT_YELLOW);
    return headerFill(LT_GREEN);
  }

  // ══════════════════════════════════════════════════════════
  // SHEET 1: Executive Summary
  // ══════════════════════════════════════════════════════════
  const ws1 = wb.addWorksheet("الملخص التنفيذي", { views: [{ rightToLeft: true }] });

  ws1.mergeCells("A1:H1");
  const titleCell = ws1.getCell("A1");
  titleCell.value = "FIRST TOUCH — تحليل الفجوات وخطة الإغلاق";
  titleCell.font = { name: "Arial", bold: true, size: 18, color: { argb: WHITE } };
  titleCell.fill = headerFill(NAVY);
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  ws1.getRow(1).height = 45;

  ws1.mergeCells("A2:H2");
  const subCell = ws1.getCell("A2");
  subCell.value = "منصة إدارة مشاريع البناء — التاريخ: 31 مارس 2026";
  subCell.font = { name: "Arial", size: 11, color: { argb: WHITE } };
  subCell.fill = headerFill(OCEAN);
  subCell.alignment = { horizontal: "center", vertical: "middle" };

  // Stats
  const stats = [
    ["نسبة الإكتمال الكلية", "85%"],
    ["عدد الميزات المكتملة", "14"],
    ["عدد الفجوات الحرجة", "5"],
    ["عدد الفجوات المتوسطة", "5"],
    ["عدد الفجوات المنخفضة", "4"],
    ["إجمالي سطور الكود (Backend)", "3,413"],
    ["إجمالي سطور الكود (Frontend)", "5,321"],
    ["تغطية الاختبارات", "0%"],
  ];

  let r = 4;
  const statHeader = ws1.getRow(r);
  statHeader.getCell(1).value = "المؤشر";
  statHeader.getCell(2).value = "القيمة";
  statHeader.eachCell((cell) => {
    cell.font = { name: "Arial", bold: true, size: 10 };
    cell.fill = headerFill(LT_BLUE);
    cell.border = allBorders;
  });

  stats.forEach(([label, val]) => {
    r++;
    const row = ws1.getRow(r);
    row.getCell(1).value = label;
    row.getCell(2).value = val;
    row.eachCell((cell) => { cell.font = { name: "Arial", size: 10 }; cell.border = allBorders; });
    row.getCell(2).alignment = { horizontal: "center" };
    row.getCell(2).font = { name: "Arial", size: 10, bold: true };
  });

  // Feature matrix
  r += 2;
  ws1.mergeCells(`A${r}:H${r}`);
  ws1.getCell(`A${r}`).value = "مصفوفة اكتمال الميزات";
  ws1.getCell(`A${r}`).font = { name: "Arial", bold: true, size: 12, color: { argb: NAVY } };
  ws1.getCell(`A${r}`).fill = headerFill(LT_GRAY);

  r++;
  const featHeaders = ["الميزة", "Backend %", "Frontend %", "الحالة", "الأولوية", "Sprint", "الملاحظات", "المسؤول"];
  const featHeaderRow = ws1.getRow(r);
  featHeaders.forEach((h, i) => { featHeaderRow.getCell(i + 1).value = h; });
  styleHeaderRow(ws1, featHeaderRow);

  const features = [
    ["التسجيل والمصادقة", "100%", "100%", "مكتمل", "-", "-", "JWT + OTP + تحقق بريد", "Backend"],
    ["المشاريع (المالك)", "100%", "95%", "مكتمل", "-", "-", "إنشاء، عروض، موافقات", "Full Stack"],
    ["تحليل AI الذكي", "100%", "100%", "مكتمل", "-", "-", "Claude API + تحليل ملفات", "Backend"],
    ["عروض الأسعار (BOQ)", "100%", "90%", "مكتمل", "-", "-", "تقديم، قبول، رفض", "Full Stack"],
    ["الفحص والاعتماد", "100%", "90%", "مكتمل", "-", "-", "فحص، موافقة، رفض", "Full Stack"],
    ["تسليم أعمال المقاول", "100%", "85%", "مكتمل", "-", "-", "تسليم بنود مع توثيق", "Full Stack"],
    ["المحفظة والدفع", "100%", "80%", "مكتمل", "-", "-", "إيداع، سحب، معاملات", "Full Stack"],
    ["لوحة الأدمن", "85%", "70%", "مكتمل", "منخفض", "Sprint 3", "ينقص: طلبات البنك", "Backend"],
    ["المجمعات (المطور)", "70%", "90%", "جزئي", "متوسط", "Sprint 2", "صلاحيات، validation", "Full Stack"],
    ["رفع الملفات", "100%", "50%", "جزئي", "عالي", "Sprint 1", "Frontend غير مربوط", "Frontend"],
    ["التعليقات", "100%", "40%", "جزئي", "متوسط", "Sprint 2", "UI ناقص", "Frontend"],
    ["الإشعارات الفورية", "50%", "0%", "غير مكتمل", "حرج", "Sprint 1", "Socket.io غير متصل", "Full Stack"],
    ["التمويل", "30%", "20%", "ناقص", "متوسط", "Sprint 2", "بدون workflow", "Full Stack"],
    ["اختبارات", "0%", "0%", "معدوم", "عالي", "Sprint 3", "لا تغطية", "QA"],
  ];

  features.forEach((feat) => {
    r++;
    const row = ws1.getRow(r);
    feat.forEach((val, i) => { row.getCell(i + 1).value = val; });
    styleDataRow(ws1, row);
    row.getCell(4).fill = statusFill(feat[3]);
  });

  ws1.getColumn(1).width = 28;
  ws1.getColumn(2).width = 14;
  ws1.getColumn(3).width = 14;
  ws1.getColumn(4).width = 14;
  ws1.getColumn(5).width = 12;
  ws1.getColumn(6).width = 12;
  ws1.getColumn(7).width = 32;
  ws1.getColumn(8).width = 14;

  // ══════════════════════════════════════════════════════════
  // SHEET 2: Gap Closure Plan
  // ══════════════════════════════════════════════════════════
  const ws2 = wb.addWorksheet("خطة إغلاق الفجوات", { views: [{ rightToLeft: true }] });

  ws2.mergeCells("A1:J1");
  ws2.getCell("A1").value = "خطة إغلاق الفجوات — مرتبة من الأهم للأقل أهمية";
  ws2.getCell("A1").font = { name: "Arial", bold: true, size: 16, color: { argb: WHITE } };
  ws2.getCell("A1").fill = headerFill(NAVY);
  ws2.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
  ws2.getRow(1).height = 40;

  r = 3;
  const gapHeaders = ["#", "الفجوة", "الوصف التفصيلي", "الأولوية", "التأثير", "Sprint", "المدة", "تاريخ البدء", "تاريخ الانتهاء", "الحالة"];
  const gapHeaderRow = ws2.getRow(r);
  gapHeaders.forEach((h, i) => { gapHeaderRow.getCell(i + 1).value = h; });
  styleHeaderRow(ws2, gapHeaderRow);

  const gaps = [
    [1, "أمان البيانات المكشوفة", "إزالة DATABASE_URL و JWT secrets من server.js/start.js — استخدام .env فقط + تغيير كلمات المرور", "حرج", "أمني — اختراق كامل", "Sprint 1", "1 يوم", "1 أبريل 2026", "1 أبريل 2026", "معلّق"],
    [2, "ربط Socket.io بالفرونت", "إنشاء اتصال Socket.io في App.jsx، الانضمام لغرفة المستخدم، استقبال الإشعارات وتحديث badges", "حرج", "تجربة المستخدم — لا إشعارات فورية", "Sprint 1", "3 أيام", "1 أبريل 2026", "3 أبريل 2026", "معلّق"],
    [3, "تسجيل أرباح المقاول تلقائياً", "عند موافقة المالك على بند → إنشاء سجل ContractorEarning تلقائياً + تحديث المحفظة", "حرج", "مالي — المقاول لا يحصل على أرباحه", "Sprint 1", "2 يوم", "3 أبريل 2026", "4 أبريل 2026", "معلّق"],
    [4, "ربط رفع الملفات بالواجهة", "تحويل FileUploader لإرسال FormData بدل Base64 → ربط مع Cloudinary/Local → معاينة", "حرج", "وظيفي — الملفات لا تُحفظ فعلياً", "Sprint 1", "3 أيام", "4 أبريل 2026", "7 أبريل 2026", "معلّق"],
    [5, "إدارة طلبات البنك (أدمن)", "GET /api/admin/bank-requests + موافقة/رفض + واجهة أدمن لإدارتها", "حرج", "وظيفي — طلبات بدون مراجعة", "Sprint 1", "2 يوم", "7 أبريل 2026", "8 أبريل 2026", "معلّق"],
    [6, "تكامل AI Upload في الواجهة", "ربط AIProjectUpload بالـ modal + زر في dashboard المالك + اختبار شامل", "عالي", "ميزة رئيسية — AI غير متاح للمستخدم", "Sprint 1", "2 يوم", "9 أبريل 2026", "10 أبريل 2026", "معلّق"],
    [7, "إصلاح workflow التمويل", "endpoints موافقة/رفض + جدول سداد + رفع مستندات + واجهة تتبع الحالة", "عالي", "وظيفي — ميزة معطلة", "Sprint 2", "4 أيام", "13 أبريل 2026", "16 أبريل 2026", "معلّق"],
    [8, "Pagination لجميع القوائم", "إضافة limit/offset لـ projects, compounds, notifications + عرض أرقام الصفحات", "عالي", "أداء — بطء مع بيانات كثيرة", "Sprint 2", "2 يوم", "16 أبريل 2026", "17 أبريل 2026", "معلّق"],
    [9, "اكتمال ميزة المجمعات", "تفعيل صلاحيات المشرفين + validation على PATCH + ربط تقدم الوحدات بإحصائيات المجمع", "متوسط", "وظيفي — edge cases", "Sprint 2", "4 أيام", "17 أبريل 2026", "22 أبريل 2026", "معلّق"],
    [10, "واجهة التعليقات", "مكون عرض/إضافة التعليقات في تفاصيل البنود + تحديث فوري عبر Socket.io", "متوسط", "تجربة المستخدم", "Sprint 2", "2 يوم", "22 أبريل 2026", "23 أبريل 2026", "معلّق"],
    [11, "رفع صور مشاكل الجودة", "ربط رفع الصور في QualityIssue مع Cloudinary + معاينة الصور في الواجهة", "متوسط", "وظيفي — توثيق ناقص", "Sprint 2", "2 يوم", "23 أبريل 2026", "24 أبريل 2026", "معلّق"],
    [12, "البحث والفلترة", "إضافة بحث في المشاريع والمجمعات والمستخدمين مع فلاتر حسب الحالة والنوع", "متوسط", "تجربة المستخدم", "Sprint 2", "3 أيام", "24 أبريل 2026", "28 أبريل 2026", "معلّق"],
    [13, "تنسيق التواريخ", "إنشاء utility لتنسيق التواريخ بالعربي واستخدامه في كل الواجهات", "متوسط", "تجربة المستخدم", "Sprint 2", "1 يوم", "28 أبريل 2026", "28 أبريل 2026", "معلّق"],
    [14, "تصميم متجاوب (Responsive)", "إضافة media queries و breakpoints للموبايل والتابلت — Mobile-First", "منخفض", "وصول — لا يعمل على الموبايل", "Sprint 3", "5 أيام", "29 أبريل 2026", "5 مايو 2026", "معلّق"],
    [15, "Accessibility (WCAG)", "ARIA labels + تنقل لوحة المفاتيح + تباين ألوان كافي (AA)", "منخفض", "وصول — غير متاح لذوي الإعاقة", "Sprint 3", "3 أيام", "5 مايو 2026", "7 مايو 2026", "معلّق"],
    [16, "منع الطلبات المكررة", "تعطيل الأزرار أثناء الإرسال + debounce + optimistic UI", "منخفض", "جودة — بيانات مكررة", "Sprint 3", "2 يوم", "7 مايو 2026", "8 مايو 2026", "معلّق"],
    [17, "اختبارات وحدة وتكامل", "إعداد Jest + Supertest (Backend) + React Testing Library (Frontend) + CI", "منخفض", "جودة — لا ضمان استقرار", "Sprint 3", "5 أيام", "8 مايو 2026", "14 مايو 2026", "معلّق"],
    [18, "تقسيم App.jsx", "تقسيم 5321 سطر إلى مكونات منفصلة حسب الدور والميزة", "منخفض", "صيانة — صعوبة التطوير", "Sprint 3", "3 أيام", "14 مايو 2026", "18 مايو 2026", "معلّق"],
  ];

  gaps.forEach((gap) => {
    r++;
    const row = ws2.getRow(r);
    gap.forEach((val, i) => { row.getCell(i + 1).value = val; });
    styleDataRow(ws2, row);
    row.getCell(4).fill = priorityFill(gap[3]);
    row.getCell(4).alignment = { horizontal: "center", vertical: "middle" };
  });

  ws2.getColumn(1).width = 5;
  ws2.getColumn(2).width = 28;
  ws2.getColumn(3).width = 58;
  ws2.getColumn(4).width = 12;
  ws2.getColumn(5).width = 32;
  ws2.getColumn(6).width = 12;
  ws2.getColumn(7).width = 10;
  ws2.getColumn(8).width = 18;
  ws2.getColumn(9).width = 18;
  ws2.getColumn(10).width = 10;

  // ══════════════════════════════════════════════════════════
  // SHEET 3: Sprint Timeline
  // ══════════════════════════════════════════════════════════
  const ws3 = wb.addWorksheet("الجدول الزمني", { views: [{ rightToLeft: true }] });

  ws3.mergeCells("A1:H1");
  ws3.getCell("A1").value = "الجدول الزمني — Sprint Breakdown";
  ws3.getCell("A1").font = { name: "Arial", bold: true, size: 16, color: { argb: WHITE } };
  ws3.getCell("A1").fill = headerFill(NAVY);
  ws3.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
  ws3.getRow(1).height = 40;

  const sprints = [
    { name: "Sprint 1 — الأساسيات الحرجة (الأعلى أهمية)", dates: "1 - 12 أبريل 2026", duration: "أسبوعان", color: "C62828", tasks: [
      { task: "إزالة البيانات المكشوفة من الكود (DATABASE_URL, JWT)", days: "1 يوم", priority: "حرج" },
      { task: "ربط Socket.io بالفرونت اند — إشعارات فورية + badges", days: "3 أيام", priority: "حرج" },
      { task: "تسجيل أرباح المقاول تلقائياً عند موافقة المالك", days: "2 يوم", priority: "حرج" },
      { task: "ربط رفع الملفات مع Cloudinary/Local Storage", days: "3 أيام", priority: "حرج" },
      { task: "إضافة endpoint طلبات البنك + واجهة أدمن", days: "2 يوم", priority: "حرج" },
      { task: "تكامل AI Upload في واجهة المالك (الرفع الذكي)", days: "2 يوم", priority: "عالي" },
    ]},
    { name: "Sprint 2 — التحسينات الوظيفية (أهمية متوسطة-عالية)", dates: "13 - 28 أبريل 2026", duration: "أسبوعان", color: "E65100", tasks: [
      { task: "إصلاح workflow التمويل كاملاً (موافقة + سداد + مستندات)", days: "4 أيام", priority: "عالي" },
      { task: "Pagination لجميع القوائم (مشاريع، مجمعات، إشعارات)", days: "2 يوم", priority: "عالي" },
      { task: "اكتمال المجمعات (صلاحيات المشرفين + validation)", days: "4 أيام", priority: "متوسط" },
      { task: "واجهة التعليقات على البنود + تحديث فوري", days: "2 يوم", priority: "متوسط" },
      { task: "رفع صور مشاكل الجودة مع Cloudinary", days: "2 يوم", priority: "متوسط" },
      { task: "البحث والفلترة في جميع القوائم", days: "3 أيام", priority: "متوسط" },
      { task: "تنسيق التواريخ بالعربي", days: "1 يوم", priority: "متوسط" },
    ]},
    { name: "Sprint 3 — الجودة والصقل (أهمية منخفضة)", dates: "29 أبريل - 18 مايو 2026", duration: "3 أسابيع", color: "1565C0", tasks: [
      { task: "تصميم متجاوب Responsive (موبايل + تابلت)", days: "5 أيام", priority: "منخفض" },
      { task: "Accessibility — WCAG 2.1 AA", days: "3 أيام", priority: "منخفض" },
      { task: "منع الطلبات المكررة (Debounce + disabled buttons)", days: "2 يوم", priority: "منخفض" },
      { task: "اختبارات Jest + Supertest + React Testing Library", days: "5 أيام", priority: "منخفض" },
      { task: "تقسيم App.jsx إلى مكونات منفصلة (5321 سطر)", days: "3 أيام", priority: "منخفض" },
    ]},
  ];

  r = 3;
  sprints.forEach((sprint) => {
    ws3.mergeCells(`A${r}:H${r}`);
    ws3.getCell(`A${r}`).value = sprint.name;
    ws3.getCell(`A${r}`).font = { name: "Arial", bold: true, size: 13, color: { argb: WHITE } };
    ws3.getCell(`A${r}`).fill = headerFill(sprint.color);
    ws3.getCell(`A${r}`).alignment = { horizontal: "center", vertical: "middle" };
    ws3.getRow(r).height = 35;
    r++;

    const infoRow = ws3.getRow(r);
    infoRow.getCell(1).value = "الفترة:";
    infoRow.getCell(1).font = { name: "Arial", bold: true, size: 10 };
    infoRow.getCell(2).value = sprint.dates;
    infoRow.getCell(4).value = "المدة:";
    infoRow.getCell(4).font = { name: "Arial", bold: true, size: 10 };
    infoRow.getCell(5).value = sprint.duration;
    r++;

    // Sub-headers
    const subRow = ws3.getRow(r);
    ["#", "المهمة", "", "", "", "المدة", "الأولوية", "الحالة"].forEach((h, i) => { subRow.getCell(i + 1).value = h; });
    styleHeaderRow(ws3, subRow, "546E7A");
    r++;

    sprint.tasks.forEach((t, idx) => {
      const taskRow = ws3.getRow(r);
      taskRow.getCell(1).value = idx + 1;
      ws3.mergeCells(`B${r}:E${r}`);
      taskRow.getCell(2).value = t.task;
      taskRow.getCell(6).value = t.days;
      taskRow.getCell(7).value = t.priority;
      taskRow.getCell(8).value = "معلّق";
      styleDataRow(ws3, taskRow);
      taskRow.getCell(7).fill = priorityFill(t.priority);
      taskRow.getCell(8).fill = headerFill(LT_YELLOW);
      r++;
    });
    r++;
  });

  ws3.getColumn(1).width = 6;
  ws3.getColumn(2).width = 24;
  ws3.getColumn(3).width = 16;
  ws3.getColumn(4).width = 12;
  ws3.getColumn(5).width = 16;
  ws3.getColumn(6).width = 12;
  ws3.getColumn(7).width = 12;
  ws3.getColumn(8).width = 10;

  // ══════════════════════════════════════════════════════════
  // SHEET 4: Product Workflow
  // ══════════════════════════════════════════════════════════
  const ws4 = wb.addWorksheet("Workflow المنتج", { views: [{ rightToLeft: true }] });

  ws4.mergeCells("A1:F1");
  ws4.getCell("A1").value = "Workflow المنتج النهائي — رحلة كل مستخدم";
  ws4.getCell("A1").font = { name: "Arial", bold: true, size: 16, color: { argb: WHITE } };
  ws4.getCell("A1").fill = headerFill(NAVY);
  ws4.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
  ws4.getRow(1).height = 40;

  const workflows = [
    { name: "رحلة صاحب المشروع (Owner)", color: "1565C0", steps: [
      ["1", "التسجيل وتفعيل الحساب", "إنشاء حساب → تفعيل البريد → تسجيل الدخول", "مكتمل", "auth.js", "LoginForm"],
      ["2", "إنشاء مشروع (يدوي)", "اختيار نوع → مرحلة بناء → تفاصيل → شروط → ملفات → إرسال", "مكتمل", "projects.js", "NewProjectForm"],
      ["3", "إنشاء مشروع (AI ذكي)", "رفع ملف + وصف → تحليل AI → مراجعة المراحل → إنشاء تلقائي", "مكتمل", "projects.js", "AIProjectUpload"],
      ["4", "استقبال ومراجعة عروض الأسعار", "المقاولون يقدمون BOQ → المالك يراجع التفاصيل → يقبل أفضل عرض", "مكتمل", "projects.js", "QuotationView"],
      ["5", "اختيار المفتش", "المفتشون يتقدمون → المالك يختار → يدفع أتعاب الفحص", "مكتمل", "projects.js", "InspectorApps"],
      ["6", "متابعة التنفيذ والموافقات", "المقاول يسلم → المفتش يفحص → المالك يوافق ويدفع تلقائياً", "مكتمل", "projects.js", "OwnerDecisionForm"],
      ["7", "إدارة المحفظة", "إيداع أموال → دفع تلقائي عند الموافقة → سجل كامل", "مكتمل", "wallet.js", "WalletView"],
      ["8", "طلب تمويل بنكي", "تقديم طلب تمويل → انتظار الموافقة", "جزئي", "projects.js", "ناقص"],
      ["9", "تقييم بعد الاكتمال", "تقييم المقاول والمفتش (1-5 نجوم) + تعليق", "مكتمل", "achievements.js", "RatingForm"],
    ]},
    { name: "رحلة المقاول (Contractor)", color: "E8720C", steps: [
      ["1", "التسجيل بالبيانات التجارية", "إنشاء حساب مقاول → اسم الشركة → السجل التجاري", "مكتمل", "auth.js", "RegisterForm"],
      ["2", "تصفح المشاريع المتاحة", "عرض جميع المشاريع التي تحتاج تسعير", "مكتمل", "projects.js", "ProjectList"],
      ["3", "تقديم عرض سعر BOQ", "ملء جدول كميات تفصيلي → مدة التنفيذ → مدة الضمان → إرسال", "مكتمل", "projects.js", "BOQQuotationForm"],
      ["4", "استلام العقد", "عند قبول العرض → يظهر العقد بالتفاصيل الكاملة", "مكتمل", "dashboard.js", "ContractView"],
      ["5", "تنفيذ وتسليم البنود", "لكل بند: تنفيذ الأعمال → توثيق بالصور والفيديو → تسليم", "مكتمل", "projects.js", "SubmitForm"],
      ["6", "استلام الدفعات", "بعد موافقة المالك → الدفعة تُصرف للمحفظة تلقائياً", "جزئي", "wallet.js", "EarningsView"],
      ["7", "معرض الإنجازات", "عرض المشاريع المكتملة + التقييمات العامة", "مكتمل", "achievements.js", "Gallery"],
    ]},
    { name: "رحلة المفتش (Inspector)", color: "0EAD69", steps: [
      ["1", "التسجيل مع التخصص", "إنشاء حساب مفتش → اختيار التخصص", "مكتمل", "auth.js", "RegisterForm"],
      ["2", "التقدم للمشاريع", "تصفح المشاريع → تقديم ترشيح مع أتعاب الفحص", "مكتمل", "projects.js", "ApplyForm"],
      ["3", "فحص واعتماد البنود", "مراجعة تسليم المقاول → موافقة أو رفض مع ملاحظات وصور", "مكتمل", "projects.js", "ReviewForm"],
      ["4", "لوحة الإحصائيات", "نسبة الموافقة، عدد الفحوصات، المشاريع النشطة", "مكتمل", "dashboard.js", "Dashboard"],
    ]},
    { name: "رحلة المطور العقاري (Developer)", color: "7C3AED", steps: [
      ["1", "إنشاء مجمع سكني", "wizard 6 خطوات: بيانات → وحدات → مراحل → مشرفين → ملخص", "مكتمل", "compounds.js", "CompoundWizard"],
      ["2", "إدارة الوحدات", "تحديث حالة كل وحدة (فيلا/شقة) → تتبع التقدم %", "مكتمل", "compounds.js", "UnitGrid"],
      ["3", "تتبع المواد والكميات", "إضافة مواد → تحديث المستخدم → تنبيهات النقص", "مكتمل", "compounds.js", "MaterialTracker"],
      ["4", "إدارة مشاكل الجودة", "تسجيل مشاكل → تعيين مسؤول → متابعة الحل", "جزئي", "compounds.js", "QualityIssues"],
      ["5", "تتبع المدفوعات", "تسجيل دفعات لكل مقاول/مرحلة", "مكتمل", "compounds.js", "Payments"],
      ["6", "التقارير وتحليل الفجوات", "تقدم، مالي، gap analysis لكل وحدة ومجمع", "مكتمل", "compounds.js", "Reports"],
    ]},
    { name: "رحلة المشرف (Admin)", color: "0D1B2A", steps: [
      ["1", "لوحة إحصائيات النظام", "عدد المستخدمين، المشاريع، رصيد المحافظ الكلي", "مكتمل", "admin.js", "AdminDash"],
      ["2", "إدارة المستخدمين", "بحث، عرض، تعطيل، ترقية، إعادة كلمة مرور", "مكتمل", "admin.js", "UserMgmt"],
      ["3", "إدارة المشاريع", "عرض جميع المشاريع مع حالتها وتفاصيلها", "مكتمل", "admin.js", "ProjectMgmt"],
      ["4", "مراجعة طلبات التمويل البنكي", "عرض الطلبات → موافقة أو رفض", "غير مكتمل", "مفقود", "مفقود"],
    ]},
  ];

  r = 3;
  workflows.forEach((wf) => {
    ws4.mergeCells(`A${r}:F${r}`);
    ws4.getCell(`A${r}`).value = wf.name;
    ws4.getCell(`A${r}`).font = { name: "Arial", bold: true, size: 13, color: { argb: WHITE } };
    ws4.getCell(`A${r}`).fill = headerFill(wf.color);
    ws4.getCell(`A${r}`).alignment = { horizontal: "center", vertical: "middle" };
    ws4.getRow(r).height = 35;
    r++;

    const subHeaders = ["#", "الخطوة", "الوصف التفصيلي", "الحالة", "Backend", "Frontend"];
    const subRow = ws4.getRow(r);
    subHeaders.forEach((h, i) => { subRow.getCell(i + 1).value = h; });
    styleHeaderRow(ws4, subRow, "546E7A");
    r++;

    wf.steps.forEach((step) => {
      const stepRow = ws4.getRow(r);
      step.forEach((val, i) => { stepRow.getCell(i + 1).value = val; });
      styleDataRow(ws4, stepRow);
      stepRow.getCell(4).fill = statusFill(step[3]);
      r++;
    });
    r++;
  });

  ws4.getColumn(1).width = 5;
  ws4.getColumn(2).width = 26;
  ws4.getColumn(3).width = 55;
  ws4.getColumn(4).width = 14;
  ws4.getColumn(5).width = 16;
  ws4.getColumn(6).width = 16;

  // ══════════════════════════════════════════════════════════
  // SHEET 5: Risk Matrix
  // ══════════════════════════════════════════════════════════
  const ws5 = wb.addWorksheet("مصفوفة المخاطر", { views: [{ rightToLeft: true }] });

  ws5.mergeCells("A1:G1");
  ws5.getCell("A1").value = "مصفوفة المخاطر وخطة التخفيف";
  ws5.getCell("A1").font = { name: "Arial", bold: true, size: 16, color: { argb: WHITE } };
  ws5.getCell("A1").fill = headerFill(NAVY);
  ws5.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
  ws5.getRow(1).height = 40;

  r = 3;
  const riskHeaders = ["#", "المخاطرة", "الاحتمالية", "التأثير", "الخطورة", "خطة التخفيف", "المسؤول"];
  const riskHeaderRow = ws5.getRow(r);
  riskHeaders.forEach((h, i) => { riskHeaderRow.getCell(i + 1).value = h; });
  styleHeaderRow(ws5, riskHeaderRow);

  const risks = [
    [1, "تسريب بيانات الاعتماد (DB/JWT)", "عالي", "حرج", "حرج", "إزالة فورية من الكود + تغيير كلمات المرور + env vars فقط", "Backend Lead"],
    [2, "عدم تسجيل أرباح المقاولين", "مؤكد", "عالي", "حرج", "إضافة auto-earning في owner-decision endpoint + اختبار شامل", "Backend"],
    [3, "فقدان ملفات المشاريع", "عالي", "عالي", "عالي", "ربط Cloudinary بشكل كامل + نسخ احتياطي تلقائي", "DevOps"],
    [4, "بطء الأداء مع زيادة البيانات", "متوسط", "عالي", "عالي", "إضافة pagination + indexes على الجداول المهمة", "Backend"],
    [5, "عدم عمل التطبيق على الموبايل", "مؤكد", "متوسط", "متوسط", "تصميم responsive في Sprint 3 — Mobile-First", "Frontend"],
    [6, "صعوبة صيانة App.jsx (5321 سطر)", "عالي", "متوسط", "متوسط", "تقسيم الملف إلى مكونات منفصلة في Sprint 3", "Frontend"],
    [7, "عدم وجود اختبارات تلقائية", "مؤكد", "متوسط", "متوسط", "إعداد Jest + CI/CD pipeline في Sprint 3", "QA"],
    [8, "عدم توافق WCAG", "مؤكد", "منخفض", "منخفض", "مراجعة accessibility + ARIA labels في Sprint 3", "Frontend"],
  ];

  risks.forEach((risk) => {
    r++;
    const row = ws5.getRow(r);
    risk.forEach((val, i) => { row.getCell(i + 1).value = val; });
    styleDataRow(ws5, row);
    const severity = risk[4];
    if (severity === "حرج") row.getCell(5).fill = headerFill(LT_RED);
    else if (severity === "عالي") row.getCell(5).fill = headerFill("FFD7D7");
    else if (severity === "متوسط") row.getCell(5).fill = headerFill(LT_YELLOW);
    else row.getCell(5).fill = headerFill(LT_GREEN);
  });

  ws5.getColumn(1).width = 5;
  ws5.getColumn(2).width = 32;
  ws5.getColumn(3).width = 12;
  ws5.getColumn(4).width = 12;
  ws5.getColumn(5).width = 12;
  ws5.getColumn(6).width = 55;
  ws5.getColumn(7).width = 14;

  // ═══════ SAVE ═══════
  const outputPath = "C:\\Users\\Use\\Desktop\\hassan project 2\\FIRST_TOUCH_Gap_Analysis.xlsx";
  await wb.xlsx.writeFile(outputPath);
  console.log("Excel saved to: " + outputPath);
}

main().catch(console.error);
