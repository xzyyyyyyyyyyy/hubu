import React, { useState, useEffect } from 'react';
import { Layout, Menu, Badge, Avatar, Dropdown, Space, Button, Input, Modal } from 'antd';
import { 
  HomeOutlined,
  MessageOutlined,
  TeamOutlined,
  ShoppingOutlined,
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';
import { fetchNotifications } from '../../store/slices/notificationSlice';
import ModeSelector from '../ModeSelector';
import SearchModal from '../SearchModal';
import './MainLayout.less';

const { Header, Sider, Content, Footer } = Layout;
const { Search } = Input;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  const { unreadCount } = useAppSelector(state => state.notifications);
  
  const [collapsed, setCollapsed] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [modeVisible, setModeVisible] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, isAuthenticated]);

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/posts',
      icon: <MessageOutlined />,
      label: '湖大论坛',
    },
    {
      key: '/parttime',
      icon: <TeamOutlined />,
      label: '校园兼职',
    },
    {
      key: '/express',
      icon: <ShoppingOutlined />,
      label: '快递代拿',
    },
    {
      key: '/lostfound',
      icon: <SearchOutlined />,
      label: '失物招领',
    },
    {
      key: '/market',
      icon: <ShoppingOutlined />,
      label: '跳蚤市场',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'mode',
      icon: <MenuFoldOutlined />,
      label: '切换模式',
      onClick: () => setModeVisible(true),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        Modal.confirm({
          title: '确认退出',
          content: '确定要退出登录吗？',
          onOk: () => {
            dispatch(logoutUser());
            navigate('/login');
          },
        });
      },
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  return (
    <Layout className="main-layout">
      {/* 侧边栏 */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="main-sider"
        width={240}
        collapsedWidth={80}
      >
        <div className="logo">
          <img src="/logo.png" alt="湖大校园平台" />
          {!collapsed && <span>湖大校园平台</span>}
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="main-menu"
        />
        
        {/* 用户模式指示器 */}
        {!collapsed && user && (
          <div className="mode-indicator">
            <Button 
              type="text" 
              size="small"
              onClick={() => setModeVisible(true)}
              className="mode-button"
            >
              当前：{user.preferences.mode === 'freshman' ? '新生版' : '老生版'}
            </Button>
          </div>
        )}
      </Sider>

      <Layout className="site-layout">
        {/* 头部 */}
        <Header className="main-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="trigger"
            />
          </div>

          <div className="header-center">
            <Search
              placeholder="搜索帖子、活动、用户..."
              allowClear
              onSearch={handleSearch}
              onFocus={() => setSearchVisible(true)}
              style={{ width: 400 }}
              size="middle"
            />
          </div>

          <div className="header-right">
            <Space size="middle">
              {/* 通知 */}
              {isAuthenticated && (
                <Badge count={unreadCount} size="small">
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    onClick={() => navigate('/notifications')}
                    className="notification-button"
                  />
                </Badge>
              )}

              {/* 用户菜单 */}
              {isAuthenticated ? (
                <Dropdown
                  menu={{ items: userMenuItems }}
                  placement="bottomRight"
                  trigger={['click']}
                >
                  <div className="user-info">
                    <Avatar 
                      src={user?.avatar} 
                      icon={<UserOutlined />} 
                      size={32}
                    />
                    <span className="username">{user?.username}</span>
                  </div>
                </Dropdown>
              ) : (
                <Space>
                  <Button onClick={() => navigate('/login')}>登录</Button>
                  <Button type="primary" onClick={() => navigate('/register')}>
                    注册
                  </Button>
                </Space>
              )}
            </Space>
          </div>
        </Header>

        {/* 主内容区 */}
        <Content className="main-content">
          {children}
        </Content>

        {/* 底部 */}
        <Footer className="main-footer">
          <div className="footer-content">
            <div className="footer-links">
              <Space split={<span>|</span>}>
                <a href="/about">关于我们</a>
                <a href="/contact">联系我们</a>
                <a href="/privacy">隐私政策</a>
                <a href="/terms">服务条款</a>
                <a href="/help">帮助中心</a>
              </Space>
            </div>
            <div className="footer-copyright">
              © 2024 湖大校园平台. All rights reserved.
            </div>
          </div>
        </Footer>
      </Layout>

      {/* 搜索弹窗 */}
      <SearchModal 
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
      />

      {/* 模式选择弹窗 */}
      <ModeSelector
        visible={modeVisible}
        onClose={() => setModeVisible(false)}
        currentMode={user?.preferences.mode}
      />
    </Layout>
  );
};

export default MainLayout;