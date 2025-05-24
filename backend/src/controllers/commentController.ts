import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Comment, { IComment } from '../models/Comment';
import Post from '../models/Post';
import User from '../models/User';
import Like from '../models/Like';
import { asyncHandler } from '../middleware/errorMiddleware';
import { sendNotification } from '../services/notificationService';

// 创建评论
export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const { content, post, parent, isAnonymous = false } = req.body;
  const userId = req.user?.userId;

  // 验证帖子是否存在
  const postDoc = await Post.findById(post);
  if (!postDoc || postDoc.status !== 'published') {
    return res.status(404).json({
      success: false,
      message: '帖子不存在'
    });
  }

  // 如果是回复评论，验证父评论是否存在
  if (parent) {
    const parentComment = await Comment.findById(parent);
    if (!parentComment || parentComment.post.toString() !== post) {
      return res.status(404).json({
        success: false,
        message: '父评论不存在'
      });
    }
  }

  // 创建评论
  const comment = new Comment({
    content,
    author: userId,
    post,
    parent,
    isAnonymous,
    metadata: {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }
  });

  await comment.save();

  // 更新帖子评论数
  await Post.findByIdAndUpdate(post, {
    $inc: { 'stats.comments': 1 }
  });

  // 更新用户评论统计
  await User.findByIdAndUpdate(userId, {
    $inc: { 'stats.commentsCount': 1 }
  });

  // 如果是回复评论，更新父评论回复数
  if (parent) {
    await Comment.findByIdAndUpdate(parent, {
      $inc: { 'stats.replies': 1 }
    });

    // 向父评论作者发送通知
    const parentComment = await Comment.findById(parent);
    if (parentComment && parentComment.author.toString() !== userId) {
      await sendNotification(parentComment.author.toString(), {
        type: 'comment_reply',
        title: '有人回复了您的评论',
        content: content.substring(0, 100),
        data: { postId: post, commentId: comment._id }
      });
    }
  } else {
    // 向帖子作者发送通知
    if (postDoc.author.toString() !== userId) {
      await sendNotification(postDoc.author.toString(), {
        type: 'post_comment',
        title: '有人评论了您的帖子',
        content: content.substring(0, 100),
        data: { postId: post, commentId: comment._id }
      });
    }
  }

  // 填充作者信息
  await comment.populate('author', 'username avatar role isStudentVerified');

  res.status(201).json({
    success: true,
    message: '评论成功',
    data: comment
  });
});

// 获取评论列表
export const getComments = asyncHandler(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { page = 1, limit = 20, sort = 'latest' } = req.query;
  const userId = req.user?.userId;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({
      success: false,
      message: '帖子ID格式不正确'
    });
  }

  // 构建排序条件
  let sortQuery: any = {};
  switch (sort) {
    case 'latest':
      sortQuery = { createdAt: -1 };
      break;
    case 'oldest':
      sortQuery = { createdAt: 1 };
      break;
    case 'likes':
      sortQuery = { 'stats.likes': -1, createdAt: -1 };
      break;
    default:
      sortQuery = { createdAt: -1 };
  }

  // 获取顶级评论（没有父评论的评论）
  const comments = await Comment.find({
    post: postId,
    parent: null,
    status: 'published'
  })
    .populate('author', 'username avatar role isStudentVerified')
    .sort(sortQuery)
    .skip(skip)
    .limit(limitNum)
    .lean();

  // 获取每个评论的回复数量和最新回复
  const commentIds = comments.map(comment => comment._id);
  const replies = await Comment.find({
    parent: { $in: commentIds },
    status: 'published'
  })
    .populate('author', 'username avatar role isStudentVerified')
    .sort({ createdAt: 1 })
    .lean();

  // 如果用户已登录，获取点赞状态
  let userLikes: any = {};
  if (userId) {
    const allCommentIds = [...commentIds, ...replies.map(r => r._id)];
    const likes = await Like.find({
      user: userId,
      target: { $in: allCommentIds },
      targetType: 'Comment'
    });
    
    likes.forEach(like => {
      userLikes[like.target.toString()] = like.type;
    });
  }

  // 组织回复数据
  const repliesMap: any = {};
  replies.forEach(reply => {
    const parentId = reply.parent!.toString();
    if (!repliesMap[parentId]) {
      repliesMap[parentId] = [];
    }
    repliesMap[parentId].push({
      ...reply,
      userLikeStatus: userLikes[reply._id.toString()] || null
    });
  });

  // 组合评论和回复
  const commentsWithReplies = comments.map(comment => ({
    ...comment,
    replies: repliesMap[comment._id.toString()] || [],
    userLikeStatus: userLikes[comment._id.toString()] || null
  }));

  const total = await Comment.countDocuments({
    post: postId,
    parent: null,
    status: 'published'
  });

  res.json({
    success: true,
    data: {
      comments: commentsWithReplies,
      pagination: {
        current: pageNum,
        pageSize: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  });
});

// 更新评论
export const updateComment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user?.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: '评论ID格式不正确'
    });
  }

  const comment = await Comment.findById(id);

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: '评论不存在'
    });
  }

  // 检查权限
  if (comment.author.toString() !== userId && req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '没有权限编辑此评论'
    });
  }

  // 检查是否可以编辑（创建后15分钟内）
  const now = new Date();
  const createdAt = new Date(comment.createdAt);
  const timeDiff = now.getTime() - createdAt.getTime();
  const canEdit = timeDiff <= 15 * 60 * 1000; // 15分钟

  if (!canEdit && req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '评论发布超过15分钟后无法编辑'
    });
  }

  comment.content = content;
  comment.updatedAt = new Date();
  await comment.save();

  await comment.populate('author', 'username avatar role isStudentVerified');

  res.json({
    success: true,
    message: '评论更新成功',
    data: comment
  });
});

// 删除评论
export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: '评论ID格式不正确'
    });
  }

  const comment = await Comment.findById(id);

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: '评论不存在'
    });
  }

  // 检查权限
  if (comment.author.toString() !== userId && req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '没有权限删除此评论'
    });
  }

  // 软删除
  comment.status = 'deleted';
  await comment.save();

  // 更新帖子评论数
  await Post.findByIdAndUpdate(comment.post, {
    $inc: { 'stats.comments': -1 }
  });

  // 更新用户评论统计
  await User.findByIdAndUpdate(comment.author, {
    $inc: { 'stats.commentsCount': -1 }
  });

  // 如果有父评论，更新父评论回复数
  if (comment.parent) {
    await Comment.findByIdAndUpdate(comment.parent, {
      $inc: { 'stats.replies': -1 }
    });
  }

  res.json({
    success: true,
    message: '评论删除成功'
  });
});

// 点赞/取消点赞评论
export const toggleLikeComment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { type = 'like' } = req.body;
  const userId = req.user?.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: '评论ID格式不正确'
    });
  }

  const comment = await Comment.findById(id);
  if (!comment) {
    return res.status(404).json({
      success: false,
      message: '评论不存在'
    });
  }

  // 查找现有的点赞记录
  const existingLike = await Like.findOne({
    user: userId,
    target: id,
    targetType: 'Comment'
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
      targetType: 'Comment',
      type
    }).save();
    action = type;
    if (type === 'like') {
      likeChange = 1;
    } else {
      dislikeChange = 1;
    }
  }

  // 更新评论统计
  const updateQuery: any = {};
  if (likeChange !== 0) {
    updateQuery['stats.likes'] = likeChange;
  }
  if (dislikeChange !== 0) {
    updateQuery['stats.dislikes'] = dislikeChange;
  }

  await Comment.findByIdAndUpdate(id, { $inc: updateQuery });

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