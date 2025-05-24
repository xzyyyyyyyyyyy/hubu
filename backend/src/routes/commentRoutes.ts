import { Router } from 'express';
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  toggleLikeComment
} from '../controllers/commentController';
import { authenticate, requireStudentVerification } from '../middleware/authMiddleware';
import { validate, commentCreateSchema } from '../middleware/validationMiddleware';

const router = Router();

router.get('/post/:postId', getComments);
router.post('/', authenticate, requireStudentVerification, validate(commentCreateSchema), createComment);
router.put('/:id', authenticate, updateComment);
router.delete('/:id', authenticate, deleteComment);
router.post('/:id/like', authenticate, toggleLikeComment);

export default router;