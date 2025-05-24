import { Request, Response } from 'express';
import mongoose from 'mongoose';
import PartTimeJob, { IPartTimeJob } from '../models/PartTimeJob';
import User from '../models/User';
import { cacheService } from '../config/redis';
import { asyncHandler } from '../middleware/errorMiddleware';
import { sendNotification } from '../services/notificationService';

// 发布兼职
export const createPartTimeJob = asyncHandler(async (req: Request, res: Response) => {
  const {
    title,
    description,
    company,
    contact,
    location,
    salary,
    requirements = [],
    workTime,
    category,
    tags = [],
    isUrgent = false,
    duration = 30 // 默认30天过期
  } = req.body;
  
  const userId = req.user?.userId;

  // 设置过期时间
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + duration);

  const job = new PartTimeJob({
    title,
    description,
    company,
    contact,
    location,
    salary,
    requirements,
    workTime,
    category,
    tags,
    isUrgent,
    poster: userId,
    expiresAt
  });

  await job.save();

  // 填充发布者信息
  await job.populate('poster', 'username avatar isStudentVerified');

  res.status(201).json({
    success: true,
    message: '兼职发布成功',
    data: job
  });
});

// 获取兼职列表
export const getPartTimeJobs = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    category,
    location,
    salaryMin,
    salaryMax,
    sort = 'latest',
    search,
    urgent = false
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // 构建查询条件
  const query: any = { 
    status: 'active',
    expiresAt: { $gt: new Date() }
  };

  if (category) {
    query.category = category;
  }

  if (location) {
    query['location.address'] = { $regex: location, $options: 'i' };
  }

  if (salaryMin || salaryMax) {
    query['salary.amount'] = {};
    if (salaryMin) query['salary.amount'].$gte = parseFloat(salaryMin as string);
    if (salaryMax) query['salary.amount'].$lte = parseFloat(salaryMax as string);
  }

  if (search) {
    query.$text = { $search: search as string };
  }

  if (urgent === 'true') {
    query.isUrgent = true;
  }

  // 构建排序条件
  let sortQuery: any = {};
  switch (sort) {
    case 'latest':
      sortQuery = { isUrgent: -1, createdAt: -1 };
      break;
    case 'salary_high':
      sortQuery = { isUrgent: -1, 'salary.amount': -1 };
      break;
    case 'salary_low':
      sortQuery = { isUrgent: -1, 'salary.amount': 1 };
      break;
    case 'popular':
      sortQuery = { isUrgent: -1, 'stats.applications': -1 };
      break;
    default:
      sortQuery = { isUrgent: -1, createdAt: -1 };
  }

  const jobs = await PartTimeJob.find(query)
    .populate('poster', 'username avatar isStudentVerified')
    .sort(sortQuery)
    .skip(skip)
    .limit(limitNum)
    .lean();

  const total = await PartTimeJob.countDocuments(query);

  res.json({
    success: true,
    data: {
      jobs,
      pagination: {
        current: pageNum,
        pageSize: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  });
});

// 获取兼职详情
export const getPartTimeJobById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: '兼职ID格式不正确'
    });
  }

  const job = await PartTimeJob.findById(id)
    .populate('poster', 'username avatar isStudentVerified contact')
    .populate('applicants', 'username avatar isStudentVerified');

  if (!job || job.status !== 'active') {
    return res.status(404).json({
      success: false,
      message: '兼职不存在或已关闭'
    });
  }

  // 增加浏览量
  await PartTimeJob.findByIdAndUpdate(id, {
    $inc: { 'stats.views': 1 }
  });

  // 检查当前用户是否已申请
  const hasApplied = userId ? job.applicants.some(
    applicant => applicant._id.toString() === userId
  ) : false;

  res.json({
    success: true,
    data: {
      ...job.toObject(),
      hasApplied
    }
  });
});

// 申请兼职
export const applyForJob = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: '兼职ID格式不正确'
    });
  }

  const job = await PartTimeJob.findById(id);

  if (!job || job.status !== 'active') {
    return res.status(404).json({
      success: false,
      message: '兼职不存在或已关闭'
    });
  }

  if (job.expiresAt < new Date()) {
    return res.status(400).json({
      success: false,
      message: '兼职已过期'
    });
  }

  // 检查是否已申请
  if (job.applicants.includes(userId as any)) {
    return res.status(400).json({
      success: false,
      message: '您已申请过此兼职'
    });
  }

  // 添加申请者
  await PartTimeJob.findByIdAndUpdate(id, {
    $push: { applicants: userId },
    $inc: { 'stats.applications': 1 }
  });

  // 向发布者发送通知
  await sendNotification(job.poster.toString(), {
    type: 'job_application',
    title: '有新的兼职申请',
    content: `有用户申请了您发布的兼职：${job.title}`,
    data: { jobId: id }
  });

  res.json({
    success: true,
    message: '申请成功'
  });
});

// 更新兼职状态
export const updateJobStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user?.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: '兼职ID格式不正确'
    });
  }

  const job = await PartTimeJob.findById(id);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: '兼职不存在'
    });
  }

  // 检查权限
  if (job.poster.toString() !== userId && req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '没有权限修改此兼职'
    });
  }

  job.status = status;
  await job.save();

  res.json({
    success: true,
    message: '状态更新成功',
    data: job
  });
});

// 获取我发布的兼职
export const getMyJobs = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { page = 1, limit = 10, status } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const query: any = { poster: userId };
  if (status) {
    query.status = status;
  }

  const jobs = await PartTimeJob.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .populate('applicants', 'username avatar isStudentVerified');

  const total = await PartTimeJob.countDocuments(query);

  res.json({
    success: true,
    data: {
      jobs,
      pagination: {
        current: pageNum,
        pageSize: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  });
});

// 获取我申请的兼职
export const getMyApplications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const jobs = await PartTimeJob.find({ applicants: userId })
    .populate('poster', 'username avatar isStudentVerified')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await PartTimeJob.countDocuments({ applicants: userId });

  res.json({
    success: true,
    data: {
      jobs,
      pagination: {
        current: pageNum,
        pageSize: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  });
});