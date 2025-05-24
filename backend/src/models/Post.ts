import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  category: string;
  tags: string[];
  type: 'post' | 'question' | 'announcement' | 'activity';
  status: 'published' | 'draft' | 'deleted' | 'hidden';
  isAnonymous: boolean;
  isTop: boolean;
  isHot: boolean;
  images: string[];
  attachments: Array<{
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  stats: {
    views: number;
    likes: number;
    dislikes: number;
    comments: number;
    shares: number;
  };
  metadata: {
    ip?: string;
    userAgent?: string;
    location?: string;
  };
  moderationInfo?: {
    isReviewed: boolean;
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
    rejectReason?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'general', 'academic', 'life', 'parttime', 
      'lostfound', 'market', 'dining', 'entertainment',
      'notice', 'question', 'help'
    ]
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  type: {
    type: String,
    enum: ['post', 'question', 'announcement', 'activity'],
    default: 'post'
  },
  status: {
    type: String,
    enum: ['published', 'draft', 'deleted', 'hidden'],
    default: 'published'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isTop: {
    type: Boolean,
    default: false
  },
  isHot: {
    type: Boolean,
    default: false
  },
  images: [{
    type: String
  }],
  attachments: [{
    name: String,
    url: String,
    size: Number,
    type: String
  }],
  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 }
  },
  metadata: {
    ip: String,
    userAgent: String,
    location: String
  },
  moderationInfo: {
    isReviewed: { type: Boolean, default: false },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    rejectReason: String
  }
}, {
  timestamps: true
});

// 索引
PostSchema.index({ author: 1 });
PostSchema.index({ category: 1 });
PostSchema.index({ status: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ 'stats.views': -1 });
PostSchema.index({ 'stats.likes': -1 });
PostSchema.index({ isTop: -1, createdAt: -1 });
PostSchema.index({ title: 'text', content: 'text' });

export default mongoose.model<IPost>('Post', PostSchema);