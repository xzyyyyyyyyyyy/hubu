import { Router } from 'express';
import multer from 'multer';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLikePost,
  getHotPosts
} from '../controllers/postController';
import { authenticate, optionalAuth, requireStudentVerification } from '../middleware/authMiddleware';
import { validate, postCreateSchema } from '../middleware/validationMiddleware';
import { postRateLimit } from '../middleware/rateLimitMiddleware';

const router = Router();

// 配置多文件上传
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只能上传图片文件'));
    }
  }
});

// 公开路由
router.get('/', optionalAuth, getPosts);
router.get('/hot', getHotPosts);
router.get('/:id', optionalAuth, getPostById);

// 需要认证的路由
router.post('/', authenticate, requireStudentVerification, postRateLimit, upload.array('images', 9), validate(postCreateSchema), createPost);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);
router.post('/:id/like', authenticate, toggleLikePost);

export default router;