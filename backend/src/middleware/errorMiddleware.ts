import { Request, Response, NextFunction } from 'express';

// 404错误处理
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// 全局错误处理
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误日志
  console.error(err);

  // Mongoose 重复键错误
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} 已存在`;
    error = { message, statusCode: 400 };
  }

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val: any) => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Mongoose 无效ObjectId错误
  if (err.name === 'CastError') {
    const message = '资源未找到';
    error = { message, statusCode: 404 };
  }

  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    const message = '无效的认证令牌';
    error = { message, statusCode: 401 };
  }

  // JWT过期错误
  if (err.name === 'TokenExpiredError') {
    const message = '认证令牌已过期';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 异步错误处理包装器
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};