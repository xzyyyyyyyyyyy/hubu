import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { message } from 'antd';
import authAPI from '../../services/authAPI';

export interface User {
  id: string;
  username: string;
  email: string;
  studentId: string;
  realName: string;
  major: string;
  className: string;
  avatar?: string;
  isStudentVerified: boolean;
  isBlueCardMember: boolean;
  role: 'student' | 'admin' | 'moderator';
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
  lastLoginAt?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('token'),
};

// 异步actions
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      localStorage.setItem('token', response.data.token);
      message.success('登录成功');
      return response.data;
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败');
      return rejectWithValue(error.response?.data?.message || '登录失败');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      localStorage.setItem('token', response.data.token);
      message.success('注册成功');
      return response.data;
    } catch (error: any) {
      message.error(error.response?.data?.message || '注册失败');
      return rejectWithValue(error.response?.data?.message || '注册失败');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getCurrentUser();
      return response.data;
    } catch (error: any) {
      localStorage.removeItem('token');
      return rejectWithValue(error.response?.data?.message || '获取用户信息失败');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updateData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateProfile(updateData);
      message.success('资料更新成功');
      return response.data;
    } catch (error: any) {
      message.error(error.response?.data?.message || '更新失败');
      return rejectWithValue(error.response?.data?.message || '更新失败');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      localStorage.removeItem('token');
      message.success('退出登录成功');
    } catch (error: any) {
      localStorage.removeItem('token');
      console.error('退出登录失败:', error);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      // 清除错误状态
    },
    updateUserPreferences: (state, action: PayloadAction<Partial<User['preferences']>>) => {
      if (state.user) {
        state.user.preferences = { ...state.user.preferences, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // 登录
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      
      // 注册
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      
      // 获取当前用户
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      
      // 更新资料
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
      })
      
      // 退出登录
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError, updateUserPreferences } = authSlice.actions;
export default authSlice.reducer;