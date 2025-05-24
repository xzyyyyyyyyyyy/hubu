import mongoose, { Document, Schema } from 'mongoose';

export interface ILostFound extends Document {
  title: string;
  description: string;
  type: 'lost' | 'found';
  category: string;
  images: string[];
  location: {
    foundAt?: string;
    lostAt?: string;
    currentLocation?: string;
  };
  contact: {
    name: string;
    phone: string;
    wechat?: string;
    qq?: string;
  };
  item: {
    name: string;
    brand?: string;
    color?: string;
    model?: string;
    characteristics: string[];
  };
  timeInfo: {
    lostTime?: Date;
    foundTime?: Date;
  };
  status: 'active' | 'resolved' | 'expired';
  poster: mongoose.Types.ObjectId;
  claimants: Array<{
    user: mongoose.Types.ObjectId;
    description: string;
    proofImages?: string[];
    submittedAt: Date;
    status: 'pending' | 'approved' | 'rejected';
  }>;
  stats: {
    views: number;
    claims: number;
  };
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LostFoundSchema = new Schema<ILostFound>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'electronics', 'documents', 'accessories', 'clothing',
      'books', 'keys', 'cards', 'bags', 'others'
    ]
  },
  images: [String],
  location: {
    foundAt: String,
    lostAt: String,
    currentLocation: String
  },
  contact: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    wechat: String,
    qq: String
  },
  item: {
    name: { type: String, required: true },
    brand: String,
    color: String,
    model: String,
    characteristics: [String]
  },
  timeInfo: {
    lostTime: Date,
    foundTime: Date
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'expired'],
    default: 'active'
  },
  poster: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  claimants: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    description: String,
    proofImages: [String],
    submittedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  stats: {
    views: { type: Number, default: 0 },
    claims: { type: Number, default: 0 }
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

LostFoundSchema.index({ type: 1, status: 1, createdAt: -1 });
LostFoundSchema.index({ category: 1 });
LostFoundSchema.index({ poster: 1 });
LostFoundSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<ILostFound>('LostFound', LostFoundSchema);