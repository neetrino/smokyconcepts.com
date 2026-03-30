/**
 * Script to migrate database from WIN1251 to UTF-8 encoding
 * 
 * This script helps migrate your database to UTF-8 encoding by:
 * 1. Checking current database encoding
 * 2. Parsing DATABASE_URL to extract connection info
 * 3. Providing ready-to-use SQL commands and instructions
 * 
 * IMPORTANT: This script does NOT automatically recreate the database.
 * You need to manually create a new database with UTF-8 encoding.
 * 
 * Usage:
 *   npm run migrate:db-to-utf8
 *   or
 *   tsx scripts/migrate-db-to-utf8.ts
 */

import dotenv from "dotenv";
import { checkDatabaseEncoding } from "../packages/db/utils/check-encoding";
import { writeFileSync } from "fs";
import { join } from "path";

// Load environment variables
dotenv.config();

function parseDatabaseUrl(url: string) {
  try {
    const match = url.match(/postgres(ql)?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
    if (!match) return null;
    
    return {
      user: match[2],
      password: match[3],
      host: match[4],
      port: match[5],
      database: match[6],
    };
  } catch {
    return null;
  }
}

async function main() {
  console.log("🔍 [DB MIGRATION] Checking database encoding...\n");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL environment variable is not set!");
    console.error("   Please set DATABASE_URL in your .env file.");
    process.exit(1);
  }

  try {
    // Check encoding
    const encodingInfo = await checkDatabaseEncoding();
    const dbInfo = parseDatabaseUrl(databaseUrl);

    console.log("📊 Current Database Encoding:");
    console.log("─────────────────────────────────");
    console.log(`Database: ${encodingInfo.database.name}`);
    console.log(`  Encoding: ${encodingInfo.database.encoding}`);
    console.log(`  UTF-8: ${encodingInfo.isUtf8.database ? "✅ Yes" : "❌ No"}`);
    console.log();

    if (encodingInfo.isUtf8.database) {
      console.log("✅ Your database is already using UTF-8 encoding!");
      console.log("   No migration needed.");
      process.exit(0);
    }

    console.log("⚠️  Your database is using " + encodingInfo.database.encoding + " encoding, not UTF-8.");
    console.log();
    console.log("📋 Migration Steps:");
    console.log("─────────────────────────────────");
    console.log();

    const newDbName = `${encodingInfo.database.name}_utf8`;
    const backupFile = `backup_${encodingInfo.database.name}_${Date.now()}.dump`;

    // Step 1: Backup
    console.log("1️⃣  Create a backup of your current database:");
    console.log("─────────────────────────────────");
    if (dbInfo) {
      console.log(`   pg_dump -h ${dbInfo.host} -p ${dbInfo.port} -U ${dbInfo.user} -F c -f ${backupFile} ${encodingInfo.database.name}`);
    } else {
      console.log(`   pg_dump -U postgres -F c -f ${backupFile} ${encodingInfo.database.name}`);
    }
    console.log();

    // Step 2: Create new database
    console.log("2️⃣  Create a new database with UTF-8 encoding:");
    console.log("─────────────────────────────────");
    const createDbSql = `-- Create new UTF-8 database
CREATE DATABASE ${newDbName}
WITH ENCODING 'UTF8'
LC_COLLATE='en_US.UTF-8'
LC_CTYPE='en_US.UTF-8'
TEMPLATE template0;`;
    
    console.log(createDbSql);
    console.log();
    
    // Save SQL to file
    const sqlFile = join(process.cwd(), `create_${newDbName}.sql`);
    writeFileSync(sqlFile, createDbSql);
    console.log(`   💾 SQL saved to: ${sqlFile}`);
    console.log();

    // Step 3: Restore
    console.log("3️⃣  Restore data to the new database:");
    console.log("─────────────────────────────────");
    if (dbInfo) {
      console.log(`   pg_restore -h ${dbInfo.host} -p ${dbInfo.port} -U ${dbInfo.user} -d ${newDbName} ${backupFile}`);
    } else {
      console.log(`   pg_restore -U postgres -d ${newDbName} ${backupFile}`);
    }
    console.log();

    // Step 4: Update DATABASE_URL
    console.log("4️⃣  Update your DATABASE_URL in .env file:");
    console.log("─────────────────────────────────");
    const newUrl = databaseUrl.replace(`/${encodingInfo.database.name}`, `/${newDbName}`);
    const finalUrl = newUrl.includes('client_encoding') 
      ? newUrl 
      : newUrl.includes('?') 
        ? `${newUrl}&client_encoding=UTF8`
        : `${newUrl}?client_encoding=UTF8`;
    
    console.log(`   DATABASE_URL="${finalUrl}"`);
    console.log();

    // Step 5: Test
    console.log("5️⃣  Test the new database:");
    console.log("─────────────────────────────────");
    console.log("   npm run check:db-encoding");
    console.log();

    // Neon specific instructions
    if (databaseUrl.includes('neon.tech') || databaseUrl.includes('neon')) {
      console.log("⚠️  Neon Database Detected:");
      console.log("─────────────────────────────────");
      console.log("   1. Go to Neon Dashboard");
      console.log("   2. Create a new database (it will be UTF-8 by default)");
      console.log("   3. Copy the new DATABASE_URL");
      console.log("   4. Update your .env file with the new DATABASE_URL");
      console.log("   5. Run migrations: npm run deploy:neon-migrations");
      console.log();
    }

    console.log("📝 Summary:");
    console.log("─────────────────────────────────");
    console.log(`   Old database: ${encodingInfo.database.name} (${encodingInfo.database.encoding})`);
    console.log(`   New database: ${newDbName} (UTF8)`);
    console.log(`   Backup file: ${backupFile}`);
    console.log(`   SQL file: ${sqlFile}`);
    console.log();

    process.exit(1);
  } catch (error: any) {
    console.error("❌ [DB MIGRATION] Error:", error);
    console.error("\n💡 Tip: Make sure DATABASE_URL is set correctly in your .env file");
    process.exit(1);
  }
}

main();

