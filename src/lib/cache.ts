import { redis } from '@/lib/redis';

export const cacheHelpers = {
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.warn('Cache retrieval failed:', error);
      return null;
    }
  },

  set: async (key: string, data: any, ttlSeconds: number = 300) => {
    try {
      await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    } catch (error) {
      console.warn('Cache set failed:', error);
    }
  },

  delete: async (key: string) => {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete failed:', error);
    }
  },

  deletePattern: async (pattern: string) => {
    try {
      // Use scan for better performance on large datasets compared to keys
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
      console.error('Cache pattern delete failed:', error);
    }
  },

  clear: async () => {
    try {
      await redis.flushall();
    } catch (error) {
      console.error('Cache clear failed:', error);
    }
  },
};