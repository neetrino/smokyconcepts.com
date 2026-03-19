#!/usr/bin/env node
/**
 * Runs prisma generate. For build (e.g. Vercel) sets dummy DATABASE_URL/DIRECT_URL
 * if missing so schema parsing succeeds; generated client is the same.
 * Runtime continues to use real env from the app.
 */
const { execSync } = require('child_process');
const path = require('path');

const DUMMY_URL = 'postgresql://build:build@localhost:5432/build';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = DUMMY_URL;
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

const packageRoot = path.resolve(__dirname, '..');
process.chdir(packageRoot);

const fs = require('fs');
const prismaSchema = path.join(packageRoot, 'prisma', 'schema.prisma');
if (!fs.existsSync(prismaSchema)) {
  console.error('[db:generate] missing schema at', prismaSchema, 'cwd:', process.cwd());
  process.exit(1);
}

try {
  execSync('npx prisma generate', {
    encoding: 'utf8',
    env: { ...process.env, FORCE_COLOR: '1' },
  });
} catch (err) {
  if (err.stdout) process.stdout.write(err.stdout);
  if (err.stderr) process.stderr.write(err.stderr);
  console.error('[db:generate] exit code:', err.status);
  process.exit(err.status ?? 1);
}
