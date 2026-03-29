/**
 * FIRST TOUCH — Unsplash Real Photos Seeder
 * يستبدل الصور الوهمية بصور بناء حقيقية من Unsplash
 * لا يحتاج API key — يستخدم روابط source مباشرة
 */

const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

// ═══════════════════════════════════════════════
// صور بناء حقيقية من Unsplash — روابط ثابتة محددة
// كل صورة اخترناها يدوياً لتتناسب مع مرحلة البناء
// ═══════════════════════════════════════════════

const PHOTOS = {
  // مرحلة الأساسات
  excavation: [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",  // حفر الأساسات
    "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&q=80",  // موقع بناء
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80",  // تسليح الأساسات
  ],
  foundation_rebar: [
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",  // حديد تسليح
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",  // موقع إنشاء
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",  // حفر عميق
  ],
  concrete_pour: [
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",  // صب خرسانة
    "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&q=80",  // معدات بناء
    "https://images.unsplash.com/photo-1620121684840-edffcfc4b878?w=800&q=80",  // عمال خرسانة
  ],
  // مرحلة الهيكل
  structure: [
    "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",  // هيكل مبنى
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",  // أعمدة خرسانية
    "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&q=80",  // هيكل خرساني
  ],
  materials: [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",  // مواد بناء
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",  // حديد
    "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",  // مستودع مواد
  ],
  // فحص وتفتيش
  inspection: [
    "https://images.unsplash.com/photo-1429497419816-9ca5cfb4571a?w=800&q=80",  // مفتش موقع
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",  // وثيقة + قلم
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80",  // فحص إنشاء
  ],
  // عمال
  workers: [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",  // عمال موقع
    "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&q=80",  // مهندس موقع
    "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&q=80",  // مقاول
  ],
  // نظرة عامة للمشروع
  overview: [
    "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",  // مبنى قيد الإنشاء
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",  // موقع بناء كامل
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80",  // رافعة + مبنى
  ],
};

