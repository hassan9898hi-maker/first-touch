const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const qs = await prisma.quotation.findMany({
    where: { projectId: 1 },
    include: { contractor: { select: { nameAr: true, email: true, companyNameAr: true } } }
  });
  console.log("Quotations on project 1:");
  qs.forEach(q => console.log("  id=" + q.id, "|", q.contractor?.nameAr, "(" + q.contractor?.email + ")", "|", q.price, "BHD", "|", q.status));

  // Also check related notifications that reference project 1
  const nf = await prisma.notification.findMany({
    where: { OR: [{ messageAr: { contains: "مركز الرعاية" } }, { titleAr: { contains: "مركز الرعاية" } }] }
  });
  console.log("\nRelated notifications:", nf.length);

  // Files
  try {
    const pi = await prisma.projectImage.count({ where: { projectId: 1 } });
    console.log("ProjectImages: " + pi);
  } catch (e) {}
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
