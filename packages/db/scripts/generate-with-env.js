#!/usr/bin/env node
/**
 * Runs prisma generate. For build (e.g. Vercel) sets dummy DATABASE_URL/DIRECT_URL
 * if missing so schema parsing succeeds; generated client is the same.
 * Runtime continues to use real env from the app.
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const DUMMY_URL = 'postgresql://build:build@localhost:5432/build';

/** True if value looks like a real PostgreSQL URL (needed for Prisma getConfig validation). */
function isValidPostgresUrl(value) {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && (trimmed.startsWith('postgresql://') || trimmed.startsWith('postgres://'));
}

const useDummyDb = !isValidPostgresUrl(process.env.DATABASE_URL);
const useDummyDirect = !isValidPostgresUrl(process.env.DIRECT_URL);
const dbUrl = useDummyDb ? DUMMY_URL : process.env.DATABASE_URL;
const directUrl = useDummyDirect ? (useDummyDb ? DUMMY_URL : process.env.DATABASE_URL) : process.env.DIRECT_URL;

process.env.DATABASE_URL = dbUrl;
process.env.DIRECT_URL = directUrl;

const packageRoot = path.resolve(__dirname, '..');
process.chdir(packageRoot);
const workspaceRoot = path.resolve(packageRoot, '..', '..');

const prismaSchema = path.join(packageRoot, 'prisma', 'schema.prisma');
if (!fs.existsSync(prismaSchema)) {
  console.error('[db:generate] missing schema at', prismaSchema, 'cwd:', process.cwd());
  process.exit(1);
}

// Prisma (incl. v7) often reads .env from schema dir; write one so getConfig sees valid URLs when using dummy
const envPath = path.join(packageRoot, '.env');
const hadEnv = fs.existsSync(envPath);
let savedEnv = null;
if (hadEnv) {
  savedEnv = fs.readFileSync(envPath, 'utf8');
}
function restoreEnv() {
  if (hadEnv && savedEnv !== null) {
    try {
      fs.writeFileSync(envPath, savedEnv, 'utf8');
    } catch (_) {}
  } else if (!hadEnv && fs.existsSync(envPath)) {
    try {
      fs.unlinkSync(envPath);
    } catch (_) {}
  }
}

if (useDummyDb || useDummyDirect) {
  try {
    const envContent = `DATABASE_URL="${dbUrl.replace(/"/g, '\\"')}"\nDIRECT_URL="${directUrl.replace(/"/g, '\\"')}"\n`;
    fs.writeFileSync(envPath, envContent, 'utf8');
  } catch (_) {
    // read-only fs; process.env is already set
  }
}

try {
  execSync('npx prisma@5.22.0 generate', {
    encoding: 'utf8',
    cwd: packageRoot,
    env: { ...process.env, DATABASE_URL: dbUrl, DIRECT_URL: directUrl, FORCE_COLOR: '1' },
  });
} catch (err) {
  if (err.stdout) process.stdout.write(err.stdout);
  if (err.stderr) process.stderr.write(err.stderr);

  const fullErrorText = `${err.stdout || ''}\n${err.stderr || ''}\n${err.message || ''}`;
  const lockedWindowsEngine =
    process.platform === 'win32' &&
    fullErrorText.includes('EPERM') &&
    fullErrorText.includes('query_engine-windows.dll.node');
  const hasExistingGeneratedClient = fs.existsSync(path.join(workspaceRoot, 'node_modules', '.prisma', 'client', 'index.js'));

  if (lockedWindowsEngine && hasExistingGeneratedClient) {
    console.warn('[db:generate] Prisma engine file is locked on Windows (EPERM). Using existing generated client.');
    restoreEnv();
    process.exit(0);
  }

  console.error('[db:generate] exit code:', err.status);
  restoreEnv();
  process.exit(err.status ?? 1);
}
restoreEnv();
