import React, { useEffect, useState } from 'react';
import { Layout, Row, Col, Card, Carousel, Button, Tag, Space, Avatar, Divider } from 'antd';
import { 
  FireOutlined, 
  EyeOutlined, 
  MessageOutlined, 
  LikeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  NotificationOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchHotPosts } from '../../store/slices/postSlice';
import MainLayout from '../../components/Layout/MainLayout';
import AnnouncementModal from '../../components/AnnouncementModal';
import FunctionGrid from '../../components/FunctionGrid';
import DiningSection from '../../components/DiningSection';
import NavigationSection from '../../components/NavigationSection';
import './index.less';

const { Content } = Layout;

interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  actionUrl?: string;
  type: 'activity' | 'announcement' | 'promotion';
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { hotPosts, loading } = useAppSelector(state => state.posts);
  
  const [announcementVisible, setAnnouncementVisible] = useState(false);
  const [banners] = useState<Banner[]>([
    {
      id: '1',
      title: '湖大校园生活节即将开幕',
      description: '精彩活动等你参与，丰富奖品等你来拿！',
      imageUrl: '/images/banners/campus-life-festival.jpg',
      actionUrl: '/activities/campus-life-festival',
      type: 'activity'
    },
    {
      id: '2',
      title: '新学期兼职招聘火热进行中',
      description: '优质兼职岗位，助你勤工俭学',
      imageUrl: '/images/banners/part-time-jobs.jpg',
      actionUrl: '/parttime',
      type: 'promotion'
    },
    {
      id: '3',
      title: '图书馆座位预约系统上线',
      description: '再也不用担心没座位学习了',
      imageUrl: '/images/banners/library-booking.jpg',
      actionUrl: '/library/booking',
      type: 'announcement'
    }
  ]);

  useEffect(() => {
    // 获取热门帖子
    dispatch(fetchHotPosts({ limit: 6 }));
    
    // 检查是否需要显示公告
    const lastAnnouncementTime = localStorage.getItem('lastAnnouncementTime');
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (!lastAnnouncementTime || now - parseInt(lastAnnouncementTime) > oneDay) {
      setAnnouncementVisible(true);
    }
  }, [dispatch]);

  const handleAnnouncementClose = () => {
    setAnnouncementVisible(false);
    localStorage.setItem('lastAnnouncementTime', new Date().getTime().toString());
  };

  const formatTime = (timeStr: string) => {
    const now = new Date();
    const time = new Date(timeStr);
    const diff = now.getTime() - time.getTime();
    
    if (diff < 60 * 1000) return '刚刚';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分钟前`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
  };

  return (
    <MainLayout>
      <Content className="home-content">
        {/* 轮播横幅 */}
        <div className="banner-section">
          <Carousel 
            autoplay 
            dotPosition="bottom"
            effect="fade"
            autoplaySpeed={5000}
          >
            {banners.map((banner) => (
              <div key={banner.id} className="banner-slide">
                <div 
                  className="banner-image"
                  style={{ backgroundImage: `url(${banner.imageUrl})` }}
                >
                  <div className="banner-overlay">
                    <div className="banner-content">
                      <Tag 
                        color={
                          banner.type === 'activity' ? 'orange' :
                          banner.type === 'announcement' ? 'blue' : 'green'
                        }
                        className="banner-tag"
                      >
                        {banner.type === 'activity' ? '活动' :
                         banner.type === 'announcement' ? '公告' : '推广'}
                      </Tag>
                      <h2 className="banner-title">{banner.title}</h2>
                      <p className="banner-description">{banner.description}</p>
                      {banner.actionUrl && (
                        <Button 
                          type="primary" 
                          size="large"
                          onClick={() => navigate(banner.actionUrl!)}
                          className="banner-button"
                        >
                          了解更多
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>

        {/* 问候语和快捷操作 */}
        <div className="welcome-section">
          <Card className="welcome-card">
            <Row justify="space-between" align="middle">
              <Col>
                <Space size="large">
                  <Avatar 
                    src={user?.avatar} 
                    icon={<UserOutlined />} 
                    size={64}
                  />
                  <div>
                    <h3 className="welcome-title">
                      {user ? `你好，${user.username}！` : '欢迎来到湖大校园平台'}
                    </h3>
                    <p className="welcome-subtitle">
                      {user?.preferences.mode === 'freshman' 
                        ? '新生模式 | 专为新同学定制的功能' 
                        : '老生模式 | 体验完整功能'}
                    </p>
                  </div>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<NotificationOutlined />}
                    onClick={() => navigate('/notifications')}
                  >
                    通知中心
                  </Button>
                  <Button 
                    onClick={() => navigate('/posts/create')}
                  >
                    发布帖子
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </div>

        {/* 主要功能区域 */}
        <Row gutter={[24, 24]} className="main-sections">
          {/* 功能导航 */}
          <Col xs={24} lg={8}>
            <FunctionGrid userMode={user?.preferences.mode || 'freshman'} />
          </Col>
          
          {/* 热门帖子 */}
          <Col xs={24} lg={16}>
            <Card 
              title={
                <Space>
                  <FireOutlined style={{ color: '#ff4d4f' }} />
                  热门讨论
                </Space>
              }
              extra={
                <Button type="link" onClick={() => navigate('/posts')}>
                  查看更多
                </Button>
              }
              className="hot-posts-card"
            >
              {loading ? (
                <div className="loading-placeholder">加载中...</div>
              ) : (
                <div className="hot-posts-list">
                  {hotPosts.map((post) => (
                    <div 
                      key={post.id} 
                      className="hot-post-item"
                      onClick={() => navigate(`/posts/${post.id}`)}
                    >
                      <div className="post-header">
                        <Space>
                          <Avatar 
                            src={post.author.avatar} 
                            size={24} 
                            icon={<UserOutlined />}
                          />
                          <span className="author-name">
                            {post.isAnonymous ? '匿名用户' : post.author.username}
                          </span>
                          {post.author.isStudentVerified && (
                            <Tag color="blue" size="small">已认证</Tag>
                          )}
                          <span className="post-time">
                            <ClockCircleOutlined /> {formatTime(post.createdAt)}
                          </span>
                        </Space>
                      </div>
                      <h4 className="post-title">{post.title}</h4>
                      <div className="post-stats">
                        <Space>
                          <span><EyeOutlined /> {post.stats.views}</span>
                          <span><LikeOutlined /> {post.stats.likes}</span>
                          <span><MessageOutlined /> {post.stats.comments}</span>
                        </Space>
                      </div>
                      {post.tags.length > 0 && (
                        <div className="post-tags">
                          {post.tags.slice(0, 3).map((tag, index) => (
                            <Tag key={index} size="small">{tag}</Tag>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* 次要功能区域 */}
        <Row gutter={[24, 24]} className="secondary-sections">
          {/* 餐饮服务 */}
          <Col xs={24} lg={12}>
            <DiningSection />
          </Col>
          
          {/* 校园导航 */}
          <Col xs={24} lg={12}>
            <NavigationSection />
          </Col>
        </Row>

        {/* 公告弹窗 */}
        <AnnouncementModal 
          visible={announcementVisible}
          onClose={handleAnnouncementClose}
        />
      </Content>
    </MainLayout>
  );
};

export default Home;