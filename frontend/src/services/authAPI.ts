import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  studentId: string;
  realName: string;
  major: string;
  className: string;
  qqNumber: string;
  phone: string;
}

const authAPI = {
  // 登录
  login: (credentials: LoginCredentials) => 
    api.post('/auth/login', credentials),

  // 注册
  register: (userData: RegisterData) => 
    api.post('/auth/register', userData),

  // 获取当前用户信息
  getCurrentUser: () => 
    api.get('/auth/me'),

  // 退出登录
  logout: () => 
    api.post('/auth/logout'),

  // 更新用户资料
  updateProfile: (data: any) => 
    api.put('/users/profile', data),

  // 邮箱验证
  verifyEmail: (code: string) => 
    api.post('/auth/verify-email', { code }),

  // 学生认证申请
  applyStudentVerification: (formData: FormData) => 
    api.post('/auth/student-verification', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // 蓝卡会员认证申请
  applyBlueCardVerification: (formData: FormData) => 
    api.post('/auth/bluecard-verification', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // 忘记密码
  forgotPassword: (email: string) => 
    api.post('/auth/forgot-password', { email }),

  // 重置密码
  resetPassword: (token: string, newPassword: string) => 
    api.post('/auth/reset-password', { token, newPassword }),
};

export default authAPI;