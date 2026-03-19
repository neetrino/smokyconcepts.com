#!/usr/bin/env node

/**
 * Cross-platform migration runner
 * Loads .env from project root, sets DIRECT_URL from DATABASE_URL if missing,
 * then runs migrate deploy (falls back to db:push on failure).
 * Always exits with success to allow build to continue
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Project root (monorepo: apps/web/scripts -> ../../..)
const root = path.join(__dirname, '../../..');
const dbPath = path.join(root, 'packages/db');

// Load .env from root so Prisma sees DATABASE_URL and DIRECT_URL
const envPaths = [path.join(root, '.env.local'), path.join(root, '.env')];
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf8');
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (match && process.env[match[1]] === undefined) {
        const value = match[2].replace(/^["']|["']$/g, '').trim();
        process.env[match[1]] = value;
      }
    }
    break;
  }
}

// Prisma requires DIRECT_URL when schema has directUrl; use DATABASE_URL if not set
if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

process.chdir(dbPath);

try {
  console.log('🔄 Attempting to deploy migrations...');
  execSync('npm run db:migrate:deploy', { stdio: 'inherit' });
  console.log('✅ Migrations deployed successfully');
} catch (error) {
  console.log('⚠️  Migration deploy failed, trying db:push...');
  try {
    execSync('npm run db:push', { stdio: 'inherit' });
    console.log('✅ Database schema pushed successfully');
  } catch (pushError) {
    console.log('⚠️  Database operations failed, but continuing build...');
    console.log('   (This is expected if DATABASE_URL is not set)');
  }
}

// Always exit with success to allow build to continue
process.exit(0);




