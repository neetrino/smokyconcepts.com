/**
 * Neon Database Migration Deployment Script
 * 
 * Այս script-ը աշխատեցնում է Prisma migrations-ները Neon բազայում
 * Անվտանգ է - չի փորձում ստեղծել նոր migrations, միայն աշխատեցնում է գոյություն ունեցողները
 * 
 * Usage:
 *   DATABASE_URL="postgresql://..." tsx scripts/deploy-neon-migrations.ts
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import * as dotenv from "dotenv";

// Load environment variables (root: .env.local then .env)
const root = join(process.cwd());
dotenv.config({ path: join(root, ".env.local") });
dotenv.config({ path: join(root, ".env") });

const NEON_DATABASE_URL = process.env.DATABASE_URL;

if (!NEON_DATABASE_URL) {
  console.error("❌ [MIGRATION] DATABASE_URL environment variable is not set!");
  console.error("   Set DATABASE_URL in project root .env or .env.local, then run from root:");
  console.error("   pnpm run deploy:neon-migrations");
  process.exit(1);
}

// Ensure UTF-8 encoding is included
let databaseUrl = NEON_DATABASE_URL;
if (!databaseUrl.includes('client_encoding')) {
  databaseUrl = databaseUrl.includes('?') 
    ? `${databaseUrl}&client_encoding=UTF8`
    : `${databaseUrl}?client_encoding=UTF8`;
}

console.log("🚀 [MIGRATION] Starting Neon database migration deployment...");
console.log("📝 [MIGRATION] Database URL:", databaseUrl.replace(/:[^:@]+@/, ':****@')); // Hide password

// Set DATABASE_URL for Prisma
process.env.DATABASE_URL = databaseUrl;

const dbPath = join(process.cwd(), "packages/db");

// Check if packages/db exists
if (!existsSync(dbPath)) {
  console.error(`❌ [MIGRATION] Database package not found at: ${dbPath}`);
  process.exit(1);
}

try {
  console.log("\n📦 [MIGRATION] Step 1: Generating Prisma Client...");
  execSync("npm run db:generate", {
    cwd: dbPath,
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
  console.log("✅ [MIGRATION] Prisma Client generated successfully");

  console.log("\n🔄 [MIGRATION] Step 2: Deploying migrations to Neon database...");
  console.log("   This will run all pending migrations in order...");
  
  execSync("npm run db:migrate:deploy", {
    cwd: dbPath,
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
  
  console.log("\n✅ [MIGRATION] All migrations deployed successfully!");
  console.log("🎉 [MIGRATION] Your Neon database is now ready to use.");
  
} catch (error: any) {
  console.error("\n❌ [MIGRATION] Migration failed!");
  console.error("   Error:", error.message);
  
  if (error.stdout) {
    console.error("\n📋 [MIGRATION] Output:", error.stdout.toString());
  }
  
  if (error.stderr) {
    console.error("\n⚠️  [MIGRATION] Errors:", error.stderr.toString());
  }
  
  console.error("\n💡 [MIGRATION] Troubleshooting:");
  console.error("   1. Check that DATABASE_URL is correct");
  console.error("   2. Verify that Neon database is accessible");
  console.error("   3. Ensure you have proper permissions");
  console.error("   4. Check network connectivity");
  
  process.exit(1);
}

