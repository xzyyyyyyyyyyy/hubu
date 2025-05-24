import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Post, { IPost } from '../models/Post';
import Comment from '../models/Comment';
import User from '../models/User';
import Like from '../models/Like';
import { cacheService } from '../config/redis';
import { asyncHandler } from '../middleware/errorMiddleware';
import { uploadToQiniu } from '../services/uploadService';

// 创建帖子
export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const {
    title,
    content,
    category,
    tags = [],
    type = 'post',
    isAnonymous = false
  } = req.body;
  
  const userId = req.user?.userId;
  const files = req.files as Express.Multer.File[];

  // 处理图片上传
  let images: string[] = [];
  if (files && files.length > 0) {
    const uploadPromises = files.map(file => uploadToQiniu(file, 'posts'));
    images = await Promise.all(uploadPromises);
  }

  // 创建帖子
  const post = new Post({
    title,
    content,
    author: userId,
    category,
    tags,
    type,
    isAnonymous,
    images,
    metadata: {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }
  });

  await post.save();

  // 更新用户发帖统计
  await User.findByIdAndUpdate(userId, {
    $inc: { 'stats.postsCount': 1 }
  });

  // 填充作者信息
  await post.populate('author', 'username avatar role isStudentVerified');

  res.status(201).json({
    success: true,
    message: '发帖成功',
    data: post
  });
});

// 获取帖子列表
export const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    category,
    type,
    sort = 'latest',
    search,
    author
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // 构建查询条件
  const query: any = { status: 'published' };

  if (category) {
    query.category = category;
  }

  if (type) {
    query.type = type;
  }

  if (author) {
    query.author = author;
  }

  if (search) {
    query.$text = { $search: search as string };
  }

  // 构建排序条件
  let sortQuery: any = {};
  switch (sort) {
    case 'latest':
      sortQuery = { isTop: -1, createdAt: -1 };
      break;
    case 'hot':
      sortQuery = { isTop: -1, 'stats.likes': -1, 'stats.views': -1 };
      break;
    case 'views':
      sortQuery = { isTop: -1, 'stats.views': -1 };
      break;
    case 'comments':
      sortQuery = { isTop: -1, 'stats.comments': -1 };
      break;
    default:
      sortQuery = { isTop: -1, createdAt: -1 };
  }

  // 缓存键
  const cacheKey = `posts:${JSON.stringify(query)}:${sort}:${pageNum}:${limitNum}`;
  
  // 尝试从缓存获取
  let cachedPosts = await cacheService.get(cacheKey);
  if (cachedPosts) {
    return res.json({
      success: true,
      data: cachedPosts
    });
  }

  // 查询帖子
  const posts = await Post.find(query)
    .populate('author', 'username avatar role isStudentVerified')
    .sort(sortQuery)
    .skip(skip)
    .limit(limitNum)
    .lean();

  // 获取总数
  const total = await Post.countDocuments(query);

  const result = {
    posts,
    pagination: {
      current: pageNum,
      pageSize: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  };

  // 缓存结果（缓存5分钟）
  await cacheService.set(cacheKey, result, 300);

  res.json({
    success: true,
    data: result
  });
});

// 获取单个帖子详情
export const getPostById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: '帖子ID格式不正确'
    });
  }

  const post = await Post.findById(id)
    .populate('author', 'username avatar role isStudentVerified');

  if (!post || post.status !== 'published') {
    return res.status(404).json({
      success: false,
      message: '帖子不存在'
    });
  }

  // 增加浏览量
  await Post.findByIdAndUpdate(id, {
    $inc: { 'stats.views': 1 }
  });

  // 获取用户对该帖子的点赞状态
  let userLikeStatus = null;
  if (userId) {
    const like = await Like.findOne({
      user: userId,
      target: id,
      targetType: 'Post'
    });
    userLikeStatus = like ? like.type : null;
  }

  res.json({
    success: true,
    data: {
      ...post.toObject(),
      userLikeStatus
    }
  });
});

// 更新帖子
export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const { title, content, category, tags } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: '帖子ID格式不正确'
    });
  }

  const post = await Post.findById(id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: '帖子不存在'
    });
  }

  // 检查权限（只有作者或管理员可以编辑）
  if (post.author.toString() !== userId && req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '没有权限编辑此帖子'
    });
  }

  // 更新帖子
  const updatedPost = await Post.findByIdAndUpdate(
    id,
    {
      title,
      content,
      category,
      tags,
      updatedAt: new Date()
    },
    { new: true }
  ).populate('author', 'username avatar role isStudentVerified');

  // 清除相关缓存
  await cacheService.del(`post:${id}`);

  res.json({
    success: true,
    message: '帖子更新成功',
    data: updatedPost
  });
});

