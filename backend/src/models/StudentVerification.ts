import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentVerification extends Document {
  userId: mongoose.Types.ObjectId;
  major: string;
  className: string;
  qqNumber: string;
  classGroupScreenshot: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  rejectReason?: string;
}

const StudentVerificationSchema = new Schema<IStudentVerification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  major: {
    type: String,
    required: true,
    maxlength: 50
  },
  className: {
    type: String,
    required: true,
    maxlength: 50
  },
  qqNumber: {
    type: String,
    required: true,
    match: /^[0-9]{5,12}$/
  },
  classGroupScreenshot: {
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

StudentVerificationSchema.index({ userId: 1 });
StudentVerificationSchema.index({ status: 1 });

export default mongoose.model<IStudentVerification>('StudentVerification', StudentVerificationSchema);