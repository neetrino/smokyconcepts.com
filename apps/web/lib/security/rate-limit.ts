import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { cacheService } from '@/lib/services/cache.service';
import { RATE_LIMIT_HTTP_STATUS } from './rate-limit.constants';

export interface RateLimitOptions {
  /** Unique namespace, e.g. `auth:login`. */
  scope: string;
  /** Maximum allowed hits within the window. */
  limit: number;
  /** Sliding window length in seconds. */
  windowSeconds: number;
}

interface MemoryBucket {
  count: number;
  resetAtMs: number;
}

const memoryBuckets = new Map<string, MemoryBucket>();

function buildRedisKey(scope: string, clientKey: string): string {
  return `ratelimit:${scope}:${clientKey}`;
}

function buildMemoryKey(scope: string, clientKey: string): string {
  return `${scope}:${clientKey}`;
}

/**
 * Resolves client IP from reverse-proxy headers (Vercel / Cloudflare).
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwardedFor) {
    return forwardedFor;
  }
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

function checkMemoryBucket(
  key: string,
  limit: number,
  windowSeconds: number,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = memoryBuckets.get(key);

  if (!existing || now >= existing.resetAtMs) {
    memoryBuckets.set(key, { count: 1, resetAtMs: now + windowMs });
    return { allowed: true, retryAfterSeconds: windowSeconds };
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAtMs - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  existing.count += 1;
  memoryBuckets.set(key, existing);
  return { allowed: true, retryAfterSeconds: Math.ceil((existing.resetAtMs - now) / 1000) };
}

async function checkRedisBucket(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; retryAfterSeconds: number } | null> {
  const count = await cacheService.increment(key, windowSeconds);
  if (count === null) {
    return null;
  }

  if (count > limit) {
    const ttl = await cacheService.ttl(key);
    return {
      allowed: false,
      retryAfterSeconds: ttl > 0 ? ttl : windowSeconds,
    };
  }

  return { allowed: true, retryAfterSeconds: windowSeconds };
}

function buildRateLimitResponse(retryAfterSeconds: number, instance: string): NextResponse {
  return NextResponse.json(
    {
      type: 'https://api.shop.am/problems/rate-limit',
      title: 'Too Many Requests',
      status: RATE_LIMIT_HTTP_STATUS,
      detail: 'Too many requests. Please try again later.',
      instance,
    },
    {
      status: RATE_LIMIT_HTTP_STATUS,
      headers: {
        'Retry-After': String(retryAfterSeconds),
      },
    },
  );
}

/**
 * Returns a 429 response when the limit is exceeded, otherwise `null`.
 */
export async function enforceRateLimit(
  req: NextRequest,
  options: RateLimitOptions,
): Promise<NextResponse | null> {
  const clientKey = getClientIp(req);
  const redisKey = buildRedisKey(options.scope, clientKey);
  const memoryKey = buildMemoryKey(options.scope, clientKey);

  const redisResult = await checkRedisBucket(redisKey, options.limit, options.windowSeconds);
  const result =
    redisResult ??
    checkMemoryBucket(memoryKey, options.limit, options.windowSeconds);

  if (result.allowed) {
    return null;
  }

  return buildRateLimitResponse(result.retryAfterSeconds, req.url);
}
