import React, { useState } from 'react';
import { 
  Modal, 
  Descriptions, 
  Avatar, 
  Tag, 
  Space, 
  Button, 
  Tabs, 
  Table,
  List,
  Typography,
  Statistic,
  Row,
  Col,
  Card,
  Timeline,
  Progress
} from 'antd';
import { 
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  TrophyOutlined,
  FileTextOutlined,
  MessageOutlined,
  LikeOutlined,
  EyeOutlined
} from '@ant-design/icons';
import './index.less';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

interface UserDetailModalProps {
  visible: boolean;
  user: any;
  onCancel: () => void;
  onUpdate: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  visible,
  user,
  onCancel,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState('basic');

  if (!user) return null;

  // 计算用户等级
  const getUserLevel = () => {
    const reputation = user.stats?.reputation || 0;
    if (reputation >= 1000) return { level: 5, name: '大神', progress: 100 };
    if (reputation >= 500) return { level: 4, name: '专家', progress: (reputation - 500) / 500 * 100 };
    if (reputation >= 200) return { level: 3, name: '活跃', progress: (reputation - 200) / 300 * 100 };
    if (reputation >= 50) return { level: 2, name: '进阶', progress: (reputation - 50) / 150 * 100 };
    return { level: 1, name: '新手', progress: reputation / 50 * 100 };
  };

  const userLevel = getUserLevel();

  // 最近帖子列
  const recentPostsColumns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <Text ellipsis={{ tooltip: text }}>{text}</Text>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status === 'published' ? '已发布' : '审核中'}
        </Tag>
      ),
    },
    {
      title: '发布时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
  ];

  // 活动记录
  const activityData = [
    {
      time: '2025-05-24 08:00:00',
      action: '发布了新帖子',
      content: '校园生活分享：今天的食堂新菜品真不错',
      type: 'post'
    },
    {
      time: '2025-05-23 15:20:00',
      action: '评论了帖子',
      content: '在"期末考试复习攻略"下发表了评论',
      type: 'comment'
    },
    {
      time: '2025-05-22 09:15:00',
      action: '发布了快递代拿订单',
      content: '申通快递代取，地点：东门快递点',
      type: 'express'
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <Avatar src={user.avatar} icon={<UserOutlined />} />
          <span>{user.username} 的详细信息</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          关闭
        </Button>,
        <Button key="update" type="primary" onClick={onUpdate}>
          刷新数据
        </Button>,
      ]}
      width={900}
      className="user-detail-modal"
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* 基本信息 */}
        <TabPane tab="基本信息" key="basic">
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="用户名">{user.username}</Descriptions.Item>
                <Descriptions.Item label="真实姓名">{user.realName}</Descriptions.Item>
                <Descriptions.Item label="邮箱">{user.email}</Descriptions.Item>
                <Descriptions.Item label="手机号">{user.phone}</Descriptions.Item>
                <Descriptions.Item label="学号">{user.studentId}</Descriptions.Item>
                <Descriptions.Item label="QQ号">{user.qqNumber}</Descriptions.Item>
                <Descriptions.Item label="专业">{user.major}</Descriptions.Item>
                <Descriptions.Item label="班级">{user.className}</Descriptions.Item>
                <Descriptions.Item label="注册时间" span={2}>
                  {new Date(user.createdAt).toLocaleString('zh-CN')}
                </Descriptions.Item>
                <Descriptions.Item label="最后登录" span={2}>
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('zh-CN') : '从未'}
                </Descriptions.Item>
                <Descriptions.Item label="个人简介" span={2}>
                  {user.bio || '暂无简介'}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            
            <Col span={8}>
              <Card size="small" title="认证状态">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>学生认证：</Text>
                    {user.isStudentVerified ? (
                      <Tag color="green">已认证</Tag>
                    ) : (
                      <Tag color="default">未认证</Tag>
                    )}
                  </div>
                  
                  <div>
                    <Text strong>蓝卡会员：</Text>
                    {user.isBlueCardMember ? (
                      <Tag color="blue">是</Tag>
                    ) : (
                      <Tag color="default">否</Tag>
                    )}
                  </div>
                  
                  <div>
                    <Text strong>账号状态：</Text>
                    <Tag color={user.status === 'active' ? 'green' : 'red'}>
                      {user.status === 'active' ? '正常' : '禁用'}
                    </Tag>
                  </div>
                </Space>
              </Card>
              
              <Card size="small" title="用户等级" style={{ marginTop: 16 }}>
                <div className="user-level-info">
                  <div className="level-display">
                    <Text strong>Lv.{userLevel.level} {userLevel.name}</Text>
                  </div>
                  <Progress 
                    percent={userLevel.progress} 
                    size="small" 
                    showInfo={false}
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    声望值：{user.stats?.reputation || 0}
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* 数据统计 */}
        <TabPane tab="数据统计" key="stats">
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="发帖数"
                  value={user.stats?.postsCount || 0}
                  prefix={<FileTextOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="评论数"
                  value={user.stats?.commentsCount || 0}
                  prefix={<MessageOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="获赞数"
                  value={user.stats?.likesReceived || 0}
                  prefix={<LikeOutlined />}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="声望值"
                  value={user.stats?.reputation || 0}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={12}>
              <Card title="最近发布的帖子" size="small">
                <Table
                  dataSource={user.recentPosts || []}
                  columns={recentPostsColumns}
                  pagination={false}
                  size="small"
                  scroll={{ y: 300 }}
                />
              </Card>
            </Col>
            
            <Col span={12}>
              <Card title="活跃度分析" size="small">
                <div className="activity-chart">
                  <Text type="secondary">近30天活跃度趋势</Text>
                  {/* 这里可以添加图表组件 */}
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text type="secondary">活跃度图表</Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* 活动记录 */}
        <TabPane tab="活动记录" key="activity">
          <Card title="最近活动" size="small">
            <Timeline>
              {activityData.map((activity, index) => (
                <Timeline.Item key={index}>
                  <div className="activity-item">
                    <div className="activity-header">
                      <Text strong>{activity.action}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {activity.time}
                      </Text>
                    </div>
                    <div className="activity-content">
                      <Text type="secondary">{activity.content}</Text>
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </TabPane>

        {/* 违规记录 */}
        <TabPane tab="违规记录" key="violations">
          <Card title="违规记录" size="small">
            {user.violations && user.violations.length > 0 ? (
              <List
                dataSource={user.violations}
                renderItem={(item: any) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Tag color="red">{item.type}</Tag>
                          <span>{item.reason}</span>
                        </Space>
                      }
                      description={`处理时间：${new Date(item.createdAt).toLocaleString('zh-CN')}`}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Text type="secondary">暂无违规记录</Text>
              </div>
            )}
          </Card>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default UserDetailModal;