// ═══════════════════════════════════════════════
// HELPER: رابط Unsplash عشوائي بكلمة مفتاحية
// ═══════════════════════════════════════════════
function unsplashUrl(keyword, width = 800, height = 600, seed = null) {
  // source.unsplash.com يعيد صورة عشوائية بدون API key
  const s = seed || Math.floor(Math.random() * 1000);
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(keyword)},construction&sig=${s}`;
}

function photoUrl(category, index = 0) {
  const arr = PHOTOS[category] || PHOTOS.overview;
  return arr[index % arr.length];
}

// ═══════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════
async function main() {
  console.log("📸 بدء تحديث الصور بصور Unsplash الحقيقية...\n");

  // ── حذف الملفات القديمة (SVG وهمية) ──
  const deleted = await p.itemFile.deleteMany({});
  console.log(`🗑️  تم حذف ${deleted.count} ملف قديم`);

  // ── حذف صور المشروع القديمة ──
  await p.projectImage.deleteMany({});
  console.log("🗑️  تم حذف صور المشروع القديمة");

  // ── جلب البنود ──
  const items = await p.checklistItem.findMany({
    where: { subStage: { stage: { projectId: 1 } } },
    include: { subStage: { include: { stage: true } } },
    orderBy: { id: "asc" },
  });

  // ── البيانات التفصيلية لكل بند ──
  const itemsData = [
    // مرحلة الأساسات (stage 1) — مكتملة
    {
      files: [
        { name: "توريد_الرمل_والحصى.jpg",       url: photoUrl("materials", 0), type: "image", role: "contractor", size: 856432 },
        { name: "توريد_حديد_التسليح_ينبع.jpg",  url: photoUrl("foundation_rebar", 0), type: "image", role: "contractor", size: 921054 },
        { name: "شهادة_جودة_المواد.jpg",          url: photoUrl("inspection", 1), type: "document", role: "inspector", size: 432100 },
      ],
    },
    {
      files: [
        { name: "حفر_الاساسات_عمق_2.5م.jpg",    url: photoUrl("excavation", 0), type: "image", role: "contractor", size: 1243000 },
        { name: "تسليح_الاساسات_قبل_الصب.jpg",  url: photoUrl("foundation_rebar", 1), type: "image", role: "contractor", size: 1102000 },
        { name: "صب_الخرسانة_20_يناير.jpg",      url: photoUrl("concrete_pour", 0), type: "image", role: "contractor", size: 1398000 },
        { name: "فيديو_صب_الخرسانة.mp4",         url: photoUrl("concrete_pour", 1), type: "video", role: "contractor", size: 48500000 },
        { name: "تقرير_فحص_الاساسات.jpg",        url: photoUrl("inspection", 0), type: "document", role: "inspector", size: 512000 },
      ],
    },
    {
      files: [
        { name: "الاساسات_مكتملة_نظرة_عامة.jpg", url: photoUrl("excavation", 2), type: "image", role: "contractor", size: 1567000 },
        { name: "تقرير_الاعتماد_النهائي.jpg",     url: photoUrl("inspection", 2), type: "document", role: "inspector", size: 623000 },
      ],
    },
    // مرحلة الهيكل (stage 2) — جارية
    {
      files: [
        { name: "توريد_حديد_الهيكل_16مم.jpg",   url: photoUrl("foundation_rebar", 2), type: "image", role: "contractor", size: 987000 },
        { name: "قوالب_الهيكل_الخشبية.jpg",       url: photoUrl("structure", 0), type: "image", role: "contractor", size: 1124000 },
        { name: "فيديو_الموقع_قبل_الهيكل.mp4",    url: photoUrl("workers", 0), type: "video", role: "contractor", size: 62000000 },
      ],
    },
    // البنود الباقية بدون ملفات (لم تُنفَّذ بعد)
    { files: [] },
  ];

  // ── إضافة الملفات ──
  let totalFiles = 0;
  for (let i = 0; i < Math.min(items.length, itemsData.length); i++) {
    const item = items[i];
    const data = itemsData[i];
    if (!data.files.length) continue;

    for (const f of data.files) {
      await p.itemFile.create({
        data: {
          itemId: item.id,
          fileName: f.name,
          filePath: f.url,   // رابط Unsplash مباشر
          fileType: f.type,
          fileSize: f.size,
          role: f.role,
        },
      });
      totalFiles++;
    }
    console.log(`✅ ${item.textAr}: ${data.files.length} ملف`);
  }

  // ── صور المشروع الرئيسية ──
  await p.projectImage.createMany({
    data: [
      {
        projectId: 1,
        imageUrl: photoUrl("overview", 0),
        captionAr: "موقع المشروع — فيلا الرفاع",
        isPrimary: true,
      },
      {
        projectId: 1,
        imageUrl: photoUrl("excavation", 0),
        captionAr: "مرحلة الأساسات — يناير 2026",
        isPrimary: false,
      },
      {
        projectId: 1,
        imageUrl: photoUrl("structure", 0),
        captionAr: "بداية مرحلة الهيكل — فبراير 2026",
        isPrimary: false,
      },
      {
        projectId: 1,
        imageUrl: photoUrl("workers", 1),
        captionAr: "فريق العمل في الموقع",
        isPrimary: false,
      },
    ],
  });

  // ── صور المشروع المكتمل ──
  const completedProject = await p.project.findFirst({
    where: { status: "completed" },
  });
  if (completedProject) {
    await p.projectImage.createMany({
      data: [
        { projectId: completedProject.id, imageUrl: photoUrl("overview", 2), captionAr: "عمارة المحرق — مكتملة", isPrimary: true },
        { projectId: completedProject.id, imageUrl: photoUrl("overview", 1), captionAr: "الواجهة الخارجية", isPrimary: false },
      ],
    });
  }

  console.log(`\n══════════════════════════════════════════════════`);
  console.log(`🎉 تم تحديث ${totalFiles} ملف بصور Unsplash حقيقية!`);
  console.log(`📸 الصور مرتبطة بـ URL مباشر — لا تحتاج تخزيناً محلياً`);
  console.log(`\n🔗 مثال على رابط الصور:`);
  console.log(`   ${photoUrl("overview", 0)}`);
  console.log(`══════════════════════════════════════════════════`);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error("❌ خطأ:", e.message);
  process.exit(1);
});
