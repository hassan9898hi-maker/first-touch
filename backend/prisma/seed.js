const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

// ═══════ Load BOQ Data from Excel export ═══════
const boqPath = path.join(__dirname, "medical-center-boq.json");
const BOQ_DATA = JSON.parse(fs.readFileSync(boqPath, "utf-8"));

// ═══════ Category → Stage mapping ═══════
// Budget percentages left at 0 — actual unit rates not yet provided
const STAGE_DEFS = [
  { nameAr: "أعمال الهدم والإزالة", nameEn: "Demolition & Removal", categories: ["Demolition"], order: 1 },
  { nameAr: "أعمال البناء (الطابوق)", nameEn: "Masonry Works", categories: ["Masonry"], order: 2 },
  { nameAr: "أعمال الخرسانة", nameEn: "Concrete Works", categories: ["Concrete"], order: 3 },
  { nameAr: "العزل المائي", nameEn: "Waterproofing", categories: ["Waterproofing"], order: 4 },
  { nameAr: "أعمال البلاستر", nameEn: "Plastering", categories: ["Plaster"], order: 5 },
  { nameAr: "الأعمال المعمارية والتشطيبات", nameEn: "Architectural & Finishing", categories: ["Architectural"], order: 6 },
  { nameAr: "الأعمال الكهربائية — تمديدات أولية", nameEn: "Electrical — First Fix", categories: ["Electrical - First Fix"], order: 7 },
  { nameAr: "الأعمال الكهربائية — تمديدات ثانوية", nameEn: "Electrical — Second Fix", categories: ["Electrical - Second Fix"], order: 8 },
  { nameAr: "الأعمال الكهربائية — تركيبات نهائية", nameEn: "Electrical — Final Fix", categories: ["Electrical - Final Fix", "Electrical"], order: 9 },
  { nameAr: "أعمال السباكة والصرف الصحي", nameEn: "Plumbing & Drainage", categories: ["Plumbing"], order: 10 },
  { nameAr: "أعمال التكييف والتهوية", nameEn: "HVAC Works", categories: ["HVAC"], order: 11 },
  { nameAr: "نظام إنذار الحريق", nameEn: "Fire Alarm System", categories: ["Fire Alarm"], order: 12 },
  { nameAr: "نظام مكافحة الحريق", nameEn: "Fire Fighting System", categories: ["Fire Fighting"], order: 13 },
];

