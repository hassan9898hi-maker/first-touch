// One-off script: add inspector Hassan Issa (from Dr Quality) + his application
// to supervise the existing medical-center project. Safe to re-run: all writes
// are idempotent via upsert / findFirst guards.

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Adding inspector Hassan Issa...\n");

  const hash = await bcrypt.hash("123456", 12);

  // 1. Upsert inspector user
  const inspector = await prisma.user.upsert({
    where: { email: "inspector@firsttouch.bh" },
    update: {
      nameAr: "حسن عيسى",
      nameEn: "Hassan Issa",
      companyNameAr: "Dr Quality Constructions",
      role: "inspector",
      roles: "inspector",
      specialty: "فحص وضبط جودة البناء للمنشآت الطبية",
      phone: "+97333509960",
      bioAr: "مفتش وضابط جودة — Dr Quality Constructions",
      rating: 4.8
    },
    create: {
      nameAr: "حسن عيسى",
      nameEn: "Hassan Issa",
      email: "inspector@firsttouch.bh",
      passwordHash: hash,
      role: "inspector",
      roles: "inspector",
      companyNameAr: "Dr Quality Constructions",
      crNumber: "117102-02",
      specialty: "فحص وضبط جودة البناء للمنشآت الطبية",
      phone: "+97333509960",
      bioAr: "مفتش وضابط جودة — Dr Quality Constructions",
      rating: 4.8
    }
  });
  console.log("User:", inspector.nameAr, "(id=" + inspector.id + ")");

  // 2. Ensure wallet exists
  await prisma.wallet.upsert({
    where: { userId: inspector.id },
    update: {},
    create: { userId: inspector.id, balance: 0, reserved: 0, totalPaid: 0 }
  });
  console.log("Wallet ready");

  // 3. Find the medical center project
  const project = await prisma.project.findFirst({
    where: { titleAr: { contains: "نجيب" } },
    orderBy: { id: "desc" }
  });
  if (!project) {
    console.error("ERROR: medical center project not found");
    return;
  }
  console.log("Project:", project.titleAr, "(id=" + project.id + ")");

  // 4. Upsert inspector application (only one pending per inspector per project)
  const existing = await prisma.inspectorApplication.findFirst({
    where: { projectId: project.id, inspectorId: inspector.id }
  });
  if (existing) {
    console.log("Application already exists (id=" + existing.id + ", status=" + existing.status + ") — skipping create");
  } else {
    const app = await prisma.inspectorApplication.create({
      data: {
        projectId: project.id,
        inspectorId: inspector.id,
        fee: 3500,
        notes: "أتقدم للإشراف على جودة التنفيذ لمشروع المركز الطبي — خبرة 8 سنوات في فحص المنشآت الطبية بمعايير NHRA.",
        status: "pending"
      }
    });
    console.log("Application submitted (id=" + app.id + ", fee=BHD 3,500, status=pending)");
  }

  // 5. Notify owner about new inspector candidacy (skip if already sent)
  const owner = await prisma.user.findUnique({ where: { email: "owner@firsttouch.bh" } });
  if (owner) {
    const alreadyNotified = await prisma.notification.findFirst({
      where: { userId: owner.id, titleAr: "ترشيح مفتش جديد" }
    });
    if (!alreadyNotified) {
      await prisma.notification.create({
        data: {
          userId: owner.id,
          type: "info",
          titleAr: "ترشيح مفتش جديد",
          messageAr: "تقدّم حسن عيسى من Dr Quality Constructions للإشراف على جودة مشروعك — بانتظار مراجعتك"
        }
      });
      console.log("Notified owner");
    } else {
      console.log("Owner already notified — skipping");
    }
  }

  // 6. Notify inspector
  const alreadyInspNotified = await prisma.notification.findFirst({
    where: { userId: inspector.id, titleAr: "تم تقديم ترشيحك" }
  });
  if (!alreadyInspNotified) {
    await prisma.notification.create({
      data: {
        userId: inspector.id,
        type: "info",
        titleAr: "تم تقديم ترشيحك",
        messageAr: "تم تقديم ترشيحك كمفتش لمشروع " + project.titleAr + " — بانتظار موافقة المالك"
      }
    });
    console.log("Notified inspector");
  }

  console.log("\nDone.");
  console.log("Login: inspector@firsttouch.bh / 123456");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => { await prisma.$disconnect(); });
