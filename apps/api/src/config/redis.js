const Redis = require('ioredis');

let redis = null;

try {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    lazyConnect: true,
  });

  redis.on('connect', () => console.log('✅ Redis connected'));
  redis.on('error', (err) => console.warn('⚠️ Redis error (running without cache):', err.message));

  redis.connect().catch(() => {
    console.warn('⚠️ Redis not available, running without cache');
    redis = null;
  });
} catch (err) {
  console.warn('⚠️ Redis not configured, running without cache');
  redis = null;
}

const cache = {
  async get(key) {
    if (!redis) return null;
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },

  async set(key, value, ttlSeconds = 300) {
    if (!redis) return;
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch { /* ignore */ }
  },

  async del(key) {
    if (!redis) return;
    try {
      await redis.del(key);
    } catch { /* ignore */ }
  },

  async flush(pattern) {
    if (!redis) return;
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) await redis.del(...keys);
    } catch { /* ignore */ }
  }
};

module.exports = { redis, cache };