// 删除帖子
export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: '帖子ID格式不正确'
    });
  }

  const post = await Post.findById(id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: '帖子不存在'
    });
  }

  // 检查权限
  if (post.author.toString() !== userId && req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '没有权限删除此帖子'
    });
  }

  // 软删除（更改状态为deleted）
  await Post.findByIdAndUpdate(id, { status: 'deleted' });

  // 更新用户发帖统计
  await User.findByIdAndUpdate(post.author, {
    $inc: { 'stats.postsCount': -1 }
  });

  res.json({
    success: true,
    message: '帖子删除成功'
  });
});

// 点赞/取消点赞帖子
export const toggleLikePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { type = 'like' } = req.body; // like 或 dislike
  const userId = req.user?.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: '帖子ID格式不正确'
    });
  }

  const post = await Post.findById(id);
  if (!post) {
    return res.status(404).json({
      success: false,
      message: '帖子不存在'
    });
  }

  // 查找现有的点赞记录
  const existingLike = await Like.findOne({
    user: userId,
    target: id,
    targetType: 'Post'
  });

  let action = '';
  let likeChange = 0;
  let dislikeChange = 0;

  if (existingLike) {
    if (existingLike.type === type) {
      // 取消点赞/踩
      await Like.findByIdAndDelete(existingLike._id);
      action = `cancel_${type}`;
      if (type === 'like') {
        likeChange = -1;
      } else {
        dislikeChange = -1;
      }
    } else {
      // 切换点赞/踩
      existingLike.type = type as 'like' | 'dislike';
      await existingLike.save();
      action = `switch_to_${type}`;
      if (type === 'like') {
        likeChange = 1;
        dislikeChange = -1;
      } else {
        likeChange = -1;
        dislikeChange = 1;
      }
    }
  } else {
    // 新的点赞/踩
    await new Like({
      user: userId,
      target: id,
      targetType: 'Post',
      type
    }).save();
    action = type;
    if (type === 'like') {
      likeChange = 1;
    } else {
      dislikeChange = 1;
    }
  }

  // 更新帖子统计
  const updateQuery: any = {};
  if (likeChange !== 0) {
    updateQuery['stats.likes'] = likeChange;
  }
  if (dislikeChange !== 0) {
    updateQuery['stats.dislikes'] = dislikeChange;
  }

  await Post.findByIdAndUpdate(id, { $inc: updateQuery });

  // 如果是点赞，增加作者声望
  if (type === 'like' && likeChange > 0) {
    await User.findByIdAndUpdate(post.author, {
      $inc: { 'stats.likesReceived': 1, 'stats.reputation': 1 }
    });
  } else if (type === 'like' && likeChange < 0) {
    await User.findByIdAndUpdate(post.author, {
      $inc: { 'stats.likesReceived': -1, 'stats.reputation': -1 }
    });
  }

  res.json({
    success: true,
    message: '操作成功',
    data: {
      action,
      likeChange,
      dislikeChange
    }
  });
});

// 获取热门帖子
export const getHotPosts = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 10 } = req.query;
  const limitNum = parseInt(limit as string);

  const cacheKey = `hot_posts:${limitNum}`;
  
  // 尝试从缓存获取
  let cachedPosts = await cacheService.get(cacheKey);
  if (cachedPosts) {
    return res.json({
      success: true,
      data: cachedPosts
    });
  }

  // 计算热度分数的聚合查询
  const posts = await Post.aggregate([
    {
      $match: {
        status: 'published',
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // 最近7天
      }
    },
    {
      $addFields: {
        hotScore: {
          $add: [
            { $multiply: ['$stats.likes', 3] },
            { $multiply: ['$stats.comments', 2] },
            '$stats.views'
          ]
        }
      }
    },
    {
      $sort: { hotScore: -1, createdAt: -1 }
    },
    {
      $limit: limitNum
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
        pipeline: [
          { $project: { username: 1, avatar: 1, role: 1, isStudentVerified: 1 } }
        ]
      }
    },
    {
      $unwind: '$author'
    }
  ]);

  // 缓存结果（缓存10分钟）
  await cacheService.set(cacheKey, posts, 600);

  res.json({
    success: true,
    data: posts
  });
});