import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// 扩展Request类型
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
        isStudentVerified: boolean;
        isBlueCardMember: boolean;
      };
    }
  }
}

// JWT认证中间件
export const authenticate = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
      return;
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: '用户不存在'
      });
      return;
    }

    if (user.status !== 'active') {
      res.status(401).json({
        success: false,
        message: '账户已被禁用'
      });
      return;
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      isStudentVerified: user.isStudentVerified,
      isBlueCardMember: user.isBlueCardMember
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: '无效的认证令牌'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  }
};

// 可选认证中间件（用户可以是游客）
export const optionalAuth = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.status === 'active') {
      req.user = {
        userId: user._id.toString(),
        role: user.role,
        isStudentVerified: user.isStudentVerified,
        isBlueCardMember: user.isBlueCardMember
      };
    }

    next();
  } catch (error) {
    // 认证失败时继续处理请求（作为游客）
    next();
  }
};

// 角色授权中间件
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: '需要登录'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: '权限不足'
      });
      return;
    }

    next();
  };
};

// 学生认证检查中间件
export const requireStudentVerification = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: '需要登录'
    });
    return;
  }

  if (!req.user.isStudentVerified) {
    res.status(403).json({
      success: false,
      message: '需要完成学生认证'
    });
    return;
  }

  next();
};

// 蓝卡会员检查中间件
export const requireBlueCardMember = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: '需要登录'
    });
    return;
  }

  if (!req.user.isBlueCardMember) {
    res.status(403).json({
      success: false,
      message: '需要蓝卡会员认证'
    });
    return;
  }

  next();
};