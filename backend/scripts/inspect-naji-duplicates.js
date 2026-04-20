// Inspect all projects that look like "نجيب" duplicates and show relationships
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const projs = await prisma.project.findMany({
    where: { OR: [{ titleAr: { contains: "نجيب" } }, { titleAr: { contains: "Najeeb" } }] },
    orderBy: { id: "asc" }
  });
  console.log("Projects matching Najeeb:", projs.length);
  for (const p of projs) {
    const [qc, ic, sc, fc] = await Promise.all([
      prisma.quotation.count({ where: { projectId: p.id } }),
      prisma.inspectorApplication.count({ where: { projectId: p.id } }),
      prisma.stage.count({ where: { projectId: p.id } }),
      prisma.projectImage.count({ where: { projectId: p.id } })
    ]);
    console.log("\n── Project id=" + p.id + " ──");
    console.log("  titleAr:   ", JSON.stringify(p.titleAr));
    console.log("  locationAr:", JSON.stringify(p.locationAr));
    console.log("  ownerId:   ", p.ownerId);
    console.log("  status:    ", p.status);
    console.log("  createdAt: ", p.createdAt);
    console.log("  totalBudget:", p.totalBudget);
    console.log("  areaSqm:   ", p.areaSqm);
    console.log("  quotations: " + qc + ", inspector apps: " + ic + ", stages: " + sc + ", images: " + fc);
  }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
