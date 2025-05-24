export interface User {
  id: string;
  username: string;
  email: string;
  studentId: string;
  realName: string;
  major: string;
  className: string;
  qqNumber: string;
  phone: string;
  isStudentVerified: boolean;
  isBlueCardMember: boolean;
  avatar?: string;
  role: 'student' | 'admin' | 'moderator';
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentVerification {
  id: string;
  userId: string;
  major: string;
  className: string;
  qqNumber: string;
  classGroupScreenshot: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectReason?: string;
}

export interface BlueCardVerification {
  id: string;
  userId: string;
  type: 'unicom_user' | 'driving_school_student';
  unicomNumber?: string;
  drivingSchoolId?: string;
  verificationDocument: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectReason?: string;
}