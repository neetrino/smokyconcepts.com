#!/usr/bin/env node
/**
 * Loads DATABASE_URL / DIRECT_URL from monorepo .env files, then runs prisma migrate.
 * DIRECT_URL falls back to DATABASE_URL when unset (fine for local Postgres).
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const packageRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(packageRoot, '..', '..');

const envPaths = [
  path.join(workspaceRoot, '.env.local'),
  path.join(workspaceRoot, '.env'),
  path.join(workspaceRoot, 'apps', 'web', '.env.local'),
  path.join(workspaceRoot, 'apps', 'web', '.env'),
];

for (const envPath of envPaths) {
  if (!fs.existsSync(envPath)) {
    continue;
  }
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (match && process.env[match[1]] === undefined) {
      const value = match[2].replace(/^["']|["']$/g, '').trim();
      process.env[match[1]] = value;
    }
  }
}

if (!process.env.DATABASE_URL) {
  console.error(
    '[db:migrate] DATABASE_URL is not set.\n' +
      'Add it to apps/web/.env or repo root .env (see env.example).',
  );
  process.exit(1);
}

if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
  console.log('[db:migrate] DIRECT_URL not set — using DATABASE_URL for migrations.');
}

const prismaCmd = process.argv.slice(2).join(' ') || 'migrate deploy';

process.chdir(packageRoot);
execSync(`npx prisma@5.22.0 ${prismaCmd}`, {
  stdio: 'inherit',
  env: process.env,
});
