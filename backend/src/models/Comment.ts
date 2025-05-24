import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  parent?: mongoose.Types.ObjectId;
  isAnonymous: boolean;
  status: 'published' | 'deleted' | 'hidden';
  stats: {
    likes: number;
    dislikes: number;
    replies: number;
  };
  metadata: {
    ip?: string;
    userAgent?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['published', 'deleted', 'hidden'],
    default: 'published'
  },
  stats: {
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    replies: { type: Number, default: 0 }
  },
  metadata: {
    ip: String,
    userAgent: String
  }
}, {
  timestamps: true
});

// 索引
CommentSchema.index({ post: 1, createdAt: -1 });
CommentSchema.index({ author: 1 });
CommentSchema.index({ parent: 1 });

export default mongoose.model<IComment>('Comment', CommentSchema);