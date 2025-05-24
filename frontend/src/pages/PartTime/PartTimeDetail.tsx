import React, { useEffect, useState } from 'react';
import { 
  Layout, 
  Card, 
  Row, 
  Col, 
  Button, 
  Space, 
  Tag, 
  Avatar,
  Divider,
  Typography,
  Breadcrumb,
  Modal,
  message,
  List,
  Descriptions,
  Alert,
  Tooltip,
  BackTop
} from 'antd';
import { 
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  WechatOutlined,
  QqOutlined,
  FireOutlined,
  EyeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  BankOutlined
} from '@ant-design/icons';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchPartTimeJobById, applyForJob } from '../../store/slices/partTimeSlice';
import MainLayout from '../../components/Layout/MainLayout';
import ApplicationModal from '../../components/ApplicationModal';
import './PartTimeDetail.less';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const PartTimeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  
  const { currentJob, loading } = useAppSelector(state => state.partTime);
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  
  const [applicationModalVisible, setApplicationModalVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);

  const autoApply = searchParams.get('action') === 'apply';

  useEffect(() => {
    if (id) {
      dispatch(fetchPartTimeJobById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (autoApply && currentJob && isAuthenticated) {
      setApplicationModalVisible(true);
    }
  }, [autoApply, currentJob, isAuthenticated]);

  if (!currentJob && !loading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Title level={3}>兼职信息不存在或已被删除</Title>
          <Button type="primary" onClick={() => navigate('/parttime')}>
            返回兼职列表
          </Button>
        </div>
      </MainLayout>
    );
  }

  const handleApply = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }

    if (!user?.isStudentVerified) {
      message.warning('请先完成学生认证');
      navigate('/profile?tab=verification');
      return;
    }

    setApplicationModalVisible(true);
  };

  const handleApplicationSubmit = async (applicationData: any) => {
    if (id) {
      try {
        await dispatch(applyForJob(id)).unwrap();
        message.success('申请提交成功！');
        setApplicationModalVisible(false);
        setContactVisible(true);
        
        // 重新获取职位信息
        dispatch(fetchPartTimeJobById(id));
      } catch (error) {
        message.error('申请失败，请重试');
      }
    }
  };

  const formatSalary = () => {
    if (!currentJob) return '';
    const { type, amount, unit } = currentJob.salary;
    const typeMap = {
      hourly: '/时',
      daily: '/天',
      monthly: '/月',
      piece: '/件'
    };
    return `${amount}${unit}${typeMap[type]}`;
  };

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleString('zh-CN');
  };

  const isExpired = currentJob && new Date(currentJob.expiresAt) < new Date();
  const hasApplied = currentJob?.hasApplied;
  const isOwner = currentJob?.poster.id === user?.id;

  return (
    <MainLayout>
      <Content className="parttime-detail-content">
        <div className="parttime-detail-container">
          {/* 面包屑导航 */}
          <Breadcrumb className="parttime-breadcrumb">
            <Breadcrumb.Item>
              <Link to="/"><HomeOutlined /> 首页</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/parttime">校园兼职</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to={`/parttime?category=${currentJob?.category}`}>
                {currentJob?.category}
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{currentJob?.title}</Breadcrumb.Item>
          </Breadcrumb>

          <Row gutter={[24, 24]}>
            {/* 主内容区 */}
            <Col xs={24} lg={16}>
              <Card className="job-detail-card" loading={loading}>
                {currentJob && (
                  <>
                    {/* 职位头部信息 */}
                    <div className="job-header">
                      <div className="job-title-section">
                        <Title level={2} className="job-title">
                          {currentJob.title}
                          {currentJob.isUrgent && (
                            <Tag icon={<FireOutlined />} color="red" className="urgent-tag">
                              紧急招聘
                            </Tag>
                          )}
                        </Title>
                        
                        <div className="job-meta">
                          <Space size="large">
                            <div className="salary-display">
                              <DollarOutlined />
                              <Text strong className="salary-text">
                                {formatSalary()}
                              </Text>
                            </div>
                            
                            <div className="location-display">
                              <EnvironmentOutlined />
                              <Text>{currentJob.location.address}</Text>
                            </div>
                            
                            <div className="category-display">
                              <BankOutlined />
                              <Text>{currentJob.category}</Text>
                            </div>
                          </Space>
                        </div>
                      </div>

                      {/* 状态提醒 */}
                      {isExpired && (
                        <Alert
                          message="该职位已过期"
                          type="warning"
                          showIcon
                          className="status-alert"
                        />
                      )}
                      
                      {hasApplied && (
                        <Alert
                          message="您已申请过该职位"
                          type="success"
                          showIcon
                          className="status-alert"
                        />
                      )}
                    </div>

                    <Divider />

                    {/* 职位详情 */}
                    <div className="job-details">
                      <Title level={4}>职位描述</Title>
                      <Paragraph className="job-description">
                        {currentJob.description.split('\n').map((line, index) => (
                          <div key={index}>
                            {line}
                            <br />
                          </div>
                        ))}
                      </Paragraph>

                      {/* 职位信息 */}
                      <Descriptions title="职位信息" column={2} className="job-info-descriptions">
                        <Descriptions.Item label="公司名称" span={2}>
                          <Space>
                            <BankOutlined />
                            <Text strong>{currentJob.company}</Text>
                          </Space>
                        </Descriptions.Item>
                        
                        <Descriptions.Item label="工作时间">
                          <Space direction="vertical" size={0}>
                            <Text>{currentJob.workTime.schedule}</Text>
                            <Text type="secondary">{currentJob.workTime.duration}</Text>
                            {currentJob.workTime.isFlexible && (
                              <Tag size="small" color="green">时间灵活</Tag>
                            )}
                          </Space>
                        </Descriptions.Item>
                        
                        <Descriptions.Item label="薪资待遇">
                          <Text strong className="salary-highlight">
                            {formatSalary()}
                          </Text>
                        </Descriptions.Item>
                        
                        <Descriptions.Item label="工作地点" span={2}>
                          <Space>
                            <EnvironmentOutlined />
                            <Text>{currentJob.location.address}</Text>
                          </Space>
                        </Descriptions.Item>
                        
                        <Descriptions.Item label="发布时间">
                          <Space>
                            <CalendarOutlined />
                            <Text>{formatTime(currentJob.createdAt)}</Text>
                          </Space>
                        </Descriptions.Item>
                        
                        <Descriptions.Item label="截止时间">
                          <Space>
                            <CalendarOutlined />
                            <Text type={isExpired ? 'danger' : 'default'}>
                              {formatTime(currentJob.expiresAt)}
                            </Text>
                          </Space>
                        </Descriptions.Item>
                      </Descriptions>

                      {/* 任职要求 */}
                      {currentJob.requirements.length > 0 && (
                        <div className="job-requirements">
                          <Title level={4}>任职要求</Title>
                          <List
                            size="small"
                            dataSource={currentJob.requirements}
                            renderItem={(item, index) => (
                              <List.Item>
                                <Space>
                                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                  <Text>{item}</Text>
                                </Space>
                              </List.Item>
                            )}
                          />
                        </div>
                      )}

                      {/* 职位标签 */}
                      {currentJob.tags.length > 0 && (
                        <div className="job-tags">
                          <Title level={4}>职位标签</Title>
                          <Space wrap>
                            {currentJob.tags.map((tag, index) => (
                              <Tag key={index} color="blue">
                                {tag}
                              </Tag>
                            ))}
                          </Space>
                        </div>
                      )}
                    </div>

                    <Divider />

                    {/* 统计信息 */}
                    <div className="job-stats">
                      <Row gutter={16}>
                        <Col span={8}>
                          <div className="stat-item">
                            <EyeOutlined className="stat-icon" />
                            <div className="stat-content">
                              <div className="stat-number">{currentJob.stats.views}</div>
                              <div className="stat-label">浏览量</div>
                            </div>
                          </div>
                        </Col>
                        <Col span={8}>
                          <div className="stat-item">
                            <UserOutlined className="stat-icon" />
                            <div className="stat-content">
                              <div className="stat-number">{currentJob.stats.applications}</div>
                              <div className="stat-label">申请人数</div>
                            </div>
                          </div>
                        </Col>
                        <Col span={8}>
                          <div className="stat-item">
                            <CalendarOutlined className="stat-icon" />
                            <div className="stat-content">
                              <div className="stat-number">
                                {Math.ceil((new Date(currentJob.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                              </div>
                              <div className="stat-label">剩余天数</div>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </>
                )}
              </Card>
            </Col>

            {/* 侧边栏 */}
            <Col xs={24} lg={8}>
              <div className="job-sidebar">
                {/* 申请按钮卡片 */}
                <Card className="apply-card">
                  {isOwner ? (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text type="secondary">这是您发布的职位</Text>
                      <Button 
                        block 
                        onClick={() => navigate(`/parttime/${id}/manage`)}
                      >
                        管理职位
                      </Button>
                    </Space>
                  ) : hasApplied ? (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text type="success">
                        <CheckCircleOutlined /> 您已申请过该职位
                      </Text>
                      <Button 
                        block 
                        onClick={() => setContactVisible(true)}
                      >
                        查看联系方式
                      </Button>
                    </Space>
                  ) : isExpired ? (
                    <Button block disabled>
                      职位已过期
                    </Button>
                  ) : (
                    <Button 
                      type="primary" 
                      size="large"
                      block
                      onClick={handleApply}
                    >
                      立即申请
                    </Button>
                  )}
                </Card>

                {/* 发布者信息卡片 */}
                {currentJob && (
                  <Card title="发布者信息" className="poster-card">
                    <div className="poster-info">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div className="poster-basic">
                          <Space>
                            <Avatar 
                              src={currentJob.poster.avatar} 
                              size={48}
                              icon={<UserOutlined />}
                            />
                            <div>
                              <div className="poster-name">
                                <Text strong>{currentJob.poster.username}</Text>
                                {currentJob.poster.isStudentVerified && (
                                  <Tag color="blue" size="small">已认证</Tag>
                                )}
                              </div>
                              <Text type="secondary">招聘负责人</Text>
                            </div>
                          </Space>
                        </div>

                        {/* 联系方式 */}
                        {(hasApplied || contactVisible) && (
                          <div className="contact-info">
                            <Divider />
                            <Title level={5}>联系方式</Title>
                            <Space direction="vertical">
                              <div>
                                <PhoneOutlined /> 
                                <Text copyable={{ text: currentJob.contact.phone }}>
                                  {currentJob.contact.phone}
                                </Text>
                              </div>
                              
                              {currentJob.contact.wechat && (
                                <div>
                                  <WechatOutlined style={{ color: '#07c160' }} />
                                  <Text copyable={{ text: currentJob.contact.wechat }}>
                                    {currentJob.contact.wechat}
                                  </Text>
                                </div>
                              )}
                              
                              {currentJob.contact.qq && (
                                <div>
                                  <QqOutlined style={{ color: '#1890ff' }} />
                                  <Text copyable={{ text: currentJob.contact.qq }}>
                                    {currentJob.contact.qq}
                                  </Text>
                                </div>
                              )}
                            </Space>
                          </div>
                        )}
                      </Space>
                    </div>
                  </Card>
                )}

                {/* 温馨提示 */}
                <Card title="温馨提示" className="tips-card">
                  <List
                    size="small"
                    dataSource={[
                      '请确认工作内容和薪资待遇',
                      '面试时注意个人安全',
                      '谨防网络诈骗和传销',
                      '如遇问题请及时举报'
                    ]}
                    renderItem={(item, index) => (
                      <List.Item>
                        <Space>
                          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                          <Text type="secondary">{item}</Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                </Card>
              </div>
            </Col>
          </Row>
        </div>

        {/* 申请弹窗 */}
        <ApplicationModal
          visible={applicationModalVisible}
          onSubmit={handleApplicationSubmit}
          onCancel={() => setApplicationModalVisible(false)}
          jobTitle={currentJob?.title || ''}
        />

        <BackTop />
      </Content>
    </MainLayout>
  );
};

export default PartTimeDetail;