import mongoose, { Document, Schema } from 'mongoose';

export interface IBlueCardVerification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'unicom_user' | 'driving_school_student';
  unicomNumber?: string;
  drivingSchoolId?: string;
  verificationDocument: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  rejectReason?: string;
}

const BlueCardVerificationSchema = new Schema<IBlueCardVerification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['unicom_user', 'driving_school_student'],
    required: true
  },
  unicomNumber: {
    type: String,
    match: /^1[3-9]\d{9}$/
  },
  drivingSchoolId: String,
  verificationDocument: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectReason: String
});

BlueCardVerificationSchema.index({ userId: 1 });
BlueCardVerificationSchema.index({ status: 1 });

export default mongoose.model<IBlueCardVerification>('BlueCardVerification', BlueCardVerificationSchema);