import { redis } from '@/lib/redis';

export const cacheHelpers = {
  get: async <T>(key: string): Promise<T | null> => {
    // Skip cache if Redis is not ready
    if (redis.status !== 'ready') return null;

    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.warn(`Cache retrieval failed (Status: ${redis.status}):`, error);
      return null;
    }
  },

  set: async (key: string, data: any, ttlSeconds: number = 300) => {
    // Skip cache if Redis is not ready
    if (redis.status !== 'ready') return;

    try {
      await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    } catch (error) {
      console.warn(`Cache set failed (Status: ${redis.status}):`, error);
    }
  },

  delete: async (key: string) => {
    // Skip cache if Redis is not ready
    if (redis.status !== 'ready') return;

    try {
      await redis.del(key);
    } catch (error) {
      console.warn(`Cache delete failed (Status: ${redis.status}):`, error);
    }
  },

  deletePattern: async (pattern: string) => {
    // Skip cache operations if Redis is not ready
    if (redis.status !== 'ready') return;

    try {
      const stream = redis.scanStream({
        match: pattern,
        count: 100
      });

      stream.on('data', async (keys: string[]) => {
        if (keys.length) {
          await redis.del(...keys);
        }
      });

      return new Promise<void>((resolve, reject) => {
        stream.on('end', () => resolve());
        stream.on('error', (err) => reject(err));
      });
    } catch (error) {
      console.warn(`Cache pattern delete failed (Status: ${redis.status}):`, error);
    }
  },

  clear: async () => {
    // Skip cache if Redis is not ready
    if (redis.status !== 'ready') return;

    try {
      await redis.flushall();
    } catch (error) {
      console.warn(`Cache clear failed (Status: ${redis.status}):`, error);
    }
  },
};