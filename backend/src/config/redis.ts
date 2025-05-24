import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
  }
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('🔴 Redis Connected');
});

redisClient.on('ready', () => {
  console.log('🔴 Redis Ready');
});

redisClient.on('end', () => {
  console.log('🔴 Redis Connection Ended');
});

// Redis工具函数
export const cacheService = {
  // 设置缓存
  async set(key: string, value: any, expireInSeconds?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (expireInSeconds) {
        await redisClient.setEx(key, expireInSeconds, serializedValue);
      } else {
        await redisClient.set(key, serializedValue);
      }
    } catch (error) {
      console.error('Redis set error:', error);
    }
  },

  // 获取缓存
  async get(key: string): Promise<any> {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },

  // 删除缓存
  async del(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  },

  // 检查键是否存在
  async exists(key: string): Promise<boolean> {
    try {
      return (await redisClient.exists(key)) === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  },

  // 设置过期时间
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await redisClient.expire(key, seconds);
    } catch (error) {
      console.error('Redis expire error:', error);
    }
  }
};

export default redisClient;