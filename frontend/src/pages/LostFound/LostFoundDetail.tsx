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
  Typography,
  Breadcrumb,
  Modal,
  message,
  Descriptions,
  Alert,
  Image,
  Timeline,
  BackTop
} from 'antd';
import { 
  EnvironmentOutlined,
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  EditOutlined,
  CloseOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { 
  fetchLostFoundItemById, 
  contactOwner,
  markAsFound,
  closeLostFoundItem
} from '../../store/slices/lostFoundSlice';
import MainLayout from '../../components/Layout/MainLayout';
import ContactModal from '../../components/ContactModal';
import './LostFoundDetail.less';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const LostFoundDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  
  const { currentItem, loading } = useAppSelector(state => state.lostFound);
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  const autoAction = searchParams.get('action');

  useEffect(() => {
    if (id) {
      dispatch(fetchLostFoundItemById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (autoAction && currentItem && isAuthenticated) {
      handleAutoAction(autoAction);
    }
  }, [autoAction, currentItem, isAuthenticated]);

  const handleAutoAction = (action: string) => {
    switch (action) {
      case 'contact':
        if (canContact()) {
          setContactModalVisible(true);
        }
        break;
      default:
        break;
    }
  };

  if (!currentItem && !loading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Title level={3}>信息不存在或已被删除</Title>
          <Button type="primary" onClick={() => navigate('/lostfound')}>
            返回失物招领
          </Button>
        </div>
      </MainLayout>
    );
  }

  const getTypeConfig = (type: string) => {
    const configs = {
      lost: { color: 'orange', text: '寻物启事', icon: '😢' },
      found: { color: 'green', text: '失物招领', icon: '😊' }
    };
    return configs[type as keyof typeof configs] || { color: 'default', text: type, icon: '📋' };
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      active: { color: 'blue', text: '进行中' },
      claimed: { color: 'green', text: '已认领' },
      closed: { color: 'gray', text: '已关闭' }
    };
    return configs[status as keyof typeof configs] || { color: 'default', text: status };
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      electronics: '📱',
      cards: '🆔',
      accessories: '💍',
      clothing: '👕',
      books: '📚',
      keys: '🔑',
      bags: '🎒',
      sports: '⚽',
      other: '🔧'
    };
    return iconMap[category] || '📋';
  };

  const canContact = () => {
    return currentItem?.status === 'active' && 
           currentItem?.poster.id !== user?.id;
  };

  const canManage = () => {
    return currentItem?.poster.id === user?.id;
  };

  const handleContact = async (contactReason: string) => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }

    try {
      setActionLoading('contact');
      await dispatch(contactOwner({ 
        itemId: id!, 
        reason: contactReason 
      })).unwrap();
      message.success('联系信息已发送！');
      setContactModalVisible(false);
      
      // 重新获取详情以更新联系次数
      dispatch(fetchLostFoundItemById(id!));
    } catch (error) {
      message.error('联系失败，请重试');
    } finally {
      setActionLoading('');
    }
  };

  const handleMarkAsFound = () => {
    Modal.confirm({
      title: '确认找到物品',
      content: '确认已经找到物品并完成交接吗？此操作不可撤销。',
      onOk: async () => {
        try {
          setActionLoading('found');
          await dispatch(markAsFound(id!)).unwrap();
          message.success('状态更新成功！');
          dispatch(fetchLostFoundItemById(id!));
        } catch (error) {
          message.error('更新失败，请重试');
        } finally {
          setActionLoading('');
        }
      }
    });
  };

  const handleCloseItem = () => {
    Modal.confirm({
      title: '确认关闭信息',
      content: '关闭后该信息将不再展示给其他用户，确定要关闭吗？',
      onOk: async () => {
        try {
          setActionLoading('close');
          await dispatch(closeLostFoundItem(id!)).unwrap();
          message.success('信息已关闭');
          dispatch(fetchLostFoundItemById(id!));
        } catch (error) {
          message.error('关闭失败，请重试');
        } finally {
          setActionLoading('');
        }
      }
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleString('zh-CN');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const isPoster = currentItem?.poster.id === user?.id;
  const typeConfig = currentItem ? getTypeConfig(currentItem.type) : { color: 'default', text: '', icon: '' };
  const statusConfig = currentItem ? getStatusConfig(currentItem.status) : { color: 'default', text: '' };

  return (
    <MainLayout>
      <Content className="lostfound-detail-content">
        <div className="lostfound-detail-container">
          {/* 面包屑导航 */}
          <Breadcrumb className="lostfound-breadcrumb">
            <Breadcrumb.Item>
              <Link to="/"><HomeOutlined /> 首页</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/lostfound">失物招领</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to={`/lostfound?type=${currentItem?.type}`}>
                {typeConfig.text}
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{currentItem?.title}</Breadcrumb.Item>
          </Breadcrumb>

          <Row gutter={[24, 24]}>
            {/* 主内容区 */}
            <Col xs={24} lg={16}>
              {/* 物品信息卡片 */}
              <Card className="item-detail-card" loading={loading}>
                {currentItem && (
                  <>
                    {/* 物品头部 */}
                    <div className="item-header">
                      <div className="item-meta">
                        <Space size="middle">
                          <span className="type-icon">{typeConfig.icon}</span>
                          <Tag color={typeConfig.color}>{typeConfig.text}</Tag>
                          <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
                          {currentItem.isUrgent && (
                            <Tag color="red" icon={<ExclamationCircleOutlined />}>
                              紧急
                            </Tag>
                          )}
                        </Space>
                        
                        {canManage() && (
                          <Space>
                            <Button 
                              type="text" 
                              icon={<EditOutlined />}
                              onClick={() => navigate(`/lostfound/${id}/edit`)}
                            >
                              编辑
                            </Button>
                            <Button 
                              type="text" 
                              danger
                              icon={<CloseOutlined />}
                              onClick={handleCloseItem}
                              loading={actionLoading === 'close'}
                            >
                              关闭
                            </Button>
                          </Space>
                        )}
                      </div>

                      <Title level={2} className="item-title">
                        <span className="category-icon">
                          {getCategoryIcon(currentItem.category)}
                        </span>
                        {currentItem.title}
                      </Title>

                      <div className="item-poster-info">
                        <Space size="middle">
                          <Avatar 
                            src={currentItem.poster.avatar} 
                            size={40}
                            icon={<UserOutlined />}
                          />
                          <div className="poster-details">
                            <div className="poster-name">
                              <Space>
                                <span>
                                  {isPoster ? '我' : currentItem.poster.username}
                                </span>
                                {currentItem.poster.isStudentVerified && (
                                  <Tag color="blue" size="small">已认证</Tag>
                                )}
                              </Space>
                            </div>
                            <div className="publish-time">
                              <Space size="small">
                                <CalendarOutlined />
                                <span>发布于 {formatTime(currentItem.createdAt)}</span>
                              </Space>
                            </div>
                          </div>
                        </Space>
                      </div>
                    </div>

                    {/* 状态提醒 */}
                    {currentItem.status === 'claimed' && (
                      <Alert
                        message="该物品已被认领"
                        description="感谢大家的帮助，物品已经找到主人了"
                        type="success"
                        showIcon
                        className="status-alert"
                      />
                    )}

                    {currentItem.status === 'closed' && (
                      <Alert
                        message="该信息已关闭"
                        description="发布者已关闭此信息"
                        type="warning"
                        showIcon
                        className="status-alert"
                      />
                    )}

                    {/* 物品详情 */}
                    <div className="item-details">
                      <Descriptions column={2} className="item-descriptions">
                        <Descriptions.Item label="物品类别" span={1}>
                          <Space>
                            <span>{getCategoryIcon(currentItem.category)}</span>
                            <Text>{currentItem.category}</Text>
                          </Space>
                        </Descriptions.Item>
                        
                        <Descriptions.Item label={currentItem.type === 'lost' ? '丢失时间' : '捡到时间'}>
                          <Space>
                            <CalendarOutlined />
                            <Text>{formatDate(currentItem.lostDate)}</Text>
                          </Space>
                        </Descriptions.Item>
                        
                        <Descriptions.Item label="地点区域">
                          <Space>
                            <EnvironmentOutlined />
                            <Text>{currentItem.location.area}</Text>
                          </Space>
                        </Descriptions.Item>
                        
                        <Descriptions.Item label="具体地点">
                          <Space>
                            <EnvironmentOutlined />
                            <Text>{currentItem.location.specific}</Text>
                          </Space>
                        </Descriptions.Item>
                        
                        {currentItem.reward && currentItem.type === 'lost' && (
                          <Descriptions.Item label="感谢费" span={2}>
                            <Space>
                              <DollarOutlined />
                              <Text strong style={{ color: '#f5222d', fontSize: 16 }}>
                                ¥{currentItem.reward}
                              </Text>
                            </Space>
                          </Descriptions.Item>
                        )}
                      </Descriptions>

                      {/* 详细描述 */}
                      <div className="item-description">
                        <Title level={4}>详细描述</Title>
                        <Paragraph className="description-text">
                          {currentItem.description.split('\n').map((line, index) => (
                            <div key={index}>
                              {line}
                              <br />
                            </div>
                          ))}
                        </Paragraph>
                      </div>

                      {/* 物品图片 */}
                      {currentItem.images && currentItem.images.length > 0 && (
                        <div className="item-images">
                          <Title level={4}>物品图片</Title>
                          <Image.PreviewGroup>
                            <Row gutter={[8, 8]}>
                              {currentItem.images.map((image, index) => (
                                <Col key={index} xs={12} sm={8} md={6}>
                                  <Image
                                    src={image}
                                    alt={`物品图片 ${index + 1}`}
                                    style={{ width: '100%', borderRadius: 6 }}
                                  />
                                </Col>
                              ))}
                            </Row>
                          </Image.PreviewGroup>
                        </div>
                      )}
                    </div>

                    {/* 统计信息 */}
                    <div className="item-stats">
                      <Row gutter={16}>
                        <Col span={12}>
                          <div className="stat-item">
                            <EyeOutlined className="stat-icon" />
                            <div className="stat-content">
                              <div className="stat-number">{currentItem.stats.views}</div>
                              <div className="stat-label">浏览量</div>
                            </div>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div className="stat-item">
                            <PhoneOutlined className="stat-icon" />
                            <div className="stat-content">
                              <div className="stat-number">{currentItem.stats.contacts}</div>
                              <div className="stat-label">联系次数</div>
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
              <div className="item-sidebar">
                {/* 联系卡片 */}
                <Card className="contact-card">
                  {canContact() ? (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button 
                        type="primary" 
                        size="large"
                        block
                        icon={<PhoneOutlined />}
                        loading={actionLoading === 'contact'}
                        onClick={() => setContactModalVisible(true)}
                      >
                        联系{currentItem?.type === 'lost' ? '失主' : '拾到者'}
                      </Button>
                      <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
                        点击后可获取联系方式
                      </Text>
                    </Space>
                  ) : canManage() && currentItem?.status === 'active' ? (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button 
                        type="primary"
                        size="large"
                        block
                        icon={<CheckCircleOutlined />}
                        loading={actionLoading === 'found'}
                        onClick={handleMarkAsFound}
                      >
                        标记为已找到
                      </Button>
                      <Button 
                        block
                        loading={actionLoading === 'close'}
                        onClick={handleCloseItem}
                      >
                        关闭信息
                      </Button>
                    </Space>
                  ) : currentItem?.status === 'claimed' ? (
                    <Alert
                      message="该物品已被认领"
                      type="success"
                      showIcon
                    />
                  ) : currentItem?.status === 'closed' ? (
                    <Alert
                      message="该信息已关闭"
                      type="warning"
                      showIcon
                    />
                  ) : (
                    <Text type="secondary">
                      该信息暂时无法操作
                    </Text>
                  )}
                </Card>

                {/* 发布者信息卡片 */}
                {currentItem && (
                  <Card title="发布者信息" className="poster-card">
                    <div className="poster-info">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div className="poster-basic">
                          <Space>
                            <Avatar 
                              src={currentItem.poster.avatar} 
                              size={48}
                              icon={<UserOutlined />}
                            />
                            <div>
                              <div className="poster-name">
                                <Space>
                                  <Text strong>
                                    {isPoster ? '我' : currentItem.poster.username}
                                  </Text>
                                  {currentItem.poster.isStudentVerified && (
                                    <Tag color="blue" size="small">已认证</Tag>
                                  )}
                                </Space>
                              </div>
                              <Text type="secondary">
                                {currentItem.type === 'lost' ? '失主' : '拾到者'}
                              </Text>
                            </div>
                          </Space>
                        </div>

                        {/* 联系信息（仅在已联系后显示） */}
                        {currentItem.hasContacted && (
                          <div className="contact-info">
                            <div className="contact-header">
                              <Text strong>联系方式</Text>
                            </div>
                            <div className="contact-detail">
                              <Space>
                                <PhoneOutlined />
                                <Text copyable={{ text: currentItem.contactInfo.value }}>
                                  {currentItem.contactInfo.method === 'phone' ? '手机' : 
                                   currentItem.contactInfo.method === 'qq' ? 'QQ' : '微信'}：
                                  {currentItem.contactInfo.value}
                                </Text>
                              </Space>
                            </div>
                          </div>
                        )}
                      </Space>
                    </div>
                  </Card>
                )}

                {/* 温馨提示 */}
                <Card title="温馨提示" className="tips-card">
                  <div className="tips-content">
                    <div className="tip-item">
                      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                      <Text type="secondary">
                        请仔细核对物品特征再联系
                      </Text>
                    </div>
                    
                    <div className="tip-item">
                      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                      <Text type="secondary">
                        见面交接时注意个人安全
                      </Text>
                    </div>
                    
                    <div className="tip-item">
                      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                      <Text type="secondary">
                        如遇可疑情况请及时举报
                      </Text>
                    </div>
                    
                    <div className="tip-item">
                      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                      <Text type="secondary">
                        完成交接后请更新状态
                      </Text>
                    </div>
                  </div>
                </Card>

                {/* 相似物品推荐 */}
                {currentItem && (
                  <Card title="相似物品" className="similar-items-card">
                    <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
                      暂无相似物品
                    </Text>
                  </Card>
                )}
              </div>
            </Col>
          </Row>
        </div>

        {/* 联系弹窗 */}
        <ContactModal
          visible={contactModalVisible}
          onSubmit={handleContact}
          onCancel={() => setContactModalVisible(false)}
          itemInfo={{
            title: currentItem?.title || '',
            type: currentItem?.type || 'lost',
            posterName: currentItem?.poster.username || ''
          }}
        />

        <BackTop />
      </Content>
    </MainLayout>
  );
};

export default LostFoundDetail;