import mongoose, { Document, Schema } from 'mongoose';

export interface IExpressOrder extends Document {
  orderNumber: string;
  customer: mongoose.Types.ObjectId;
  helper?: mongoose.Types.ObjectId;
  type: 'pickup' | 'delivery';
  details: {
    expressCompany: string;
    trackingNumber: string;
    pickupLocation: string;
    deliveryLocation: string;
    recipientInfo: {
      name: string;
      phone: string;
      building: string;
      room: string;
    };
  };
  payment: {
    amount: number;
    method: 'wechat' | 'alipay' | 'cash';
    status: 'pending' | 'paid' | 'refunded';
  };
  timeline: Array<{
    action: string;
    timestamp: Date;
    operator?: mongoose.Types.ObjectId;
    note?: string;
  }>;
  status: 'pending' | 'accepted' | 'picked' | 'delivered' | 'completed' | 'cancelled';
  rating?: {
    score: number;
    comment: string;
    ratedBy: mongoose.Types.ObjectId;
    ratedAt: Date;
  };
  notes: string;
  images: string[];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ExpressOrderSchema = new Schema<IExpressOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  helper: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['pickup', 'delivery'],
    required: true
  },
  details: {
    expressCompany: { type: String, required: true },
    trackingNumber: { type: String, required: true },
    pickupLocation: { type: String, required: true },
    deliveryLocation: { type: String, required: true },
    recipientInfo: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      building: { type: String, required: true },
      room: { type: String, required: true }
    }
  },
  payment: {
    amount: { type: Number, required: true, min: 0 },
    method: { 
      type: String, 
      enum: ['wechat', 'alipay', 'cash'],
      default: 'wechat'
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    }
  },
  timeline: [{
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    operator: { type: Schema.Types.ObjectId, ref: 'User' },
    note: String
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'picked', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  rating: {
    score: { type: Number, min: 1, max: 5 },
    comment: String,
    ratedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    ratedAt: Date
  },
  notes: {
    type: String,
    maxlength: 500
  },
  images: [String],
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// 索引
ExpressOrderSchema.index({ customer: 1, createdAt: -1 });
ExpressOrderSchema.index({ helper: 1, createdAt: -1 });
ExpressOrderSchema.index({ status: 1, createdAt: -1 });
ExpressOrderSchema.index({ expiresAt: 1 });

export default mongoose.model<IExpressOrder>('ExpressOrder', ExpressOrderSchema);