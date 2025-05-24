import mongoose, { Document, Schema } from 'mongoose';

export interface IPartTimeJob extends Document {
  title: string;
  description: string;
  company: string;
  contact: {
    name: string;
    phone: string;
    wechat?: string;
    qq?: string;
  };
  location: {
    address: string;
    coordinates?: [number, number]; // [longitude, latitude]
  };
  salary: {
    type: 'hourly' | 'daily' | 'monthly' | 'piece';
    amount: number;
    unit: string;
  };
  requirements: string[];
  workTime: {
    schedule: string;
    duration: string;
    isFlexible: boolean;
  };
  category: string;
  tags: string[];
  isUrgent: boolean;
  status: 'active' | 'paused' | 'closed' | 'expired';
  poster: mongoose.Types.ObjectId;
  applicants: mongoose.Types.ObjectId[];
  stats: {
    views: number;
    applications: number;
  };
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PartTimeJobSchema = new Schema<IPartTimeJob>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  company: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  contact: {
    name: { type: String, required: true, maxlength: 20 },
    phone: { type: String, required: true, match: /^1[3-9]\d{9}$/ },
    wechat: { type: String, maxlength: 50 },
    qq: { type: String, match: /^[0-9]{5,12}$/ }
  },
  location: {
    address: { type: String, required: true, maxlength: 200 },
    coordinates: [Number]
  },
  salary: {
    type: { 
      type: String, 
      enum: ['hourly', 'daily', 'monthly', 'piece'],
      required: true 
    },
    amount: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, maxlength: 10 }
  },
  requirements: [{
    type: String,
    maxlength: 100
  }],
  workTime: {
    schedule: { type: String, required: true, maxlength: 100 },
    duration: { type: String, required: true, maxlength: 50 },
    isFlexible: { type: Boolean, default: false }
  },
  category: {
    type: String,
    required: true,
    enum: [
      'food', 'retail', 'education', 'promotion', 'delivery',
      'office', 'entertainment', 'tech', 'other'
    ]
  },
  tags: [{
    type: String,
    maxlength: 20
  }],
  isUrgent: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'closed', 'expired'],
    default: 'active'
  },
  poster: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  stats: {
    views: { type: Number, default: 0 },
    applications: { type: Number, default: 0 }
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// 索引
PartTimeJobSchema.index({ category: 1, status: 1 });
PartTimeJobSchema.index({ createdAt: -1 });
PartTimeJobSchema.index({ expiresAt: 1 });
PartTimeJobSchema.index({ 'location.coordinates': '2dsphere' });
PartTimeJobSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<IPartTimeJob>('PartTimeJob', PartTimeJobSchema);