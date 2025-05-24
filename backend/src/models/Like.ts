import mongoose, { Document, Schema } from 'mongoose';

export interface ILike extends Document {
  user: mongoose.Types.ObjectId;
  target: mongoose.Types.ObjectId;
  targetType: 'Post' | 'Comment';
  type: 'like' | 'dislike';
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  target: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },
  targetType: {
    type: String,
    enum: ['Post', 'Comment'],
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'dislike'],
    required: true
  }
}, {
  timestamps: true
});

// 确保用户对同一目标只能有一个点赞/踩记录
LikeSchema.index({ user: 1, target: 1, targetType: 1 }, { unique: true });
LikeSchema.index({ target: 1, targetType: 1 });

export default mongoose.model<ILike>('Like', LikeSchema);