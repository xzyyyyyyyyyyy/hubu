import React, { useState } from 'react';
import { 
  Layout, 
  Menu, 
  Breadcrumb, 
  Avatar, 
  Dropdown, 
  Space, 
  Typography,
  Badge,
  Button,
  Modal,
  message
} from 'antd';
import { 
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  ShopOutlined,
  SearchOutlined,
  TruckOutlined,
  TeamOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  BarChartOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { logout } from '../../../store/slices/authSlice';
import './index.less';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: '/admin/posts',
      icon: <FileTextOutlined />,
      label: '帖子管理',
    },
    {
      key: '/admin/market',
      icon: <ShopOutlined />,
      label: '市场管理',
    },
    {
      key: '/admin/lostfound',
      icon: <SearchOutlined />,
      label: '失物招领',
    },
    {
      key: '/admin/express',
      icon: <TruckOutlined />,
      label: '快递管理',
    },
    {
      key: '/admin/parttime',
      icon: <TeamOutlined />,
      label: '兼职管理',
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: '数据报表',
      children: [
        {
          key: '/admin/reports/overview',
          label: '总览报表',
        },
        {
          key: '/admin/reports/users',
          label: '用户分析',
        },
        {
          key: '/admin/reports/content',
          label: '内容分析',
        },
      ],
    },
    {
      key: '/admin/verification',
      icon: <ExclamationCircleOutlined />,
      label: '认证审核',
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  const getBreadcrumbItems = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbItems = [
      {
        title: '管理后台',
      },
    ];

    const routeMap: { [key: string]: string } = {
      dashboard: '仪表盘',
      users: '用户管理',
      posts: '帖子管理',
      market: '市场管理',
      lostfound: '失物招领',
      express: '快递管理',
      parttime: '兼职管理',
      reports: '数据报表',
      verification: '认证审核',
      settings: '系统设置',
      overview: '总览报表',
      content: '内容分析',
    };

    pathnames.slice(1).forEach((name) => {
      breadcrumbItems.push({
        title: routeMap[name] || name,
      });
    });

    return breadcrumbItems;
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key.startsWith('/')) {
      navigate(key);
    }
  };

  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出管理后台吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        dispatch(logout());
        message.success('已退出登录');
        navigate('/login');
      },
    });
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        navigate('/admin/profile');
        break;
      case 'settings':
        navigate('/admin/settings');
        break;
      case 'logout':
        handleLogout();
        break;
    }
  };

  return (
    <Layout className="admin-layout">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={240}
        className="admin-sider"
      >
        <div className="admin-logo">
          <img src="/logo.png" alt="Logo" />
          {!collapsed && <span>湖大论坛管理</span>}
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="admin-menu"
        />
      </Sider>
      
      <Layout className="admin-main">
        <Header className="admin-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="collapse-btn"
            />
            
            <Breadcrumb items={getBreadcrumbItems()} />
          </div>
          
          <div className="header-right">
            <Space size="middle">
              <Badge count={5} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  className="notification-btn"
                />
              </Badge>
              
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: handleUserMenuClick,
                }}
                placement="bottomRight"
              >
                <div className="user-info">
                  <Avatar 
                    src={user?.avatar} 
                    icon={<UserOutlined />}
                    size="small"
                  />
                  <span className="username">{user?.username}</span>
                </div>
              </Dropdown>
            </Space>
          </div>
        </Header>
        
        <Content className="admin-content">
          <div className="content-wrapper">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;