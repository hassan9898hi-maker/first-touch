// Production startup script
// Sets environment variables and runs migrations before starting the server

require("dotenv").config();

// Production defaults
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://hassn:ToThVIcyPQMtKnbBmN0djaFAi7whALWd@dpg-d74ht0dm5p6s73f7hlng-a/hassan_37fy";
}
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = "firsttouch-jwt-secret-2024-prod-x9k2m";
if (!process.env.JWT_REFRESH_SECRET) process.env.JWT_REFRESH_SECRET = "firsttouch-refresh-secret-2024-prod-z7w4n";
if (!process.env.NODE_ENV) process.env.NODE_ENV = "production";

const { execSync } = require("child_process");

// Run prisma migrate deploy
try {
  console.log("Running database migrations...");
  execSync("npx prisma migrate deploy", { stdio: "inherit", env: process.env });
  console.log("Migrations completed successfully!");
} catch (err) {
  console.log("Migration warning (may be first run):", err.message);
  // Try db push as fallback
  try {
    console.log("Trying prisma db push as fallback...");
    execSync("npx prisma db push --skip-generate", { stdio: "inherit", env: process.env });
    console.log("DB push completed successfully!");
  } catch (e) {
    console.error("DB setup failed:", e.message);
  }
}

// Start the server
require("./src/server.js");
