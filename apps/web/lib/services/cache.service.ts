/**
 * Redis cache operations with graceful fallback when Redis is unavailable.
 */
import { getRedisClient, isRedisAvailable, type CacheRedisClient } from '@/lib/cache/redis-client';
import { logger } from '@/lib/utils/logger';

async function withClient<T>(
  fallback: T,
  operation: (client: CacheRedisClient) => Promise<T>,
): Promise<T> {
  const client = await getRedisClient();
  if (!client) {
    return fallback;
  }

  try {
    return await operation(client);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.warn('Redis operation failed', { error: errorMessage });
    return fallback;
  }
}

/** Get value from cache. */
export async function get(key: string): Promise<string | null> {
  return withClient(null, (client) => client.get(key));
}

/** Set value in cache. */
export async function set(key: string, value: string): Promise<boolean> {
  return withClient(false, async (client) => {
    await client.set(key, value);
    return true;
  });
}

/** Set value in cache with expiration. */
export async function setex(key: string, seconds: number, value: string): Promise<boolean> {
  return withClient(false, async (client) => {
    await client.setex(key, seconds, value);
    return true;
  });
}

/**
 * Increment a counter key and set TTL on first hit (for rate limiting).
 * Returns null when Redis is unavailable.
 */
export async function increment(key: string, ttlSeconds: number): Promise<number | null> {
  return withClient(null, async (client) => {
    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, ttlSeconds);
    }
    return count;
  });
}

/** Remaining TTL for a key in seconds (-1 if missing or Redis is down). */
export async function ttl(key: string): Promise<number> {
  return withClient(-1, (client) => client.ttl(key));
}

/** Delete key from cache. */
export async function del(key: string): Promise<boolean> {
  return withClient(false, async (client) => {
    await client.del(key);
    return true;
  });
}

/** Get keys matching pattern. */
export async function keys(pattern: string): Promise<string[]> {
  return withClient([], (client) => client.keys(pattern));
}

/** Delete keys matching pattern. */
export async function deletePattern(pattern: string): Promise<number> {
  return withClient(0, async (client) => {
    const matchingKeys = await client.keys(pattern);
    if (matchingKeys.length === 0) {
      return 0;
    }
    await client.del(...matchingKeys);
    return matchingKeys.length;
  });
}

/** Check if Redis is available. */
export function isAvailable(): boolean {
  return isRedisAvailable();
}

export const cacheService = {
  get,
  set,
  setex,
  increment,
  ttl,
  del,
  keys,
  deletePattern,
  isAvailable,
};
