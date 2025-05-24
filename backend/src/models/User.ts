import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  studentId: string;
  realName: string;
  major: string;
  className: string;
  qqNumber: string;
  phone: string;
  avatar?: string;
  isStudentVerified: boolean;
  isBlueCardMember: boolean;
  role: 'student' | 'admin' | 'moderator';
  status: 'active' | 'inactive' | 'banned';
  lastLoginAt?: Date;
  loginCount: number;
  preferences: {
    mode: 'freshman' | 'senior';
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      showRealName: boolean;
      showContact: boolean;
    };
  };
  stats: {
    postsCount: number;
    commentsCount: number;
    likesReceived: number;
    reputation: number;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 20,
    match: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[0-9]{10,12}$/
  },
  realName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  major: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  className: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  qqNumber: {
    type: String,
    required: true,
    trim: true,
    match: /^[0-9]{5,12}$/
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: /^1[3-9]\d{9}$/
  },
  avatar: {
    type: String,
    default: ''
  },
  isStudentVerified: {
    type: Boolean,
    default: false
  },
  isBlueCardMember: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'moderator'],
    default: 'student'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active'
  },
  lastLoginAt: {
    type: Date
  },
  loginCount: {
    type: Number,
    default: 0
  },
  preferences: {
    mode: {
      type: String,
      enum: ['freshman', 'senior'],
      default: 'freshman'
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    privacy: {
      showRealName: { type: Boolean, default: false },
      showContact: { type: Boolean, default: false }
    }
  },
  stats: {
    postsCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    likesReceived: { type: Number, default: 0 },
    reputation: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// 索引
UserSchema.index({ email: 1 });
UserSchema.index({ studentId: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ createdAt: -1 });

// 密码加密中间件
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// 密码比较方法
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// 虚拟字段：隐藏敏感信息
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.model<IUser>('User', UserSchema);