/**
 * Redis Configuration
 * Setup Redis client for caching and session management
 */

import Redis, { RedisOptions } from 'ioredis';

// Redis connection configuration
const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
};

// Create Redis client instance
export const redis = new Redis(redisConfig);

// Connection event handlers
redis.on('connect', () => {
  console.log('🔄 Connecting to Redis...');
});

redis.on('ready', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (error) => {
  console.error('❌ Redis connection error:', error);
});

redis.on('close', () => {
  console.log('🔌 Redis connection closed');
});

redis.on('reconnecting', () => {
  console.log('🔄 Reconnecting to Redis...');
});

// Graceful shutdown handler
const gracefulShutdown = async () => {
  console.log('🔄 Disconnecting from Redis...');
  await redis.quit();
  console.log('✅ Redis disconnected');
};

// Handle shutdown signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

/**
 * Health check function for Redis connection
 */
export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    const result = await redis.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
};

/**
 * Cache helper functions
 */

/**
 * Set a value in cache with optional TTL
 */
export const setCache = async (
  key: string,
  value: any,
  ttl?: number
): Promise<void> => {
  const serialized = JSON.stringify(value);
  if (ttl) {
    await redis.setex(key, ttl, serialized);
  } else {
    await redis.set(key, serialized);
  }
};

/**
 * Get a value from cache
 */
export const getCache = async <T = any>(key: string): Promise<T | null> => {
  const value = await redis.get(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Error parsing cached value:', error);
    return null;
  }
};

/**
 * Delete a value from cache
 */
export const deleteCache = async (key: string): Promise<void> => {
  await redis.del(key);
};

/**
 * Delete multiple keys matching a pattern
 */
export const deleteCachePattern = async (pattern: string): Promise<void> => {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};

/**
 * Check if a key exists in cache
 */
export const cacheExists = async (key: string): Promise<boolean> => {
  const result = await redis.exists(key);
  return result === 1;
};

/**
 * Set expiration time for a key
 */
export const setCacheExpiry = async (
  key: string,
  ttl: number
): Promise<void> => {
  await redis.expire(key, ttl);
};

/**
 * Increment a counter in cache
 */
export const incrementCache = async (key: string): Promise<number> => {
  return await redis.incr(key);
};

/**
 * Decrement a counter in cache
 */
export const decrementCache = async (key: string): Promise<number> => {
  return await redis.decr(key);
};

/**
 * Get multiple values from cache
 */
export const getCacheMultiple = async <T = any>(
  keys: string[]
): Promise<(T | null)[]> => {
  if (keys.length === 0) return [];
  const values = await redis.mget(...keys);
  return values.map((value) => {
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Error parsing cached value:', error);
      return null;
    }
  });
};

/**
 * Set multiple values in cache
 */
export const setCacheMultiple = async (
  entries: Record<string, any>
): Promise<void> => {
  const pipeline = redis.pipeline();
  for (const [key, value] of Object.entries(entries)) {
    pipeline.set(key, JSON.stringify(value));
  }
  await pipeline.exec();
};

/**
 * Cache key generators for consistent naming
 */
export const CacheKeys = {
  slot: (slotId: string) => `slot:${slotId}`,
  slotAvailability: (zoneId: string, date: string) => 
    `slot:availability:${zoneId}:${date}`,
  order: (orderId: string) => `order:${orderId}`,
  truck: (truckId: string) => `truck:${truckId}`,
  truckAvailability: (truckId: string) => `truck:availability:${truckId}`,
  inventory: (itemId: string) => `inventory:${itemId}`,
  inventoryStock: (sku: string) => `inventory:stock:${sku}`,
  driver: (driverId: string) => `driver:${driverId}`,
  load: (loadId: string) => `load:${loadId}`,
  route: (loadId: string) => `route:${loadId}`,
  reservation: (reservationId: string) => `reservation:${reservationId}`,
  session: (sessionId: string) => `session:${sessionId}`,
};

/**
 * Default TTL values (in seconds)
 */
export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
  WEEK: 604800, // 7 days
};

export default redis;

// Made with Bob
