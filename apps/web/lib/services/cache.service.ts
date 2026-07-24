/**
 * Cache Service
 * 
 * Service for Redis caching integration
 * Handles caching operations with graceful fallback if Redis is unavailable
 */

// Redis client will be initialized lazily
let redisClient: any = null;
let redisAvailable = false;
let connectionAttempted = false;
let errorLogged = false;
let lastErrorTime = 0;
const ERROR_COOLDOWN = 30000; // Only log errors every 30 seconds

/**
 * Initialize Redis client
 */
async function initRedis() {
  if (connectionAttempted) {
    return;
  }

  const redisUrl = process.env.REDIS_URL;
  const useRedis = redisUrl && redisUrl !== 'redis://localhost:6379';

  if (!useRedis) {
    connectionAttempted = true;
    console.warn('⚠️  Redis not configured - caching will be disabled');
    console.warn('💡 To enable Redis: Set REDIS_URL in .env');
    return;
  }

  try {
    // Dynamic import for serverless compatibility
    const Redis = (await import('ioredis')).default;
    
    redisClient = new Redis(redisUrl, {
      retryStrategy: (times: number) => {
        if (times > 3) {
          return null; // Stop retrying
        }
        return Math.min(times * 50, 2000);
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      showFriendlyErrorStack: true,
      enableOfflineQueue: false,
      reconnectOnError: () => false, // Don't auto-reconnect
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected');
      errorLogged = false;
      redisAvailable = true;
    });

    redisClient.on('ready', () => {
      redisAvailable = true;
    });

    redisClient.on('error', (error: Error) => {
      redisAvailable = false;
      const now = Date.now();
      if (!errorLogged || (now - lastErrorTime) > ERROR_COOLDOWN) {
        console.error('⚠️  Redis connection error:', error.message);
        console.error('💡 Check REDIS_URL in .env or start Redis server');
        errorLogged = true;
        lastErrorTime = now;
      }
    });

    await redisClient.connect();
    connectionAttempted = true;
  } catch (error: any) {
    connectionAttempted = true;
    redisAvailable = false;
    console.error('❌ [CACHE] Failed to initialize Redis:', error.message);
  }
}

/**
 * Get value from cache
 */
export async function get(key: string): Promise<string | null> {
  if (!redisAvailable) {
    await initRedis();
  }

  if (!redisAvailable || !redisClient) {
    return null;
  }

  try {
    return await redisClient.get(key);
  } catch (error) {
    return null;
  }
}

/**
 * Set value in cache
 */
export async function set(key: string, value: string): Promise<boolean> {
  if (!redisAvailable) {
    await initRedis();
  }

  if (!redisAvailable || !redisClient) {
    return false;
  }

  try {
    await redisClient.set(key, value);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Set value in cache with expiration
 */
export async function setex(key: string, seconds: number, value: string): Promise<boolean> {
  if (!redisAvailable) {
    await initRedis();
  }

  if (!redisAvailable || !redisClient) {
    return false;
  }

  try {
    await redisClient.setex(key, seconds, value);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Increment a counter key and set TTL on first hit (for rate limiting).
 * Returns null when Redis is unavailable.
 */
export async function increment(key: string, ttlSeconds: number): Promise<number | null> {
  if (!redisAvailable) {
    await initRedis();
  }

  if (!redisAvailable || !redisClient) {
    return null;
  }

  try {
    const count = await redisClient.incr(key);
    if (count === 1) {
      await redisClient.expire(key, ttlSeconds);
    }
    return count;
  } catch {
    return null;
  }
}

/**
 * Remaining TTL for a key in seconds (-1 if missing, -2 if no expiry).
 */
export async function ttl(key: string): Promise<number> {
  if (!redisAvailable) {
    await initRedis();
  }

  if (!redisAvailable || !redisClient) {
    return -1;
  }

  try {
    return await redisClient.ttl(key);
  } catch {
    return -1;
  }
}

/**
 * Delete key from cache
 */
export async function del(key: string): Promise<boolean> {
  if (!redisAvailable) {
    await initRedis();
  }

  if (!redisAvailable || !redisClient) {
    return false;
  }

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get multiple keys matching pattern
 */
export async function keys(pattern: string): Promise<string[]> {
  if (!redisAvailable) {
    await initRedis();
  }

  if (!redisAvailable || !redisClient) {
    return [];
  }

  try {
    return await redisClient.keys(pattern);
  } catch (error) {
    return [];
  }
}

/**
 * Delete multiple keys matching pattern
 */
export async function deletePattern(pattern: string): Promise<number> {
  if (!redisAvailable) {
    await initRedis();
  }

  if (!redisAvailable || !redisClient) {
    return 0;
  }

  try {
    const matchingKeys = await redisClient.keys(pattern);
    if (matchingKeys.length === 0) {
      return 0;
    }
    await redisClient.del(...matchingKeys);
    return matchingKeys.length;
  } catch (error) {
    return 0;
  }
}

/**
 * Check if Redis is available
 */
export function isAvailable(): boolean {
  return redisAvailable;
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

