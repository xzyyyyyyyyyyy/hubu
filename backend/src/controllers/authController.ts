import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import User, { IUser } from '../models/User';
import StudentVerification from '../models/StudentVerification';
import BlueCardVerification from '../models/BlueCardVerification';
import { cacheService } from '../config/redis';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';
import { uploadToQiniu } from '../services/uploadService';
import { asyncHandler } from '../middleware/errorMiddleware';

// 生成JWT Token
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// 生成验证码
const generateVerificationCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// 用户注册
export const register = asyncHandler(async (req: Request, res: Response) => {
  const {
    username,
    email,
    password,
    studentId,
    realName,
    major,
    className,
    qqNumber,
    phone
  } = req.body;

  // 检查用户是否已存在
  const existingUser = await User.findOne({
    $or: [{ email }, { username }, { studentId }]
  });

  if (existingUser) {
    let message = '用户已存在';
    if (existingUser.email === email) message = '邮箱已被注册';
    if (existingUser.username === username) message = '用户名已被使用';
    if (existingUser.studentId === studentId) message = '学号已被注册';
    
    return res.status(400).json({
      success: false,
      message
    });
  }

  // 创建新用户
  const user = new User({
    username,
    email,
    password,
    studentId,
    realName,
    major,
    className,
    qqNumber,
    phone
  });

  await user.save();

  // 生成邮箱验证码
  const verificationCode = generateVerificationCode();
  await cacheService.set(
    `email_verification:${user._id}`,
    verificationCode,
    900 // 15分钟过期
  );

  // 发送验证邮件
  try {
    await sendVerificationEmail(email, username, verificationCode);
  } catch (error) {
    console.error('发送验证邮件失败:', error);
  }

  // 生成token
  const token = generateToken(user._id.toString());

  res.status(201).json({
    success: true,
    message: '注册成功，请查收邮箱验证码',
    data: {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        studentId: user.studentId,
        realName: user.realName,
        major: user.major,
        className: user.className,
        isStudentVerified: user.isStudentVerified,
        isBlueCardMember: user.isBlueCardMember,
        role: user.role,
        preferences: user.preferences,
        stats: user.stats
      }
    }
  });
});

// 用户登录
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 查找用户并包含密码字段
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: '邮箱或密码错误'
    });
  }

  // 检查账户状态
  if (user.status !== 'active') {
    let message = '账户异常';
    if (user.status === 'banned') message = '账户已被封禁';
    if (user.status === 'inactive') message = '账户未激活';
    
    return res.status(401).json({
      success: false,
      message
    });
  }

  // 验证密码
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: '邮箱或密码错误'
    });
  }

  // 更新登录信息
  user.lastLoginAt = new Date();
  user.loginCount += 1;
  await user.save();

  // 生成token
  const token = generateToken(user._id.toString());

  // 缓存用户信息
  await cacheService.set(
    `user_session:${user._id}`,
    {
      userId: user._id,
      username: user.username,
      role: user.role,
      lastActivity: new Date()
    },
    7 * 24 * 3600 // 7天
  );

  res.json({
    success: true,
    message: '登录成功',
    data: {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        studentId: user.studentId,
        realName: user.realName,
        avatar: user.avatar,
        isStudentVerified: user.isStudentVerified,
        isBlueCardMember: user.isBlueCardMember,
        role: user.role,
        preferences: user.preferences,
        stats: user.stats,
        lastLoginAt: user.lastLoginAt
      }
    }
  });
});

// 邮箱验证
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: '需要登录'
    });
  }

  // 检查验证码
  const cachedCode = await cacheService.get(`email_verification:${userId}`);
  
  if (!cachedCode || cachedCode !== code) {
    return res.status(400).json({
      success: false,
      message: '验证码无效或已过期'
    });
  }

  // 更新用户邮箱验证状态
  await User.findByIdAndUpdate(userId, {
    $set: { 'preferences.notifications.email': true }
  });

  // 删除验证码缓存
  await cacheService.del(`email_verification:${userId}`);

  res.json({
    success: true,
    message: '邮箱验证成功'
  });
});

