import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { setSocketIO } from '../services/notificationService';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

const socketHandler = (io: SocketIOServer) => {
  setSocketIO(io);

  // 认证中间件
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('认证失败'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('用户不存在'));
      }

      socket.userId = user._id.toString();
      socket.username = user.username;
      next();
    } catch (error) {
      next(new Error('认证失败'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`用户 ${socket.username} 已连接 (ID: ${socket.userId})`);

    // 加入用户专属房间
    if (socket.userId) {
      socket.join(`user_${socket.userId}`);
    }

    // 获取用户在线状态
    socket.on('get_online_users', () => {
      const onlineUsers = Array.from(io.sockets.sockets.values())
        .filter(s => (s as AuthenticatedSocket).userId)
        .map(s => ({
          userId: (s as AuthenticatedSocket).userId,
          username: (s as AuthenticatedSocket).username
        }));
      
      socket.emit('online_users', onlineUsers);
    });

    // 加入帖子讨论房间
    socket.on('join_post', (postId: string) => {
      socket.join(`post_${postId}`);
      console.log(`用户 ${socket.username} 加入帖子 ${postId} 的讨论`);
    });

    // 离开帖子讨论房间
    socket.on('leave_post', (postId: string) => {
      socket.leave(`post_${postId}`);
      console.log(`用户 ${socket.username} 离开帖子 ${postId} 的讨论`);
    });

    // 实时评论
    socket.on('new_comment', (data) => {
      // 广播新评论到帖子房间
      socket.to(`post_${data.postId}`).emit('comment_added', {
        comment: data.comment,
        author: {
          id: socket.userId,
          username: socket.username
        },
        timestamp: new Date()
      });
    });

    // 实时点赞
    socket.on('toggle_like', (data) => {
      socket.to(`post_${data.postId}`).emit('like_updated', {
        targetId: data.targetId,
        targetType: data.targetType,
        action: data.action,
        userId: socket.userId
      });
    });

    // 私聊消息
    socket.on('private_message', (data) => {
      const { recipientId, message } = data;
      
      // 发送给接收者
      io.to(`user_${recipientId}`).emit('private_message', {
        senderId: socket.userId,
        senderUsername: socket.username,
        message,
        timestamp: new Date()
      });
    });

    // 输入状态
    socket.on('typing', (data) => {
      socket.to(`post_${data.postId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.username,
        isTyping: data.isTyping
      });
    });

    // 位置共享（快递代拿等功能）
    socket.on('share_location', (data) => {
      if (data.orderId) {
        socket.to(`order_${data.orderId}`).emit('location_update', {
          userId: socket.userId,
          location: data.location,
          timestamp: new Date()
        });
      }
    });

    // 加入订单房间
    socket.on('join_order', (orderId: string) => {
      socket.join(`order_${orderId}`);
    });

    // 离开订单房间
    socket.on('leave_order', (orderId: string) => {
      socket.leave(`order_${orderId}`);
    });

    // 心跳检测
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // 断开连接
    socket.on('disconnect', (reason) => {
      console.log(`用户 ${socket.username} 已断开连接: ${reason}`);
      
      // 通知其他用户该用户已离线
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        username: socket.username
      });
    });

    // 错误处理
    socket.on('error', (error) => {
      console.error(`Socket错误 (用户: ${socket.username}):`, error);
    });
  });

  // 定期清理无效连接
  setInterval(() => {
    const connectedUsers = Array.from(io.sockets.sockets.values()).length;
    console.log(`当前在线用户数: ${connectedUsers}`);
  }, 30000); // 30秒
};

export default socketHandler;