const { spawnSync } = require("child_process");

const command = process.execPath;
const prismaCli = require.resolve("prisma/build/index.js");
const env = Object.assign({}, process.env, {
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost/dummy"
});

const result = spawnSync(command, [prismaCli, "generate"], {
  stdio: "inherit",
  env
});

if (result.error) {
  throw result.error;
}

process.exit(result.status === null ? 1 : result.status);
