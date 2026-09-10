import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as any;

function isPostgresUrl(value: string) {
  return value.startsWith('postgresql://') || value.startsWith('postgres://');
}

/** Neon's transaction-mode pooler cannot keep Prisma's prepared statements alive. */
function isTransactionPoolerUrl(value: string) {
  return value.includes('-pooler.');
}

function withQueryParam(url: string, param: string) {
  return url.includes('?') ? `${url}&${param}` : `${url}?${param}`;
}

// Ensure UTF-8 encoding for PostgreSQL connection
// This fixes encoding issues with Armenian and other UTF-8 characters
const databaseUrl = process.env.DATABASE_URL || '';
let urlWithEncoding = databaseUrl;

if (isPostgresUrl(databaseUrl)) {
  if (!databaseUrl.includes('client_encoding')) {
    urlWithEncoding = withQueryParam(urlWithEncoding, 'client_encoding=UTF8');
  }

  if (isTransactionPoolerUrl(databaseUrl) && !databaseUrl.includes('pgbouncer=')) {
    urlWithEncoding = withQueryParam(urlWithEncoding, 'pgbouncer=true');
  }

  // Temporarily override DATABASE_URL for Prisma Client
  process.env.DATABASE_URL = urlWithEncoding;
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({ 
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    errorFormat: "pretty",
  });

// Prisma Client connects automatically on first query (lazy connection)
// No need to call $connect() explicitly as it can cause issues in Next.js API routes
// Connection will be established automatically when the first database query is made

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

