// One-off script: add pending quotation from Dr Quality (contractor) to
// Dr. Naji (owner) on the medical-center project. Safe to re-run.

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Adding quotation from Dr Quality to Dr. Naji...\n");

  // 1. Find the medical-center project (same one inspector applied to)
  const project = await prisma.project.findFirst({
    where: { titleAr: { contains: "نجيب" } },
    orderBy: { id: "desc" }
  });
  if (!project) { console.error("ERROR: medical center project not found"); return; }
  console.log("Project:", project.titleAr, "(id=" + project.id + ", status=" + project.status + ")");

  // 2. Find the contractor
  const contractor = await prisma.user.findUnique({
    where: { email: "contractor@firsttouch.bh" }
  });
  if (!contractor) { console.error("ERROR: contractor user not found"); return; }
  console.log("Contractor:", contractor.nameAr, "— " + contractor.companyNameAr);

  // 3. Check if quotation already exists
  const existing = await prisma.quotation.findFirst({
    where: { projectId: project.id, contractorId: contractor.id }
  });
  if (existing) {
    console.log("Quotation already exists (id=" + existing.id + ", status=" + existing.status + ") — skipping");
    return;
  }

  // 4. Build a lightweight BOQ breakdown (representative sample)
  const breakdown = [
    { category: "Demolition", description: "أعمال الهدم والإزالة", quantity: 1, unit: "lump sum", unit_price: 3500, total: 3500 },
    { category: "Masonry", description: "أعمال البناء (طابوق)", quantity: 850, unit: "m²", unit_price: 12, total: 10200 },
    { category: "Concrete", description: "أعمال الخرسانة المسلحة", quantity: 1, unit: "lump sum", unit_price: 8500, total: 8500 },
    { category: "Waterproofing", description: "العزل المائي Sika", quantity: 830, unit: "m²", unit_price: 8, total: 6640 },
    { category: "Plaster", description: "البلاستر والتشطيب", quantity: 2200, unit: "m²", unit_price: 4, total: 8800 },
    { category: "Architectural", description: "تشطيبات معمارية (Jotun / RAK)", quantity: 1, unit: "lump sum", unit_price: 18500, total: 18500 },
    { category: "Electrical", description: "أعمال كهربائية Schneider", quantity: 1, unit: "lump sum", unit_price: 14200, total: 14200 },
    { category: "Plumbing", description: "سباكة ومواسير — Grohe", quantity: 1, unit: "lump sum", unit_price: 7800, total: 7800 },
    { category: "HVAC", description: "تكييف Daikin (9×5ton + 1×3ton)", quantity: 10, unit: "unit", unit_price: 950, total: 9500 },
    { category: "Fire Alarm", description: "نظام إنذار Addressable — Honeywell", quantity: 1, unit: "lump sum", unit_price: 4200, total: 4200 },
    { category: "Fire Fighting", description: "نظام مكافحة الحريق — Tyco", quantity: 1, unit: "lump sum", unit_price: 5520, total: 5520 }
  ];

  const total = breakdown.reduce((s, b) => s + b.total, 0);
  console.log("Breakdown total:", total, "BHD (" + breakdown.length + " items)");

  const q = await prisma.quotation.create({
    data: {
      projectId: project.id,
      contractorId: contractor.id,
      price: 97360,                  // headline price from original document
      durationMonths: 6,
      warrantyMonths: 12,
      notes: "جميع الكميات تقريبية وقد تزيد أو تنقص حسب المخططات النهائية وظروف الموقع.\nالمواد من علامات تجارية معتمدة للمنشآت الطبية: Jotun (دهانات مضادة للبكتيريا)، Grohe (سباكة ألمانية)، Schneider Electric، Daikin، Honeywell (إنذار Addressable).\nتكييف مستقل لكل عيادة طبيب، 3-4 غرف على وحدة مشتركة.\nجميع الأعمال تتوافق مع معايير NHRA ومعايير البناء في البحرين.",
      breakdown: JSON.stringify(breakdown),
      status: "pending"
    }
  });
  console.log("Quotation created (id=" + q.id + ", price=BHD 97,360, status=pending)");

  // 5. Notify owner
  const owner = await prisma.user.findUnique({ where: { id: project.ownerId } });
  if (owner) {
    const alreadyNotified = await prisma.notification.findFirst({
      where: { userId: owner.id, titleAr: "عرض سعر جديد", messageAr: { contains: "Dr Quality" } }
    });
    if (!alreadyNotified) {
      await prisma.notification.create({
        data: {
          userId: owner.id,
          type: "info",
          titleAr: "عرض سعر جديد",
          messageAr: "تم استلام عرض سعر من Dr Quality Constructions بمبلغ 97,360 د.ب لمشروع " + project.titleAr + " — بانتظار مراجعتك"
        }
      });
      console.log("Notified owner");
    }
  }

  console.log("\nDone.");
}

main()
  .catch((e) => { console.error("Error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