// 学生认证申请
export const applyStudentVerification = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { major, className, qqNumber } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      success: false,
      message: '请上传班级群截图'
    });
  }

  // 检查是否已有待审核的申请
  const existingApplication = await StudentVerification.findOne({
    userId,
    status: 'pending'
  });

  if (existingApplication) {
    return res.status(400).json({
      success: false,
      message: '您已有待审核的认证申请'
    });
  }

  // 上传截图到七牛云
  const screenshotUrl = await uploadToQiniu(file, 'student-verification');

  // 创建认证申请
  const verification = new StudentVerification({
    userId,
    major,
    className,
    qqNumber,
    classGroupScreenshot: screenshotUrl,
    status: 'pending'
  });

  await verification.save();

  res.json({
    success: true,
    message: '学生认证申请提交成功，请等待审核',
    data: {
      id: verification._id,
      status: verification.status,
      submittedAt: verification.submittedAt
    }
  });
});

// 蓝卡会员认证申请
export const applyBlueCardVerification = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { type, unicomNumber, drivingSchoolId } = req.body;
  const file = req.file;

  // 检查用户是否已通过学生认证
  const user = await User.findById(userId);
  if (!user?.isStudentVerified) {
    return res.status(400).json({
      success: false,
      message: '请先完成学生认证'
    });
  }

  if (!file) {
    return res.status(400).json({
      success: false,
      message: '请上传认证材料'
    });
  }

  // 检查是否已有待审核的申请
  const existingApplication = await BlueCardVerification.findOne({
    userId,
    status: 'pending'
  });

  if (existingApplication) {
    return res.status(400).json({
      success: false,
      message: '您已有待审核的蓝卡认证申请'
    });
  }

  // 上传认证文档
  const documentUrl = await uploadToQiniu(file, 'bluecard-verification');

  // 创建认证申请
  const verification = new BlueCardVerification({
    userId,
    type,
    unicomNumber: type === 'unicom_user' ? unicomNumber : undefined,
    drivingSchoolId: type === 'driving_school_student' ? drivingSchoolId : undefined,
    verificationDocument: documentUrl,
    status: 'pending'
  });

  await verification.save();

  res.json({
    success: true,
    message: '蓝卡会员认证申请提交成功，请等待审核',
    data: {
      id: verification._id,
      type: verification.type,
      status: verification.status,
      submittedAt: verification.submittedAt
    }
  });
});

// 忘记密码 - 发送重置链接
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: '用户不存在'
    });
  }

  // 生成重置令牌
  const resetToken = uuidv4();
  await cacheService.set(
    `password_reset:${resetToken}`,
    user._id.toString(),
    1800 // 30分钟过期
  );

  // 发送重置邮件
  try {
    await sendPasswordResetEmail(email, user.username, resetToken);
    
    res.json({
      success: true,
      message: '密码重置链接已发送到您的邮箱'
    });
  } catch (error) {
    console.error('发送重置邮件失败:', error);
    res.status(500).json({
      success: false,
      message: '发送邮件失败，请稍后重试'
    });
  }
});

// 重置密码
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: '令牌和新密码都是必填项'
    });
  }

  // 验证重置令牌
  const userId = await cacheService.get(`password_reset:${token}`);
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: '重置令牌无效或已过期'
    });
  }

  // 更新密码
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: '用户不存在'
    });
  }

  user.password = newPassword;
  await user.save();

  // 删除重置令牌
  await cacheService.del(`password_reset:${token}`);

  res.json({
    success: true,
    message: '密码重置成功'
  });
});

// 退出登录
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (userId) {
    // 删除用户会话缓存
    await cacheService.del(`user_session:${userId}`);
  }

  res.json({
    success: true,
    message: '退出登录成功'
  });
});

// 获取当前用户信息
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: '用户不存在'
    });
  }

  res.json({
    success: true,
    data: {
      id: user._id,
      username: user.username,
      email: user.email,
      studentId: user.studentId,
      realName: user.realName,
      major: user.major,
      className: user.className,
      qqNumber: user.qqNumber,
      phone: user.phone,
      avatar: user.avatar,
      isStudentVerified: user.isStudentVerified,
      isBlueCardMember: user.isBlueCardMember,
      role: user.role,
      status: user.status,
      preferences: user.preferences,
      stats: user.stats,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt
    }
  });
});