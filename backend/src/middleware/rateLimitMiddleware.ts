import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';

// 创建限流器实例
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rl_global',
  points: 100, // 请求次数
  duration: 60, // 时间窗口（秒）
  blockDuration: 60 // 封锁时间（秒）
});

// 登录限流器
const loginLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rl_login',
  points: 5, // 5次尝试
  duration: 900, // 15分钟
  blockDuration: 900 // 封锁15分钟
});

// 注册限流器
const registerLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rl_register',
  points: 3, // 3次注册
  duration: 3600, // 1小时
  blockDuration: 3600 // 封锁1小时
});

// 发帖限流器
const postLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rl_post',
  points: 10, // 10篇帖子
  duration: 3600, // 1小时
  blockDuration: 1800 // 封锁30分钟
});

// 通用限流中间件
export const createRateLimitMiddleware = (limiter: RateLimiterRedis) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = req.ip || 'unknown';
      await limiter.consume(key);
      next();
    } catch (rejRes: any) {
      const remainingTime = Math.round(rejRes.msBeforeNext / 1000) || 1;
      
      res.status(429).json({
        success: false,
        message: '请求过于频繁，请稍后再试',
        retryAfter: remainingTime
      });
    }
  };
};

// 基于用户的限流中间件
export const createUserRateLimitMiddleware = (limiter: RateLimiterRedis) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = req.user?.userId || req.ip || 'unknown';
      await limiter.consume(key);
      next();
    } catch (rejRes: any) {
      const remainingTime = Math.round(rejRes.msBeforeNext / 1000) || 1;
      
      res.status(429).json({
        success: false,
        message: '操作过于频繁，请稍后再试',
        retryAfter: remainingTime
      });
    }
  };
};

// 导出各种限流中间件
export const globalRateLimit = createRateLimitMiddleware(rateLimiter);
export const loginRateLimit = createRateLimitMiddleware(loginLimiter);
export const registerRateLimit = createRateLimitMiddleware(registerLimiter);
export const postRateLimit = createUserRateLimitMiddleware(postLimiter);

// 默认导出全局限流
export { globalRateLimit as rateLimiter };