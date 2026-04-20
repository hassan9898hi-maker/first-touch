// One-off: delete the old "مركز الرعاية دكتور نجيب الطبي" (project 1)
// that was a duplicate of the fully-set-up project 6
// ("مركز د. نجيب أبو بكر الطبي"). Both belong to the same owner and
// carry the same price. Project 1 has garbage-encoded locationAr
// and no stages/inspector; keep the fully-configured project 6.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Removing duplicate project 1…\n");

  const dup = await prisma.project.findUnique({ where: { id: 1 } });
  if (!dup) { console.log("Project 1 already gone — nothing to do."); return; }
  console.log("Target: id=" + dup.id + " | " + dup.titleAr + " | owner=" + dup.ownerId + " | budget=" + dup.totalBudget);

  // Delete dependent rows explicitly for audit clarity; relations cascade on delete
  const q = await prisma.quotation.deleteMany({ where: { projectId: 1 } });
  console.log("  Quotations deleted: " + q.count);
  const i = await prisma.inspectorApplication.deleteMany({ where: { projectId: 1 } });
  console.log("  Inspector apps deleted: " + i.count);

  await prisma.project.delete({ where: { id: 1 } });
  console.log("  Project deleted.");

  // Fix locationAr encoding on any other project where the bytes look like CP1256→UTF8 garble
  const projs = await prisma.project.findMany({
    where: { locationAr: { contains: "?" } }
  });
  for (const p of projs) {
    if (/^[?\s،,]+$/.test(p.locationAr || "")) {
      console.log("  Fixing location on project " + p.id + " (was: " + JSON.stringify(p.locationAr) + ")");
      await prisma.project.update({ where: { id: p.id }, data: { locationAr: "السيف، مملكة البحرين" } });
    }
  }

  console.log("\nDone. Remaining Najeeb projects:");
  const rem = await prisma.project.findMany({
    where: { titleAr: { contains: "نجيب" } },
    orderBy: { id: "asc" }
  });
  rem.forEach(p => console.log("  id=" + p.id + " | " + p.titleAr + " | owner=" + p.ownerId + " | " + p.status));
}

main().catch(e => { console.error("Error:", e); process.exit(1); }).finally(() => prisma.$disconnect());
