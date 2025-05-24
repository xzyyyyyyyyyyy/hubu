import React, { useEffect, useState } from 'react';
import { 
  Layout, 
  Card, 
  Row, 
  Col, 
  Avatar, 
  Typography, 
  Space, 
  Tag, 
  Button,
  Tabs,
  Statistic,
  Progress,
  List,
  Empty,
  Divider,
  Modal,
  message,
  Tooltip
} from 'antd';
import { 
  UserOutlined,
  EditOutlined,
  SettingOutlined,
  TrophyOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  BookOutlined,
  StarOutlined,
  FireOutlined,
  MessageOutlined,
  LikeOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CrownOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { updateUserProfile } from '../../store/slices/authSlice';
import { fetchMyPosts, fetchMyComments } from '../../store/slices/postSlice';
import { fetchMyOrders } from '../../store/slices/expressSlice';
import { fetchMyJobs, fetchMyApplications } from '../../store/slices/partTimeSlice';
import MainLayout from '../../components/Layout/MainLayout';
import EditProfileModal from '../../components/EditProfileModal';
import VerificationCenter from '../../components/VerificationCenter';
import AvatarUpload from '../../components/AvatarUpload';
import ActivityTimeline from '../../components/ActivityTimeline';
import './index.less';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  
  const { user } = useAppSelector(state => state.auth);
  const { myPosts, myComments } = useAppSelector(state => state.posts);
  const { myOrders } = useAppSelector(state => state.express);
  const { myJobs, myApplications } = useAppSelector(state => state.partTime);
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  useEffect(() => {
    // 根据activeTab获取对应数据
    switch (activeTab) {
      case 'posts':
        dispatch(fetchMyPosts());
        break;
      case 'comments':
        dispatch(fetchMyComments());
        break;
      case 'express':
        dispatch(fetchMyOrders());
        break;
      case 'parttime':
        dispatch(fetchMyJobs());
        dispatch(fetchMyApplications());
        break;
      default:
        break;
    }
  }, [dispatch, activeTab]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const getUserLevel = () => {
    if (!user) return { level: 1, name: '新手', progress: 0 };
    
    const reputation = user.stats.reputation;
    if (reputation >= 1000) return { level: 5, name: '大神', progress: 100 };
    if (reputation >= 500) return { level: 4, name: '专家', progress: (reputation - 500) / 500 * 100 };
    if (reputation >= 200) return { level: 3, name: '活跃', progress: (reputation - 200) / 300 * 100 };
    if (reputation >= 50) return { level: 2, name: '进阶', progress: (reputation - 50) / 150 * 100 };
    return { level: 1, name: '新手', progress: reputation / 50 * 100 };
  };

  const userLevel = getUserLevel();

  const achievements = [
    { id: 1, name: '首次发帖', icon: '📝', unlocked: user?.stats.postsCount > 0 },
    { id: 2, name: '活跃用户', icon: '⚡', unlocked: user?.stats.postsCount >= 10 },
    { id: 3, name: '热心助人', icon: '❤️', unlocked: user?.stats.commentsCount >= 50 },
    { id: 4, name: '人气之星', icon: '⭐', unlocked: user?.stats.likesReceived >= 100 },
    { id: 5, name: '学生认证', icon: '🎓', unlocked: user?.isStudentVerified },
    { id: 6, name: '蓝卡会员', icon: '💎', unlocked: user?.isBlueCardMember },
  ];

  if (!user) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Title level={3}>请先登录</Title>
          <Button type="primary" onClick={() => navigate('/login')}>
            立即登录
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="profile-page">
        <Row gutter={[24, 24]}>
          {/* 左侧个人信息 */}
          <Col xs={24} lg={8}>
            <div className="profile-sidebar">
              {/* 基本信息卡片 */}
              <Card className="profile-basic-card">
                <div className="profile-header">
                  <div className="avatar-section">
                    <Avatar 
                      src={user.avatar} 
                      size={80}
                      icon={<UserOutlined />}
                      className="profile-avatar"
                      onClick={() => setAvatarModalVisible(true)}
                    />
                    <Button 
                      type="text" 
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => setAvatarModalVisible(true)}
                      className="avatar-edit-btn"
                    >
                      更换头像
                    </Button>
                  </div>
                  
                  <div className="profile-info">
                    <div className="username-section">
                      <Title level={4} style={{ margin: 0 }}>
                        {user.username}
                      </Title>
                      <Space>
                        {user.isStudentVerified && (
                          <Tooltip title="已完成学生认证">
                            <Tag color="blue" icon={<CheckCircleOutlined />}>
                              已认证
                            </Tag>
                          </Tooltip>
                        )}
                        {user.isBlueCardMember && (
                          <Tooltip title="蓝卡会员">
                            <Tag color="gold" icon={<CrownOutlined />}>
                              蓝卡会员
                            </Tag>
                          </Tooltip>
                        )}
                      </Space>
                    </div>
                    
                    <div className="user-level">
                      <Space>
                        <Text type="secondary">Lv.{userLevel.level}</Text>
                        <Text strong>{userLevel.name}</Text>
                      </Space>
                      <Progress 
                        percent={userLevel.progress} 
                        size="small" 
                        showInfo={false}
                        strokeColor="#1890ff"
                      />
                    </div>

                    <Button 
                      type="primary" 
                      icon={<EditOutlined />}
                      onClick={() => setEditModalVisible(true)}
                      block
                    >
                      编辑资料
                    </Button>
                  </div>
                </div>

                <Divider />

                {/* 详细信息 */}
                <div className="profile-details">
                  <div className="detail-item">
                    <BookOutlined />
                    <span>{user.major} · {user.className}</span>
                  </div>
                  
                  <div className="detail-item">
                    <CalendarOutlined />
                    <span>加入于 {formatDate(user.createdAt)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <MailOutlined />
                    <span>{user.email}</span>
                  </div>
                  
                  {user.lastLoginAt && (
                    <div className="detail-item">
                      <Text type="secondary">
                        最后登录：{formatDate(user.lastLoginAt)}
                      </Text>
                    </div>
                  )}
                </div>
              </Card>

              {/* 统计数据卡片 */}
              <Card title="📊 数据统计" className="stats-card">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="发帖数"
                      value={user.stats.postsCount}
                      prefix={<MessageOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="评论数"
                      value={user.stats.commentsCount}
                      prefix={<MessageOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="获赞数"
                      value={user.stats.likesReceived}
                      prefix={<LikeOutlined />}
                      valueStyle={{ color: '#fa8c16' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="声望值"
                      value={user.stats.reputation}
                      prefix={<StarOutlined />}
                      valueStyle={{ color: '#eb2f96' }}
                    />
                  </Col>
                </Row>
              </Card>

              {/* 成就系统 */}
              <Card title="🏆 我的成就" className="achievements-card">
                <div className="achievements-grid">
                  {achievements.map(achievement => (
                    <Tooltip 
                      key={achievement.id}
                      title={achievement.unlocked ? `已获得：${achievement.name}` : `未解锁：${achievement.name}`}
                    >
                      <div className={`achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
                        <div className="achievement-icon">
                          {achievement.icon}
                        </div>
                        <div className="achievement-name">
                          {achievement.name}
                        </div>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </Card>
            </div>
          </Col>

          {/* 右侧内容区 */}
          <Col xs={24} lg={16}>
            <Card className="profile-content-card">
              <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                className="profile-tabs"
              >
                {/* 概览 */}
                <TabPane tab="📋 概览" key="overview">
                  <div className="overview-content">
                    {/* 快速操作 */}
                    <Card size="small" title="🚀 快速操作" className="quick-actions-card">
                      <Row gutter={[16, 16]}>
                        <Col xs={12} sm={6}>
                          <Button 
                            type="dashed" 
                            block
                            onClick={() => navigate('/posts/create')}
                          >
                            📝 发布帖子
                          </Button>
                        </Col>
                        <Col xs={12} sm={6}>
                          <Button 
                            type="dashed" 
                            block
                            onClick={() => navigate('/parttime/create')}
                          >
                            💼 发布兼职
                          </Button>
                        </Col>
                        <Col xs={12} sm={6}>
                          <Button 
                            type="dashed" 
                            block
                            onClick={() => navigate('/express')}
                          >
                            📦 快递代拿
                          </Button>
                        </Col>
                        <Col xs={12} sm={6}>
                          <Button 
                            type="dashed" 
                            block
                            onClick={() => navigate('/settings')}
                          >
                            ⚙️ 系统设置
                          </Button>
                        </Col>
                      </Row>
                    </Card>

                    {/* 最近活动 */}
                    <ActivityTimeline userId={user.id} />
                  </div>
                </TabPane>

                {/* 我的帖子 */}
                <TabPane tab="📝 我的帖子" key="posts">
                  <div className="posts-content">
                    {myPosts.length > 0 ? (
                      <List
                        itemLayout="vertical"
                        dataSource={myPosts}
                        renderItem={(post: any) => (
                          <List.Item
                            key={post.id}
                            actions={[
                              <Space key="stats">
                                <span><EyeOutlined /> {post.stats.views}</span>
                                <span><LikeOutlined /> {post.stats.likes}</span>
                                <span><MessageOutlined /> {post.stats.comments}</span>
                              </Space>,
                              <Button 
                                key="edit" 
                                type="link" 
                                size="small"
                                onClick={() => navigate(`/posts/${post.id}/edit`)}
                              >
                                编辑
                              </Button>
                            ]}
                            className="post-list-item"
                            onClick={() => navigate(`/posts/${post.id}`)}
                          >
                            <List.Item.Meta
                              title={
                                <Space>
                                  <Tag color="blue">{post.category}</Tag>
                                  <span className="post-title">{post.title}</span>
                                  {post.isAnonymous && <Tag size="small">匿名</Tag>}
                                </Space>
                              }
                              description={
                                <Space direction="vertical" size="small">
                                  <Text type="secondary" ellipsis>
                                    {post.content.substring(0, 150)}...
                                  </Text>
                                  <Space>
                                    <Text type="secondary">
                                      发布于 {formatDate(post.createdAt)}
                                    </Text>
                                    {post.tags.slice(0, 3).map((tag: string, index: number) => (
                                      <Tag key={index} size="small">{tag}</Tag>
                                    ))}
                                  </Space>
                                </Space>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty 
                        description="还没有发布过帖子"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      >
                        <Button 
                          type="primary" 
                          onClick={() => navigate('/posts/create')}
                        >
                          发布第一个帖子
                        </Button>
                      </Empty>
                    )}
                  </div>
                </TabPane>

                {/* 我的评论 */}
                <TabPane tab="💬 我的评论" key="comments">
                  <div className="comments-content">
                    {myComments.length > 0 ? (
                      <List
                        itemLayout="vertical"
                        dataSource={myComments}
                        renderItem={(comment: any) => (
                          <List.Item
                            key={comment.id}
                            actions={[
                              <Space key="stats">
                                <span><LikeOutlined /> {comment.stats.likes}</span>
                              </Space>,
                              <Button 
                                key="view" 
                                type="link" 
                                size="small"
                                onClick={() => navigate(`/posts/${comment.post.id}`)}
                              >
                                查看原帖
                              </Button>
                            ]}
                            className="comment-list-item"
                          >
                            <List.Item.Meta
                              title={
                                <Space>
                                  <Text>评论了帖子：</Text>
                                  <Text strong>{comment.post.title}</Text>
                                </Space>
                              }
                              description={
                                <Space direction="vertical" size="small">
                                  <Paragraph ellipsis={{ rows: 2 }}>
                                    {comment.content}
                                  </Paragraph>
                                  <Text type="secondary">
                                    评论于 {formatDate(comment.createdAt)}
                                  </Text>
                                </Space>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty 
                        description="还没有发表过评论"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                </TabPane>

                {/* 快递订单 */}
                <TabPane tab="📦 快递订单" key="express">
                  <div className="express-content">
                    {myOrders.length > 0 ? (
                      <List
                        itemLayout="horizontal"
                        dataSource={myOrders}
                        renderItem={(order: any) => (
                          <List.Item
                            key={order.id}
                            actions={[
                              <Button 
                                key="view" 
                                type="link" 
                                onClick={() => navigate(`/express/${order.id}`)}
                              >
                                查看详情
                              </Button>
                            ]}
                            className="order-list-item"
                          >
                            <List.Item.Meta
                              title={
                                <Space>
                                  <Tag color={order.type === 'pickup' ? 'blue' : 'green'}>
                                    {order.type === 'pickup' ? '代取' : '代送'}
                                  </Tag>
                                  <Text>{order.details.expressCompany}</Text>
                                  <Text code>{order.details.trackingNumber}</Text>
                                  <Tag color={
                                    order.status === 'completed' ? 'green' :
                                    order.status === 'cancelled' ? 'red' : 'orange'
                                  }>
                                    {order.status}
                                  </Tag>
                                </Space>
                              }
                              description={
                                <Space direction="vertical" size="small">
                                  <Text type="secondary">
                                    {order.details.pickupLocation} → {order.details.deliveryLocation}
                                  </Text>
                                  <Space>
                                    <Text type="secondary">
                                      ¥{order.payment.amount}
                                    </Text>
                                    <Text type="secondary">
                                      {formatDate(order.createdAt)}
                                    </Text>
                                  </Space>
                                </Space>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty 
                        description="还没有快递订单"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      >
                        <Button 
                          type="primary" 
                          onClick={() => navigate('/express')}
                        >
                          发布订单
                        </Button>
                      </Empty>
                    )}
                  </div>
                </TabPane>

                {/* 兼职信息 */}
                <TabPane tab="💼 兼职信息" key="parttime">
                  <div className="parttime-content">
                    <Tabs defaultActiveKey="published" size="small">
                      <TabPane tab="发布的兼职" key="published">
                        {myJobs.length > 0 ? (
                          <List
                            itemLayout="horizontal"
                            dataSource={myJobs}
                            renderItem={(job: any) => (
                              <List.Item
                                key={job.id}
                                actions={[
                                  <Button 
                                    key="manage" 
                                    type="link"
                                    onClick={() => navigate(`/parttime/${job.id}/manage`)}
                                  >
                                    管理
                                  </Button>
                                ]}
                              >
                                <List.Item.Meta
                                  title={
                                    <Space>
                                      <Text strong>{job.title}</Text>
                                      <Tag color={job.status === 'active' ? 'green' : 'default'}>
                                        {job.status}
                                      </Tag>
                                    </Space>
                                  }
                                  description={
                                    <Space direction="vertical" size="small">
                                      <Text type="secondary">{job.company}</Text>
                                      <Space>
                                        <Text type="secondary">¥{job.salary.amount}/{job.salary.unit}</Text>
                                        <Text type="secondary">{job.stats.applications} 人申请</Text>
                                        <Text type="secondary">{formatDate(job.createdAt)}</Text>
                                      </Space>
                                    </Space>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        ) : (
                          <Empty description="还没有发布兼职" />
                        )}
                      </TabPane>
                      
                      <TabPane tab="申请的兼职" key="applied">
                        {myApplications.length > 0 ? (
                          <List
                            itemLayout="horizontal"
                            dataSource={myApplications}
                            renderItem={(application: any) => (
                              <List.Item key={application.id}>
                                <List.Item.Meta
                                  title={
                                    <Space>
                                      <Text strong>{application.job.title}</Text>
                                      <Tag color={
                                        application.status === 'accepted' ? 'green' :
                                        application.status === 'rejected' ? 'red' : 'orange'
                                      }>
                                        {application.status}
                                      </Tag>
                                    </Space>
                                  }
                                  description={
                                    <Space direction="vertical" size="small">
                                      <Text type="secondary">{application.job.company}</Text>
                                      <Text type="secondary">
                                        申请于 {formatDate(application.appliedAt)}
                                      </Text>
                                    </Space>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        ) : (
                          <Empty description="还没有申请兼职" />
                        )}
                      </TabPane>
                    </Tabs>
                  </div>
                </TabPane>

                {/* 认证中心 */}
                <TabPane tab="🎓 认证中心" key="verification">
                  <VerificationCenter />
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>

        {/* 编辑资料弹窗 */}
        <EditProfileModal
          visible={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          onSuccess={() => {
            setEditModalVisible(false);
            message.success('资料更新成功');
          }}
          initialValues={user}
        />

        {/* 头像上传弹窗 */}
        <AvatarUpload
          visible={avatarModalVisible}
          onCancel={() => setAvatarModalVisible(false)}
          onSuccess={(avatarUrl) => {
            setAvatarModalVisible(false);
            dispatch(updateUserProfile({ avatar: avatarUrl }));
            message.success('头像更新成功');
          }}
          currentAvatar={user.avatar}
        />
      </div>
    </MainLayout>
  );
};

export default Profile;