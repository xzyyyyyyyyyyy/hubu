import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import ExpressOrder, { IExpressOrder } from '../models/ExpressOrder';
import User from '../models/User';
import { asyncHandler } from '../middleware/errorMiddleware';
import { sendNotification } from '../services/notificationService';
import { uploadToQiniu } from '../services/uploadService';

// 生成订单号
const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `EXP${timestamp}${random}`;
};

// 创建快递订单
export const createExpressOrder = asyncHandler(async (req: Request, res: Response) => {
  const {
    type,
    details,
    payment,
    notes = '',
    duration = 24 // 默认24小时过期
  } = req.body;
  
  const userId = req.user?.userId;
  const files = req.files as Express.Multer.File[];

  // 处理图片上传
  let images: string[] = [];
  if (files && files.length > 0) {
    const uploadPromises = files.map(file => uploadToQiniu(file, 'express-orders'));
    images = await Promise.all(uploadPromises);
  }

  // 设置过期时间
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + duration);

  const order = new ExpressOrder({
    orderNumber: generateOrderNumber(),
    customer: userId,
    type,
    details,
    payment,
    notes,
    images,
    timeline: [{
      action: '订单创建',
      timestamp: new Date(),
      operator: userId,
      note: '用户创建了快递代拿订单'
    }],
    expiresAt
  });

  await order.save();

  // 填充用户信息
  await order.populate('customer', 'username avatar phone');

  res.status(201).json({
    success: true,
    message: '订单创建成功',
    data: order
  });
});

// 获取快递订单列表
export const getExpressOrders = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    type,
    status,
    location,
    sort = 'latest'
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // 构建查询条件
  const query: any = { 
    status: { $in: ['pending', 'accepted'] },
    expiresAt: { $gt: new Date() }
  };

  if (type) {
    query.type = type;
  }

  if (status) {
    query.status = status;
  }

  if (location) {
    query.$or = [
      { 'details.pickupLocation': { $regex: location, $options: 'i' } },
      { 'details.deliveryLocation': { $regex: location, $options: 'i' } }
    ];
  }

  // 构建排序条件
  let sortQuery: any = {};
  switch (sort) {
    case 'latest':
      sortQuery = { createdAt: -1 };
      break;
    case 'price_high':
      sortQuery = { 'payment.amount': -1 };
      break;
    case 'price_low':
      sortQuery = { 'payment.amount': 1 };
      break;
    case 'expires_soon':
      sortQuery = { expiresAt: 1 };
      break;
    default:
      sortQuery = { createdAt: -1 };
  }

  const orders = await ExpressOrder.find(query)
    .populate('customer', 'username avatar isStudentVerified')
    .populate('helper', 'username avatar isStudentVerified')
    .sort(sortQuery)
    .skip(skip)
    .limit(limitNum)
    .lean();

  const total = await ExpressOrder.countDocuments(query);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        current: pageNum,
        pageSize: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  });
});

// 获取订单详情
export const getExpressOrderById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: '订单ID格式不正确'
    });
  }

  const order = await ExpressOrder.findById(id)
    .populate('customer', 'username avatar phone isStudentVerified')
    .populate('helper', 'username avatar phone isStudentVerified')
    .populate('timeline.operator', 'username');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: '订单不存在'
    });
  }

  // 检查查看权限（订单相关用户或管理员可查看）
  const canView = order.customer._id.toString() === userId ||
                  (order.helper && order.helper._id.toString() === userId) ||
                  req.user?.role === 'admin';

  if (!canView) {
    return res.status(403).json({
      success: false,
      message: '没有权限查看此订单'
    });
  }

  res.json({
    success: true,
    data: order
  });
});

