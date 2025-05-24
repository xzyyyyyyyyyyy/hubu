import { Router } from 'express';
import multer from 'multer';
import {
  register,
  login,
  verifyEmail,
  applyStudentVerification,
  applyBlueCardVerification,
  forgotPassword,
  resetPassword,
  logout,
  getCurrentUser
} from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import { validate, userRegistrationSchema, userLoginSchema } from '../middleware/validationMiddleware';
import { loginRateLimit, registerRateLimit } from '../middleware/rateLimitMiddleware';

const router = Router();

// 配置文件上传
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只能上传图片文件'));
    }
  }
});

// 公开路由
router.post('/register', registerRateLimit, validate(userRegistrationSchema), register);
router.post('/login', loginRateLimit, validate(userLoginSchema), login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// 需要认证的路由
router.post('/verify-email', authenticate, verifyEmail);
router.post('/student-verification', authenticate, upload.single('screenshot'), applyStudentVerification);
router.post('/bluecard-verification', authenticate, upload.single('document'), applyBlueCardVerification);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

export default router;