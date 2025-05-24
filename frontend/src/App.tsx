import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch } from './store/hooks';
import { getCurrentUser } from './store/slices/authSlice';
import SocketProvider from './components/SocketProvider';
import ProtectedRoute from './components/ProtectedRoute';

// 页面组件
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Profile';
import Posts from './pages/Posts';
import PostDetail from './pages/Posts/PostDetail';
import CreatePost from './pages/Posts/CreatePost';
import PartTime from './pages/PartTime';
import PartTimeDetail from './pages/PartTime/PartTimeDetail';
import ExpressOrders from './pages/Express';
import LostFound from './pages/LostFound';
import Market from './pages/Market';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Admin from './pages/Admin';

// 样式
import 'antd/dist/reset.css';
import './App.less';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // 应用启动时获取当前用户信息
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1DA57A',
          colorInfo: '#1DA57A',
          borderRadius: 6,
          wireframe: false,
        },
        components: {
          Layout: {
            headerBg: '#fff',
            headerPadding: '0 24px',
          },
          Menu: {
            horizontalItemSelectedColor: '#1DA57A',
          },
        },
      }}
    >
      <AntdApp>
        <SocketProvider>
          <Router>
            <Routes>
              {/* 公开路由 */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* 需要认证的路由 */}
              <Route path="/" element={<Home />} />
              <Route path="/posts" element={<Posts />} />
              <Route path="/posts/:id" element={<PostDetail />} />
              <Route 
                path="/posts/create" 
                element={
                  <ProtectedRoute requireAuth>
                    <CreatePost />
                  </ProtectedRoute>
                } 
              />
              <Route path="/parttime" element={<PartTime />} />
              <Route path="/parttime/:id" element={<PartTimeDetail />} />
              <Route 
                path="/express" 
                element={
                  <ProtectedRoute requireAuth>
                    <ExpressOrders />
                  </ProtectedRoute>
                } 
              />
              <Route path="/lostfound" element={<LostFound />} />
              <Route path="/market" element={<Market />} />
              
              {/* 需要登录的路由 */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute requireAuth>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute requireAuth>
                    <Notifications />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute requireAuth>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              
              {/* 管理员路由 */}
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute requireAuth requireRole="admin">
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              
              {/* 默认重定向 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </SocketProvider>
      </AntdApp>
    </ConfigProvider>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;