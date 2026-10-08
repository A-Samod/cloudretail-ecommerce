const { createClient } = require('redis');
const logger = require('../utils/logger');

let redisClient;

const initializeRedis = async () => {
  try {
    // Skip Redis if DISABLE_REDIS=true
    if (process.env.DISABLE_REDIS === 'true') {
      logger.info('Redis disabled by configuration');
      return;
    }

    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err) => {
      logger.warn('Redis Client Error (service will continue without cache):', err.message);
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected - Caching enabled');
    });

    await redisClient.connect();
  } catch (error) {
    logger.warn('Failed to connect to Redis - Service will run without caching:', error.message);
    redisClient = null;
  }
};

const getCache = async (key) => {
  try {
    if (!redisClient || !redisClient.isOpen) return null;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Redis GET error:', error);
    return null;
  }
};

const setCache = async (key, data, ttl = 3600) => {
  try {
    if (!redisClient || !redisClient.isOpen) return;
    await redisClient.setEx(key, ttl, JSON.stringify(data));
  } catch (error) {
    logger.error('Redis SET error:', error);
  }
};

const deleteCache = async (key) => {
  try {
    if (!redisClient || !redisClient.isOpen) return;
    await redisClient.del(key);
  } catch (error) {
    logger.error('Redis DELETE error:', error);
  }
};

const clearCachePattern = async (pattern) => {
  try {
    if (!redisClient || !redisClient.isOpen) return;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    logger.error('Redis CLEAR pattern error:', error);
  }
};

module.exports = {
  initializeRedis,
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
};