async function main() {
  console.log("🌱 Seeding FIRST TOUCH database...\n");
  console.log("🏥 Project: Dr. Najeeb Abu Bakr Medical Center — Al Seef\n");

  const hash = await bcrypt.hash("123456", 12);

  // ═══════════════════════════════════════════
  // USERS — Real data from project documents
  // ═══════════════════════════════════════════

  // Client / Owner — from quotation document
  const owner = await prisma.user.upsert({
    where: { email: "owner@firsttouch.bh" },
    update: {},
    create: {
      nameAr: "د. نجيب أبو بكر",
      nameEn: "Dr. Najeeb Abu Bakr",
      email: "owner@firsttouch.bh",
      passwordHash: hash,
      role: "owner",
      roles: "owner",
      phone: "+97334027576",            // from quotation: Client Phone
      companyNameAr: "مركز د. نجيب أبو بكر الطبي",
      bioAr: "مركز طبي متعدد التخصصات — السيف، مملكة البحرين"
    }
  });
  console.log("✅ Owner:", owner.nameAr);

  // Contractor — from quotation header (Dr Quality Constructions company)
  const contractor = await prisma.user.upsert({
    where: { email: "contractor@firsttouch.bh" },
    update: {},
    create: {
      nameAr: "حسن ناصر",
      nameEn: "Hassan Naser",
      email: "contractor@firsttouch.bh",
      passwordHash: hash,
      role: "contractor",
      roles: "contractor",
      companyNameAr: "Dr Quality Constructions",
      crNumber: "117102-02",            // from quotation: CR number
      specialty: "أعمال البناء والتشييد للمنشآت الطبية",
      phone: "+97333509950",            // from quotation: Phone Number
      bioAr: "مكتب 61، مبنى 296، بلوك 333، الزنج، المنامة، مملكة البحرين" // from quotation address
    }
  });
  console.log("✅ Contractor:", contractor.nameAr, "— Dr Quality Constructions");

  // Inspector — Hassan Issa, also from Dr Quality Constructions (team lead / QA)
  const inspector = await prisma.user.upsert({
    where: { email: "inspector@firsttouch.bh" },
    update: {},
    create: {
      nameAr: "حسن عيسى",
      nameEn: "Hassan Issa",
      email: "inspector@firsttouch.bh",
      passwordHash: hash,
      role: "inspector",
      roles: "inspector",
      companyNameAr: "Dr Quality Constructions",
      crNumber: "117102-02",            // same company as contractor
      specialty: "فحص وضبط جودة البناء للمنشآت الطبية",
      phone: "+97333509960",
      bioAr: "مفتش وضابط جودة — Dr Quality Constructions",
      rating: 4.8
    }
  });
  console.log("✅ Inspector:", inspector.nameAr, "— Dr Quality Constructions");

  // Admin user — platform admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@firsttouch.bh" },
    update: {},
    create: {
      nameAr: "مدير النظام",
      nameEn: "System Admin",
      email: "admin@firsttouch.bh",
      passwordHash: hash,
      role: "admin",
      roles: "admin",
      isAdmin: true
    }
  });
  console.log("✅ Admin:", admin.email);

  // ═══════ WALLETS — Empty (no deposits yet) ═══════
  await prisma.wallet.upsert({
    where: { userId: owner.id },
    update: {},
    create: { userId: owner.id, balance: 0, reserved: 0, totalPaid: 0 }
  });
  await prisma.wallet.upsert({
    where: { userId: contractor.id },
    update: {},
    create: { userId: contractor.id, balance: 0, reserved: 0, totalPaid: 0 }
  });
  await prisma.wallet.upsert({
    where: { userId: inspector.id },
    update: {},
    create: { userId: inspector.id, balance: 0, reserved: 0, totalPaid: 0 }
  });
  console.log("✅ Wallets created (empty — no deposits yet)");

  // ═══════════════════════════════════════════
  // PROJECT — from quotation document
  // Quotation Date: 2/3/2026
  // Total: BHD 97,360
  // Status: new (quotation submitted, pending agreement)
  // ═══════════════════════════════════════════
  const TOTAL_BUDGET = 97360; // BHD from quotation document

  const project = await prisma.project.create({
    data: {
      titleAr: "مركز د. نجيب أبو بكر الطبي",
      titleEn: "Dr. Najeeb Abu Bakr Medical Center",
      type: "commercial",
      areaSqm: 830,     // from BOQ: total floor area
      floors: 1,
      locationAr: "السيف، مملكة البحرين",
      totalBudget: TOTAL_BUDGET,
      status: "new",     // quotation submitted — pending agreement
      ownerId: owner.id,
      contractorId: null, // not assigned yet — pending agreement
      inspectorId: null,  // not assigned yet
      hasDesigns: true,
      currentStage: "design",
      descriptionAr: "مركز طبي متعدد التخصصات يضم 45 منطقة تشمل: استقبال وانتظار، عيادات (طب عام، باطنية، عظام، نساء وولادة، أطفال، صدرية، جلدية)، غرف فحص أشعة وموجات صوتية، مختبر وسحب دم، صيدلية، غرف إجراءات معقمة، غرف مراقبة، علاج وريدي، دراسة نوم، وأقسام دعم طبي",
      ownerConditions: "جميع الكميات تقريبية وقد تزيد أو تنقص حسب المخططات النهائية وظروف الموقع.\nجميع المواد والمعدات من علامات تجارية عالية الجودة معتمدة لمشاريع المنشآت الطبية.\nالدهانات ماركة Jotun مضادة للبكتيريا ومنخفضة VOC.\nإكسسوارات الحمامات والمغاسل من Grohe الألمانية.\nنظام إنذار حريق من النوع المعنون (Addressable) يظهر الموقع الدقيق لكل إنذار.\nكاميرات CCTV من نوع IP بدقة 4MP مع PoE.\nتكييف مستقل لكل عيادة طبيب، 3-4 غرف على وحدة مشتركة، ممرات على وحدة تحكم مركزية.\nجميع الأعمال تتوافق مع معايير NHRA ومعايير البناء في البحرين."
    }
  });
  console.log("✅ Project created — BHD", TOTAL_BUDGET.toLocaleString(), "[status: new]");

  // ═══════ STAGES & BOQ ITEMS — from Excel BOQ ═══════
  // All stages locked — project hasn't started
  let totalItemsCreated = 0;

  for (const stageDef of STAGE_DEFS) {
    const stage = await prisma.stage.create({
      data: {
        projectId: project.id,
        nameAr: stageDef.nameAr,
        nameEn: stageDef.nameEn,
        orderNum: stageDef.order,
        budget: 0,          // actual pricing pending
        status: "locked"    // all locked — project not started
      }
    });

    // Collect BOQ items for this stage grouped by zone
    const zoneItemsMap = {};
    for (const zone of BOQ_DATA.zones) {
      const zoneKey = String(zone.no);
      const zoneItems = (BOQ_DATA.itemsByZone[zoneKey] || []).filter(
        item => stageDef.categories.includes(item.category)
      );
      if (zoneItems.length > 0) {
        zoneItemsMap[zoneKey] = { zone, items: zoneItems };
      }
    }

    // Also check SHARED items
    const sharedItems = (BOQ_DATA.itemsByZone["SHARED"] || []).filter(
      item => stageDef.categories.includes(item.category)
    );
    if (sharedItems.length > 0) {
      zoneItemsMap["SHARED"] = { zone: { no: "SHARED", name: "عام — كامل المبنى" }, items: sharedItems };
    }

    // Create SubStages (zones) with checklist items
    let subOrder = 0;
    for (const [zoneKey, data] of Object.entries(zoneItemsMap)) {
      subOrder++;
      const zoneNameAr = zoneKey === "SHARED" ? "عام — كامل المبنى" : getZoneNameAr(data.zone.name);
      const zoneNameEn = zoneKey === "SHARED" ? "General — Entire Building" : data.zone.name;

      const subStage = await prisma.subStage.create({
        data: {
          stageId: stage.id,
          nameAr: zoneNameAr,
          nameEn: zoneNameEn,
          orderNum: subOrder
        }
      });

      // All items pending — no work done
      const itemsData = data.items.map((item, idx) => ({
        subStageId: subStage.id,
        textAr: item.descAr + (item.qty ? " — " + item.qty + " " + item.unit : ""),
        textEn: item.descEn + (item.qty ? " — " + item.qty + " " + item.unit : ""),
        orderNum: idx + 1,
        cost: 0,  // actual unit rates not yet provided
        contractorDone: false,
        inspectorDone: false,
        inspectorApproved: false,
        ownerDone: false,
        ownerApproved: false
      }));

      await prisma.checklistItem.createMany({ data: itemsData });
      totalItemsCreated += itemsData.length;
    }

    // If no items found, create empty general sub-stage
    if (Object.keys(zoneItemsMap).length === 0) {
      const sub = await prisma.subStage.create({
        data: { stageId: stage.id, nameAr: stageDef.nameAr + " — عام", nameEn: stageDef.nameEn + " — General", orderNum: 1 }
      });
      await prisma.checklistItem.create({
        data: {
          subStageId: sub.id,
          textAr: "تنفيذ " + stageDef.nameAr,
          textEn: stageDef.nameEn + " execution",
          orderNum: 1,
          cost: 0
        }
      });
      totalItemsCreated++;
    }

    const zoneCount = Object.keys(zoneItemsMap).length;
    console.log(`  Stage ${stageDef.order}: ${stageDef.nameAr} — ${zoneCount} zones`);
  }

  console.log(`\n📊 Total BOQ items: ${totalItemsCreated}`);

  // ═══════ QUOTATION — from quotation document (2/3/2026) ═══════
  const breakdown = [];
  for (const zone of BOQ_DATA.zones) {
    const zoneItems = BOQ_DATA.itemsByZone[String(zone.no)] || [];
    for (const item of zoneItems) {
      breakdown.push({
        stage: getZoneNameAr(zone.name),
        description: item.descAr,
        descriptionEn: item.descEn,
        unit: item.unit,
        quantity: item.qty,
        unit_price: 0,   // not provided in documents
        total: 0,
        brand: getBrandForCategory(item.category),
        category: item.category,
        zone: zone.no
      });
    }
  }
  // Add SHARED items
  const sharedAll = BOQ_DATA.itemsByZone["SHARED"] || [];
  for (const item of sharedAll) {
    breakdown.push({
      stage: "عام — كامل المبنى",
      description: item.descAr,
      descriptionEn: item.descEn,
      unit: item.unit,
      quantity: item.qty,
      unit_price: 0,
      total: 0,
      brand: getBrandForCategory(item.category),
      category: item.category,
      zone: "SHARED"
    });
  }

  await prisma.quotation.create({
    data: {
      projectId: project.id,
      contractorId: contractor.id,
      price: TOTAL_BUDGET,
      durationMonths: 6,
      warrantyMonths: 12,
      notes: "جميع الكميات تقريبية وقد تزيد أو تنقص حسب المخططات النهائية وظروف الموقع.\nجميع المواد من علامات تجارية عالية الجودة معتمدة للمنشآت الطبية.\nالدهانات Jotun مضادة للبكتيريا ومنخفضة VOC.\nإكسسوارات الحمامات Grohe ألمانية.\nنظام إنذار حريق معنون Addressable.\nتكييف مستقل لكل عيادة.\nوحدات تكييف: 9 وحدات 5 طن + 1 وحدة 3 طن.\nجميع الأعمال تتوافق مع معايير NHRA ومعايير البناء في البحرين.",
      breakdown: JSON.stringify(breakdown),
      status: "pending"  // pending — waiting for owner to accept
    }
  });
  console.log("✅ Quotation submitted — BHD", TOTAL_BUDGET.toLocaleString(), "(" + breakdown.length + " items) [pending]");

  // ═══════ INSPECTOR APPLICATION — Hassan Issa applies to supervise project ═══════
  await prisma.inspectorApplication.create({
    data: {
      projectId: project.id,
      inspectorId: inspector.id,
      fee: 3500,                      // BHD proposal for inspection duration
      notes: "أتقدم للإشراف على جودة التنفيذ لمشروع المركز الطبي — خبرة 8 سنوات في فحص المنشآت الطبية بمعايير NHRA.",
      status: "pending"                // owner needs to review and accept
    }
  });
  console.log("✅ Inspector application submitted — BHD 3,500 [pending owner acceptance]");

  // ═══════ NOTIFICATIONS — only real events ═══════
  await prisma.notification.createMany({
    data: [
      { userId: owner.id, type: "success", titleAr: "مرحباً في FIRST TOUCH", messageAr: "تم إنشاء حسابك بنجاح — مرحباً د. نجيب أبو بكر" },
      { userId: owner.id, type: "info", titleAr: "عرض سعر جديد", messageAr: "تم استلام عرض سعر من Dr Quality Constructions بمبلغ 97,360 د.ب لمشروع المركز الطبي — بانتظار مراجعتك" },
      { userId: owner.id, type: "info", titleAr: "ترشيح مفتش جديد", messageAr: "تقدّم حسن عيسى من Dr Quality Constructions للإشراف على جودة المشروع — بانتظار مراجعتك" },
      { userId: contractor.id, type: "success", titleAr: "مرحباً في FIRST TOUCH", messageAr: "تم إنشاء حسابك بنجاح — مرحباً حسن ناصر" },
      { userId: contractor.id, type: "info", titleAr: "تم تقديم عرض السعر", messageAr: "تم تقديم عرضك لمشروع مركز د. نجيب أبو بكر الطبي — BHD 97,360 — بانتظار موافقة العميل" },
      { userId: inspector.id, type: "success", titleAr: "مرحباً في FIRST TOUCH", messageAr: "تم إنشاء حسابك بنجاح — مرحباً حسن عيسى" },
      { userId: inspector.id, type: "info", titleAr: "تم تقديم ترشيحك", messageAr: "تم تقديم ترشيحك كمفتش لمشروع مركز د. نجيب أبو بكر الطبي — بانتظار موافقة المالك" },
    ]
  });
  console.log("✅ Notifications created");

  // ═══════ DONE ═══════
  console.log("\n" + "═".repeat(50));
  console.log("🎉 Database seeded successfully!");
  console.log("═".repeat(50));
  console.log("\n📋 Accounts (password: 123456):");
  console.log("   👤 Owner:      owner@firsttouch.bh      (د. نجيب أبو بكر — Project Supervisor)");
  console.log("   👷 Contractor: contractor@firsttouch.bh  (حسن ناصر — Dr Quality)");
  console.log("   🔍 Inspector:  inspector@firsttouch.bh   (حسن عيسى — Dr Quality QA)");
  console.log("   ⚙️  Admin:      admin@firsttouch.bh");
  console.log("\n📊 Medical Center: 13 stages, 45 zones, " + totalItemsCreated + " BOQ items");
  console.log("💰 Quotation: BHD 97,360 [pending owner acceptance]");
  console.log("🔎 Inspector fee: BHD 3,500 [pending owner acceptance]");
  console.log("📍 Location: Al Seef, Kingdom of Bahrain");
}

