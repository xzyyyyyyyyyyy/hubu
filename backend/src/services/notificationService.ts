import { Server as SocketIOServer } from 'socket.io';
import Notification from '../models/Notification';
import User from '../models/User';
import { sendNotificationEmail } from './emailService';

let io: SocketIOServer;

export const setSocketIO = (socketServer: SocketIOServer) => {
  io = socketServer;
};

interface NotificationData {
  type: string;
  title: string;
  content: string;
  data?: any;
  priority?: 'low' | 'normal' | 'high';
}

// 发送通知
export const sendNotification = async (
  userId: string,
  notificationData: NotificationData
): Promise<void> => {
  try {
    // 创建通知记录
    const notification = new Notification({
      recipient: userId,
      type: notificationData.type,
      title: notificationData.title,
      content: notificationData.content,
      data: notificationData.data || {},
      priority: notificationData.priority || 'normal'
    });

    await notification.save();

    // 获取用户信息
    const user = await User.findById(userId);
    if (!user) return;

    // 实时推送（Socket.IO）
    if (io && user.preferences.notifications.push) {
      io.to(`user_${userId}`).emit('notification', {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        content: notification.content,
        data: notification.data,
        priority: notification.priority,
        createdAt: notification.createdAt
      });
    }

    // 邮件通知（根据用户设置和通知优先级）
    if (user.preferences.notifications.email && 
        (notificationData.priority === 'high' || notificationData.type === 'system')) {
      await sendNotificationEmail(
        user.email,
        user.username,
        notificationData.title,
        notificationData.content
      );
    }

  } catch (error) {
    console.error('发送通知失败:', error);
  }
};

// 批量发送通知
export const sendBulkNotification = async (
  userIds: string[],
  notificationData: NotificationData
): Promise<void> => {
  const promises = userIds.map(userId => sendNotification(userId, notificationData));
  await Promise.all(promises);
};

// 发送系统公告
export const sendSystemAnnouncement = async (
  notificationData: NotificationData,
  targetUsers?: {
    roles?: string[];
    isStudentVerified?: boolean;
    isBlueCardMember?: boolean;
  }
): Promise<void> => {
  try {
    // 构建查询条件
    const query: any = { status: 'active' };
    
    if (targetUsers?.roles) {
      query.role = { $in: targetUsers.roles };
    }
    
    if (targetUsers?.isStudentVerified !== undefined) {
      query.isStudentVerified = targetUsers.isStudentVerified;
    }
    
    if (targetUsers?.isBlueCardMember !== undefined) {
      query.isBlueCardMember = targetUsers.isBlueCardMember;
    }

    // 获取目标用户
    const users = await User.find(query).select('_id');
    const userIds = users.map(user => user._id.toString());

    // 批量发送
    await sendBulkNotification(userIds, {
      ...notificationData,
      type: 'system',
      priority: 'high'
    });

  } catch (error) {
    console.error('发送系统公告失败:', error);
  }
};

// 标记通知为已读
export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
): Promise<void> => {
  await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true, readAt: new Date() }
  );
};

// 批量标记通知为已读
export const markNotificationsAsRead = async (
  notificationIds: string[],
  userId: string
): Promise<void> => {
  await Notification.updateMany(
    { _id: { $in: notificationIds }, recipient: userId },
    { isRead: true, readAt: new Date() }
  );
};

// 获取用户未读通知数量
export const getUnreadCount = async (userId: string): Promise<number> => {
  return Notification.countDocuments({
    recipient: userId,
    isRead: false
  });
};