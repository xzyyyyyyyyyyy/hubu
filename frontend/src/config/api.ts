// API配置
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',
  UPLOAD_URL: process.env.REACT_APP_UPLOAD_URL || 'http://localhost:8080/upload',
  TIMEOUT: 10000,
};

// 请求拦截器配置
export const REQUEST_CONFIG = {
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
};