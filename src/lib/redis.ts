import Redis from 'ioredis';

const globalForRedis = global as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ||
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    lazyConnect: true, // Don't connect immediately, useful for build steps
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
        // Keep retrying with exponential backoff, capped at 2 seconds
        // Never return null, so the client doesn't disconnect permanently
        return Math.min(times * 50, 2000);
    }
  });

// Suppress Redis connection errors in logs since cache failures are handled gracefully
redis.on('error', (err) => {
  // Only log in development, suppress in production to avoid noise
  if (process.env.NODE_ENV === 'development') {
    console.warn('Redis connection error (cache will fallback to database):', err.message);
  }
});

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

export default redis;
