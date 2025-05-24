import axios from 'axios';
import { API_CONFIG } from '../config/api';
import { mockApi } from './mockApi';

// 判断是否使用Mock数据
const USE_MOCK = process.env.REACT_APP_ENV === 'development' || !process.env.REACT_APP_API_BASE_URL;

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API服务类
class ApiService {
  // 用户相关
  async login(credentials: { email: string; password: string }) {
    if (USE_MOCK) {
      return mockApi.login(credentials);
    }
    return apiClient.post('/auth/login', credentials);
  }

  async register(userData: any) {
    if (USE_MOCK) {
      // Mock注册
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, message: '注册成功' };
    }
    return apiClient.post('/auth/register', userData);
  }

  async getUserProfile() {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        data: {
          id: '1',
          username: 'HNU学生',
          email: 'student@hnu.edu.cn',
          avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
          isStudentVerified: true,
          isBlueCardMember: false
        }
      };
    }
    return apiClient.get('/user/profile');
  }

  // 帖子相关
  async getPosts(params: any) {
    if (USE_MOCK) {
      return mockApi.getPosts(params);
    }
    return apiClient.get('/posts', { params });
  }

  async getPostById(id: string) {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        data: {
          id,
          title: '湖南大学2024年春季学期选课指南',
          content: '新学期选课开始了，为大家整理了一份详细的选课攻略...',
          category: '学习交流',
          tags: ['选课', '攻略', '新学期'],
          author: {
            id: '1',
            username: 'HNU学长',
            avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
            isStudentVerified: true
          },
          stats: { views: 1234, likes: 89, comments: 23 },
          createdAt: '2024-03-15T10:30:00Z',
          images: ['https://picsum.photos/400/300?random=1']
        }
      };
    }
    return apiClient.get(`/posts/${id}`);
  }

  // 快递代拿相关
  async getExpressOrders(params: any) {
    if (USE_MOCK) {
      return mockApi.getExpressOrders(params);
    }
    return apiClient.get('/express', { params });
  }

  // 失物招领相关
  async getLostFoundItems(params: any) {
    if (USE_MOCK) {
      return mockApi.getLostFoundItems(params);
    }
    return apiClient.get('/lostfound', { params });
  }

  // 跳蚤市场相关
  async getMarketItems(params: any) {
    if (USE_MOCK) {
      return mockApi.getMarketItems(params);
    }
    return apiClient.get('/market', { params });
  }
}

export const api = new ApiService();
export default apiClient;