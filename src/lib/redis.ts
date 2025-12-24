import Redis from 'ioredis';

const globalForRedis = global as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ||
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    lazyConnect: true, // Don't connect immediately, useful for build steps
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
        if (times > 3) {
            // Stop retrying after 3 attempts
            return null;
        }
        return Math.min(times * 50, 2000);
    }
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

export default redis;
