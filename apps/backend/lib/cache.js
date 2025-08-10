let redisClient = null;
let memoryStore = new Map();

async function connectRedis(url) {
  try {
    const IORedis = require('ioredis');
    const client = new IORedis(url, { lazyConnect: true, maxRetriesPerRequest: 1 });
    await client.connect();
    redisClient = client;
  } catch (_) {
    redisClient = null;
  }
}

async function get(key) {
  if (redisClient) {
    try { const v = await redisClient.get(key); return v; } catch { return null; }
  }
  return memoryStore.get(key) ?? null;
}

async function set(key, value, ttlSec) {
  if (redisClient) {
    try { if (ttlSec) await redisClient.setex(key, ttlSec, value); else await redisClient.set(key, value); return; } catch {}
  }
  memoryStore.set(key, value);
  if (ttlSec) setTimeout(() => memoryStore.delete(key), ttlSec * 1000).unref?.();
}

module.exports = { connectRedis, get, set };
