import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemConfig extends Document {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  category: string;
  isPublic: boolean;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SystemConfigSchema = new Schema<ISystemConfig>({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array'],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 200
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'security', 'notification', 'payment', 'feature']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

SystemConfigSchema.index({ category: 1 });
SystemConfigSchema.index({ key: 1 });

export default mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);