import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';

// 导入配置和中间件
import connectDB from './config/database';
import redisClient from './config/redis';
import { errorHandler, notFound } from './middleware/errorMiddleware';
import { rateLimiter } from './middleware/rateLimitMiddleware';
import { requestLogger } from './middleware/loggerMiddleware';
import socketHandler from './socket/socketHandler';

// 导入路由
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';
import partTimeRoutes from './routes/partTimeRoutes';
import expressRoutes from './routes/expressRoutes';
import lostFoundRoutes from './routes/lostFoundRoutes';
import marketRoutes from './routes/marketRoutes';
import systemRoutes from './routes/systemRoutes';
import uploadRoutes from './routes/uploadRoutes';

// 加载环境变量
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] 
      : ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// 连接数据库
connectDB();

// 连接Redis
redisClient.connect().catch(console.error);

// 全局中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 请求日志和限流
app.use(requestLogger);
app.use('/api/', rateLimiter);

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/parttime', partTimeRoutes);
app.use('/api/express', expressRoutes);
app.use('/api/lostfound', lostFoundRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/upload', uploadRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// WebSocket处理
socketHandler(io);

// 错误处理中间件
app.use(notFound);
app.use(errorHandler);

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app;