// ═══════ HELPER FUNCTIONS ═══════

function getZoneNameAr(enName) {
  const map = {
    "Reception & Waiting": "الاستقبال والانتظار",
    "Store": "المخزن",
    "Admin": "الإدارة",
    "Conference": "غرفة الاجتماعات",
    "I.T": "تقنية المعلومات",
    "Triage": "الفرز الطبي",
    "Minor Procedure": "غرفة الإجراءات البسيطة",
    "General Practice": "الطب العام",
    "Internal Medicine": "الباطنية",
    "Orthopedic": "العظام",
    "Gynecology": "النساء والولادة",
    "Pediatric": "الأطفال",
    "Pulmonology": "الأمراض الصدرية",
    "Male Observation Room": "غرفة المراقبة — رجال",
    "Male Toilet": "دورة مياه رجال",
    "Female Toilet": "دورة مياه نساء",
    "Female Observation Room": "غرفة المراقبة — نساء",
    "Medical Waste": "النفايات الطبية",
    "M Staff Toilet": "دورة مياه الموظفين",
    "F Staff Toilet": "دورة مياه الموظفات",
    "Staff Lounge": "صالة الموظفين",
    "Staff Lounge (Small)": "صالة الموظفين (صغيرة)",
    "Sterile Procedure Room": "غرفة الإجراءات المعقمة",
    "Pump Room": "غرفة المضخات",
    "Decontamination": "غرفة التعقيم",
    "Sterilization": "التعقيم المركزي",
    "Laboratory": "المختبر",
    "Blood Collection": "سحب الدم",
    "Changing Room": "غرفة تغيير الملابس",
    "X-Ray Exam Room": "غرفة فحص الأشعة",
    "Control Room": "غرفة التحكم",
    "Ultra Sound": "الموجات فوق الصوتية",
    "Female Toilet (Large)": "دورة مياه نساء (كبيرة)",
    "Male Toilet (Large)": "دورة مياه رجال (كبيرة)",
    "Sleep Study-1": "دراسة النوم 1",
    "Sleep Study-2": "دراسة النوم 2",
    "IV Therapy": "العلاج الوريدي",
    "Waiting Lounge": "صالة الانتظار",
    "Dermatology": "الجلدية",
    "Derma Procedure-1": "إجراءات جلدية 1",
    "Derma Procedure-2": "إجراءات جلدية 2",
    "Pharmacy": "الصيدلية",
  };
  return map[enName] || enName;
}

function getBrandForCategory(category) {
  // Brands from quotation notes / owner conditions
  const brands = {
    "Architectural": "Jotun / RAK Ceramics",
    "Electrical - First Fix": "Schneider Electric",
    "Electrical - Second Fix": "Schneider Electric",
    "Electrical - Final Fix": "Philips / Schneider",
    "Electrical": "Schneider Electric",
    "Plumbing": "Grohe — Germany",
    "HVAC": "Daikin / Carrier",
    "Fire Alarm": "Honeywell (Addressable)",
    "Fire Fighting": "Tyco / Viking",
    "Masonry": "",
    "Plaster": "",
    "Concrete": "",
    "Waterproofing": "Sika",
    "Demolition": ""
  };
  return brands[category] || "";
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
