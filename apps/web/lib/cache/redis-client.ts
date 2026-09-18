import { Redis } from '@upstash/redis';
import { logger } from '@/lib/utils/logger';
import {
  IOREDIS_MAX_RETRY_ATTEMPTS,
  IOREDIS_MAX_RETRY_DELAY_MS,
  IOREDIS_RETRY_DELAY_MS,
  LOCAL_DEFAULT_REDIS_URL,
  REDIS_ERROR_LOG_COOLDOWN_MS,
} from './redis.constants';

export interface CacheRedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  setex(key: string, seconds: number, value: string): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
  del(...keys: string[]): Promise<void>;
  keys(pattern: string): Promise<string[]>;
}

let redisClient: CacheRedisClient | null = null;
let redisAvailable = false;
let connectionAttempted = false;
let errorLogged = false;
let lastErrorTime = 0;

function getUpstashUrl(): string {
  return process.env.UPSTASH_REDIS_REST_URL?.trim() ?? '';
}

function getUpstashToken(): string {
  return process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ?? '';
}

function getRedisUrl(): string {
  return process.env.REDIS_URL?.trim() ?? '';
}

function hasUpstashConfig(): boolean {
  return getUpstashUrl().length > 0 && getUpstashToken().length > 0;
}

function hasTcpRedisConfig(): boolean {
  const redisUrl = getRedisUrl();
  return redisUrl.length > 0 && redisUrl !== LOCAL_DEFAULT_REDIS_URL;
}

function logRedisError(message: string, error: unknown): void {
  const now = Date.now();
  if (errorLogged && now - lastErrorTime <= REDIS_ERROR_LOG_COOLDOWN_MS) {
    return;
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  logger.error(message, { error: errorMessage });
  errorLogged = true;
  lastErrorTime = now;
}

function toCacheString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function wrapUpstash(redis: Redis): CacheRedisClient {
  return {
    async get(key: string): Promise<string | null> {
      return toCacheString(await redis.get(key));
    },
    async set(key: string, value: string): Promise<void> {
      await redis.set(key, value);
    },
    async setex(key: string, seconds: number, value: string): Promise<void> {
      await redis.set(key, value, { ex: seconds });
    },
    async incr(key: string): Promise<number> {
      return redis.incr(key);
    },
    async expire(key: string, seconds: number): Promise<void> {
      await redis.expire(key, seconds);
    },
    async ttl(key: string): Promise<number> {
      return redis.ttl(key);
    },
    async del(...keys: string[]): Promise<void> {
      if (keys.length === 0) {
        return;
      }
      await redis.del(...keys);
    },
    async keys(pattern: string): Promise<string[]> {
      return redis.keys(pattern);
    },
  };
}

async function connectUpstash(): Promise<CacheRedisClient> {
  const redis = new Redis({
    url: getUpstashUrl(),
    token: getUpstashToken(),
  });
  const pong = await redis.ping();
  if (pong !== 'PONG') {
    throw new Error('Upstash Redis ping failed');
  }
  logger.info('Upstash Redis connected');
  return wrapUpstash(redis);
}

function wrapIoredis(client: import('ioredis').default): CacheRedisClient {
  return {
    async get(key: string): Promise<string | null> {
      return client.get(key);
    },
    async set(key: string, value: string): Promise<void> {
      await client.set(key, value);
    },
    async setex(key: string, seconds: number, value: string): Promise<void> {
      await client.setex(key, seconds, value);
    },
    async incr(key: string): Promise<number> {
      return client.incr(key);
    },
    async expire(key: string, seconds: number): Promise<void> {
      await client.expire(key, seconds);
    },
    async ttl(key: string): Promise<number> {
      return client.ttl(key);
    },
    async del(...keys: string[]): Promise<void> {
      if (keys.length === 0) {
        return;
      }
      await client.del(...keys);
    },
    async keys(pattern: string): Promise<string[]> {
      return client.keys(pattern);
    },
  };
}

async function connectIoredis(): Promise<CacheRedisClient> {
  const { default: IORedis } = await import('ioredis');
  const client = new IORedis(getRedisUrl(), {
    retryStrategy: (times: number) => {
      if (times > IOREDIS_MAX_RETRY_ATTEMPTS) {
        return null;
      }
      return Math.min(times * IOREDIS_RETRY_DELAY_MS, IOREDIS_MAX_RETRY_DELAY_MS);
    },
    maxRetriesPerRequest: IOREDIS_MAX_RETRY_ATTEMPTS,
    enableReadyCheck: true,
    lazyConnect: true,
    enableOfflineQueue: false,
    reconnectOnError: () => false,
  });

  client.on('error', (error: Error) => {
    redisAvailable = false;
    logRedisError('Redis connection error', error);
  });

  await client.connect();
  logger.info('Redis TCP connected');
  return wrapIoredis(client);
}

/**
 * Lazily connects to Upstash REST Redis, or TCP Redis via REDIS_URL.
 */
export async function getRedisClient(): Promise<CacheRedisClient | null> {
  if (connectionAttempted) {
    return redisAvailable ? redisClient : null;
  }

  connectionAttempted = true;

  if (!hasUpstashConfig() && !hasTcpRedisConfig()) {
    logger.warn('Redis not configured — caching and Redis rate limits disabled');
    return null;
  }

  try {
    redisClient = hasUpstashConfig() ? await connectUpstash() : await connectIoredis();
    redisAvailable = true;
    errorLogged = false;
    return redisClient;
  } catch (error) {
    redisAvailable = false;
    redisClient = null;
    logRedisError('Failed to initialize Redis', error);
    return null;
  }
}

export function isRedisAvailable(): boolean {
  return redisAvailable;
}