// 接受订单
export const acceptOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: '订单ID格式不正确'
    });
  }

  const order = await ExpressOrder.findById(id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: '订单不存在'
    });
  }

  if (order.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: '订单状态不允许接受'
    });
  }

  if (order.customer.toString() === userId) {
    return res.status(400).json({
      success: false,
      message: '不能接受自己发布的订单'
    });
  }

  if (order.expiresAt < new Date()) {
    return res.status(400).json({
      success: false,
      message: '订单已过期'
    });
  }

  // 更新订单状态
  order.helper = userId as any;
  order.status = 'accepted';
  order.timeline.push({
    action: '订单被接受',
    timestamp: new Date(),
    operator: userId as any,
    note: '代拿员接受了订单'
  });

  await order.save();

  // 向客户发送通知
  await sendNotification(order.customer.toString(), {
    type: 'order_accepted',
    title: '您的快递订单被接受了',
    content: `订单 ${order.orderNumber} 已被代拿员接受`,
    data: { orderId: id }
  });

  await order.populate('helper', 'username avatar phone');

  res.json({
    success: true,
    message: '订单接受成功',
    data: order
  });
});

// 更新订单状态
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note = '' } = req.body;
  const userId = req.user?.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: '订单ID格式不正确'
    });
  }

  const order = await ExpressOrder.findById(id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: '订单不存在'
    });
  }

  // 检查权限
  const canUpdate = order.customer.toString() === userId ||
                    (order.helper && order.helper.toString() === userId) ||
                    req.user?.role === 'admin';

  if (!canUpdate) {
    return res.status(403).json({
      success: false,
      message: '没有权限更新此订单'
    });
  }

  // 验证状态转换的合法性
  const validTransitions: { [key: string]: string[] } = {
    'pending': ['accepted', 'cancelled'],
    'accepted': ['picked', 'cancelled'],
    'picked': ['delivered', 'cancelled'],
    'delivered': ['completed']
  };

  if (!validTransitions[order.status]?.includes(status)) {
    return res.status(400).json({
      success: false,
      message: '无效的状态转换'
    });
  }

  const statusActions: { [key: string]: string } = {
    'picked': '快递已取件',
    'delivered': '快递已送达',
    'completed': '订单完成',
    'cancelled': '订单取消'
  };

  order.status = status;
  order.timeline.push({
    action: statusActions[status] || `状态更新为 ${status}`,
    timestamp: new Date(),
    operator: userId as any,
    note
  });

  await order.save();

  // 发送通知
  const notificationTarget = order.customer.toString() === userId 
    ? order.helper?.toString() 
    : order.customer.toString();

  if (notificationTarget) {
    await sendNotification(notificationTarget, {
      type: 'order_status_update',
      title: '订单状态更新',
      content: `订单 ${order.orderNumber} ${statusActions[status]}`,
      data: { orderId: id }
    });
  }

  res.json({
    success: true,
    message: '状态更新成功',
    data: order
  });
});

// 评价订单
export const rateOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { score, comment } = req.body;
  const userId = req.user?.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: '订单ID格式不正确'
    });
  }

  const order = await ExpressOrder.findById(id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: '订单不存在'
    });
  }

  if (order.status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: '只有已完成的订单才能评价'
    });
  }

  if (order.customer.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: '只有客户可以评价订单'
    });
  }

  if (order.rating) {
    return res.status(400).json({
      success: false,
      message: '该订单已经评价过了'
    });
  }

  order.rating = {
    score,
    comment,
    ratedBy: userId as any,
    ratedAt: new Date()
  };

  await order.save();

  res.json({
    success: true,
    message: '评价成功',
    data: order
  });
});

// 获取我的订单
export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { page = 1, limit = 10, type, status } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const query: any = {
    $or: [
      { customer: userId },
      { helper: userId }
    ]
  };

  if (type) {
    query.type = type;
  }

  if (status) {
    query.status = status;
  }

  const orders = await ExpressOrder.find(query)
    .populate('customer', 'username avatar')
    .populate('helper', 'username avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await ExpressOrder.countDocuments(query);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        current: pageNum,
        pageSize: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  });
});