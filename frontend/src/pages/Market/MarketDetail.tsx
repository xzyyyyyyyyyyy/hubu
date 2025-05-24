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
  Rate,
  Carousel,
  BackTop,
  Divider
} from 'antd';
import { 
  DollarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  PhoneOutlined,
  EyeOutlined,
  HeartOutlined,
  MessageOutlined,
  ShareAltOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  ShopOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { 
  fetchMarketItemById, 
  contactSeller,
  likeMarketItem,
  markAsSold
} from '../../store/slices/marketSlice';
import MainLayout from '../../components/Layout/MainLayout';
import ContactSellerModal from '../../components/ContactSellerModal';
import './MarketDetail.less';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const MarketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  
  const { currentItem, loading } = useAppSelector(state => state.market);
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  const autoAction = searchParams.get('action');

  useEffect(() => {
    if (id) {
      dispatch(fetchMarketItemById(id));
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
          <Title level={3}>商品不存在或已被删除</Title>
          <Button type="primary" onClick={() => navigate('/market')}>
            返回跳蚤市场
          </Button>
        </div>
      </MainLayout>
    );
  }

  const getConditionConfig = (condition: string) => {
    const configs = {
      new: { color: 'green', text: '全新' },
      like_new: { color: 'blue', text: '几乎全新' },
      good: { color: 'orange', text: '成色较好' },
      fair: { color: 'gold', text: '有使用痕迹' },
      poor: { color: 'red', text: '成色一般' }
    };
    return configs[condition as keyof typeof configs] || { color: 'default', text: condition };
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      available: { color: 'green', text: '在售中' },
      sold: { color: 'red', text: '已售出' },
      reserved: { color: 'orange', text: '已预订' },
      deleted: { color: 'gray', text: '已删除' }
    };
    return configs[status as keyof typeof configs] || { color: 'default', text: status };
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      electronics: '📱',
      books: '📚',
      clothing: '👕',
      sports: '⚽',
      daily: '🏠',
      beauty: '💄',
      food: '🍎',
      furniture: '🪑',
      bike: '🚲',
      other: '🔧'
    };
    return iconMap[category] || '📋';
  };

  const canContact = () => {
    return currentItem?.status === 'available' && 
           currentItem?.seller.id !== user?.id;
  };

  const canManage = () => {
    return currentItem?.seller.id === user?.id;
  };

  const handleContact = async (message: string) => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }

    try {
      setActionLoading('contact');
      await dispatch(contactSeller({ 
        itemId: id!, 
        message 
      })).unwrap();
      message.success('联系信息已发送！');
      setContactModalVisible(false);
      
      // 重新获取详情以更新联系次数
      dispatch(fetchMarketItemById(id!));
    } catch (error) {
      message.error('联系失败，请重试');
    } finally {
      setActionLoading('');
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      return;
    }

    try {
      setActionLoading('like');
      await dispatch(likeMarketItem(id!)).unwrap();
      dispatch(fetchMarketItemById(id!));
    } catch (error) {
      message.error('操作失败，请重试');
    } finally {
      setActionLoading('');
    }
  };

  const handleMarkAsSold = () => {
    Modal.confirm({
      title: '确认标记为已售出',
      content: '标记后商品将下架，确定要标记为已售出吗？',
      onOk: async () => {
        try {
          setActionLoading('sold');
          await dispatch(markAsSold(id!)).unwrap();
          message.success('商品已标记为售出');
          dispatch(fetchMarketItemById(id!));
        } catch (error) {
          message.error('操作失败，请重试');
        } finally {
          setActionLoading('');
        }
      }
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleString('zh-CN');
  };

  const getDiscountPercent = () => {
    if (currentItem?.originalPrice && currentItem.originalPrice > currentItem.price) {
      return Math.round((1 - currentItem.price / currentItem.originalPrice) * 100);
    }
    return 0;
  };

  const isSeller = currentItem?.seller.id === user?.id;
  const conditionConfig = currentItem ? getConditionConfig(currentItem.condition) : { color: 'default', text: '' };
  const statusConfig = currentItem ? getStatusConfig(currentItem.status) : { color: 'default', text: '' };
  const discountPercent = getDiscountPercent();

  return (
    <MainLayout>
      <Content className="market-detail-content">
        <div className="market-detail-container">
          {/* 面包屑导航 */}
          <Breadcrumb className="market-breadcrumb">
            <Breadcrumb.Item>
              <Link to="/"><HomeOutlined /> 首页</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/market">跳蚤市场</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to={`/market?category=${currentItem?.category}`}>
                {currentItem?.category}
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{currentItem?.title}</Breadcrumb.Item>
          </Breadcrumb>

          <Row gutter={[24, 24]}>
            {/* 主内容区 */}
            <Col xs={24} lg={16}>
              {/* 商品图片 */}
              <Card className="item-images-card" loading={loading}>
                {currentItem && (
                  <>
                    {currentItem.images && currentItem.images.length > 0 ? (
                      <div className="images-section">
                        <Carousel autoplay dots={{ className: 'custom-dots' }}>
                          {currentItem.images.map((image, index) => (
                            <div key={index} className="image-slide">
                              <Image
                                src={image}
                                alt={`商品图片 ${index + 1}`}
                                style={{ width: '100%', maxHeight: 400, objectFit: 'contain' }}
                              />
                            </div>
                          ))}
                        </Carousel>
                        
                        {/* 缩略图 */}
                        {currentItem.images.length > 1 && (
                          <div className="thumbnail-list">
                            <Row gutter={[8, 8]}>
                              {currentItem.images.map((image, index) => (
                                <Col key={index} span={6}>
                                  <Image
                                    src={image}
                                    alt={`缩略图 ${index + 1}`}
                                    width="100%"
                                    height={60}
                                    style={{ objectFit: 'cover', borderRadius: 4 }}
                                    preview={false}
                                  />
                                </Col>
                              ))}
                            </Row>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="no-images">
                        <ShopOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
                        <div>暂无商品图片</div>
                      </div>
                    )}
                  </>
                )}
              </Card>

              {/* 商品详情 */}
              <Card title="商品详情" className="item-detail-card" loading={loading}>
                {currentItem && (
                  <>
                    <Descriptions column={2} className="item-descriptions">
                      <Descriptions.Item label="商品分类" span={1}>
                        <Space>
                          <span>{getCategoryIcon(currentItem.category)}</span>
                          <Text>{currentItem.category}</Text>
                        </Space>
                      </Descriptions.Item>
                      
                      <Descriptions.Item label="商品成色">
                        <Tag color={conditionConfig.color}>
                          {conditionConfig.text}
                        </Tag>
                      </Descriptions.Item>
                      
                      <Descriptions.Item label="交易地点">
                        <Space>
                          <EnvironmentOutlined />
                          <Text>{currentItem.location}</Text>
                        </Space>
                      </Descriptions.Item>
                      
                      <Descriptions.Item label="发布时间">
                        <Space>
                          <CalendarOutlined />
                          <Text>{formatTime(currentItem.createdAt)}</Text>
                        </Space>
                      </Descriptions.Item>
                      
                      {currentItem.expiresAt && (
                        <Descriptions.Item label="有效期至" span={2}>
                          <Space>
                            <CalendarOutlined />
                            <Text>{formatTime(currentItem.expiresAt)}</Text>
                          </Space>
                        </Descriptions.Item>
                      )}
                    </Descriptions>

                    {/* 商品描述 */}
                    <div className="item-description">
                      <Title level={4}>商品描述</Title>
                      <Paragraph className="description-text">
                        {currentItem.description.split('\n').map((line, index) => (
                          <div key={index}>
                            {line}
                            <br />
                          </div>
                        ))}
                      </Paragraph>
                    </div>

                    {/* 商品标签 */}
                    {currentItem.tags && currentItem.tags.length > 0 && (
                      <div className="item-tags">
                        <Title level={4}>商品标签</Title>
                        <Space wrap>
                          {currentItem.tags.map((tag, index) => (
                            <Tag key={index} color="blue">
                              {tag}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    )}
                  </>
                )}
              </Card>
            </Col>

            {/* 侧边栏 */}
            <Col xs={24} lg={8}>
              <div className="item-sidebar">
                {/* 价格和操作卡片 */}
                <Card className="price-action-card">
                  {currentItem && (
                    <>
                      {/* 商品头部信息 */}
                      <div className="item-header">
                        <Title level={3} className="item-title">
                          <span className="category-icon">
                            {getCategoryIcon(currentItem.category)}
                          </span>
                          {currentItem.title}
                        </Title>
                        
                        <div className="item-meta">
                          <Space>
                                                        <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
                            <Tag color={conditionConfig.color}>{conditionConfig.text}</Tag>
                            {currentItem.isUrgent && (
                              <Tag color="red" icon={<ExclamationCircleOutlined />}>
                                急售
                              </Tag>
                            )}
                          </Space>
                        </div>
                      </div>

                      {/* 价格信息 */}
                      <div className="price-section">
                        <div className="current-price">
                          <DollarOutlined />
                          <span className="price-amount">¥{currentItem.price}</span>
                          {currentItem.isNegotiable && (
                            <Tag color="blue" size="small">可议价</Tag>
                          )}
                        </div>
                        
                        {currentItem.originalPrice && currentItem.originalPrice > currentItem.price && (
                          <div className="price-comparison">
                            <Text delete type="secondary">原价 ¥{currentItem.originalPrice}</Text>
                            {discountPercent > 0 && (
                              <Tag color="volcano">省{discountPercent}%</Tag>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 状态提醒 */}
                      {currentItem.status === 'sold' && (
                        <Alert
                          message="该商品已售出"
                          type="warning"
                          showIcon
                          style={{ marginBottom: 16 }}
                        />
                      )}

                      {currentItem.status === 'reserved' && (
                        <Alert
                          message="该商品已被预订"
                          type="info"
                          showIcon
                          style={{ marginBottom: 16 }}
                        />
                      )}

                      {/* 操作按钮 */}
                      <div className="action-buttons">
                        <Space direction="vertical" style={{ width: '100%' }}>
                          {canContact() ? (
                            <>
                              <Button 
                                type="primary" 
                                size="large"
                                block
                                icon={<MessageOutlined />}
                                loading={actionLoading === 'contact'}
                                onClick={() => setContactModalVisible(true)}
                              >
                                联系卖家
                              </Button>
                              
                              <Space style={{ width: '100%' }}>
                                <Button 
                                  icon={<HeartOutlined />}
                                  loading={actionLoading === 'like'}
                                  onClick={handleLike}
                                  style={{ flex: 1 }}
                                >
                                  {currentItem.stats.likes}
                                </Button>
                                <Button 
                                  icon={<ShareAltOutlined />}
                                  style={{ flex: 1 }}
                                >
                                  分享
                                </Button>
                              </Space>
                            </>
                          ) : canManage() && currentItem.status === 'available' ? (
                            <>
                              <Button 
                                type="primary"
                                size="large"
                                block
                                icon={<CheckCircleOutlined />}
                                loading={actionLoading === 'sold'}
                                onClick={handleMarkAsSold}
                              >
                                标记为已售出
                              </Button>
                              
                              <Button 
                                block
                                onClick={() => navigate(`/market/${id}/edit`)}
                              >
                                编辑商品
                              </Button>
                            </>
                          ) : currentItem.status === 'sold' ? (
                            <Button size="large" disabled block>
                              <CheckCircleOutlined /> 已售出
                            </Button>
                          ) : (
                            <Text type="secondary">
                              商品暂时无法购买
                            </Text>
                          )}
                        </Space>
                      </div>
                    </>
                  )}
                </Card>

                {/* 卖家信息卡片 */}
                {currentItem && (
                  <Card title="卖家信息" className="seller-card">
                    <div className="seller-info">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div className="seller-basic">
                          <Space>
                            <Avatar 
                              src={currentItem.seller.avatar} 
                              size={48}
                              icon={<UserOutlined />}
                            />
                            <div>
                              <div className="seller-name">
                                <Space>
                                  <Text strong>
                                    {isSeller ? '我' : currentItem.seller.username}
                                  </Text>
                                  {currentItem.seller.isStudentVerified && (
                                    <Tag color="blue" size="small">已认证</Tag>
                                  )}
                                </Space>
                              </div>
                              <div className="seller-rating">
                                <Space>
                                  <Rate 
                                    disabled 
                                    allowHalf 
                                    value={currentItem.seller.rating} 
                                    style={{ fontSize: 12 }}
                                  />
                                  <Text type="secondary">
                                    {currentItem.seller.rating.toFixed(1)}分
                                  </Text>
                                </Space>
                              </div>
                            </div>
                          </Space>
                        </div>

                        <div className="seller-stats">
                          <Row gutter={16}>
                            <Col span={12}>
                              <div className="stat-item">
                                <div className="stat-number">{currentItem.seller.salesCount}</div>
                                <div className="stat-label">成功交易</div>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div className="stat-item">
                                <div className="stat-number">100%</div>
                                <div className="stat-label">好评率</div>
                              </div>
                            </Col>
                          </Row>
                        </div>

                        {/* 联系信息（仅在已联系后显示） */}
                        {currentItem.hasContacted && (
                          <div className="contact-info">
                            <Divider />
                            <div className="contact-header">
                              <Text strong>联系方式</Text>
                            </div>
                            <div className="contact-detail">
                              <Space>
                                <PhoneOutlined />
                                <Text copyable={{ text: currentItem.seller.phone }}>
                                  {currentItem.seller.phone}
                                </Text>
                              </Space>
                            </div>
                          </div>
                        )}
                      </Space>
                    </div>
                  </Card>
                )}

                {/* 浏览统计 */}
                {currentItem && (
                  <Card title="浏览统计" className="stats-card">
                    <Row gutter={16}>
                      <Col span={8}>
                        <div className="stat-item">
                          <EyeOutlined className="stat-icon" />
                          <div className="stat-content">
                            <div className="stat-number">{currentItem.stats.views}</div>
                            <div className="stat-label">浏览</div>
                          </div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="stat-item">
                          <HeartOutlined className="stat-icon" />
                          <div className="stat-content">
                            <div className="stat-number">{currentItem.stats.likes}</div>
                            <div className="stat-label">喜欢</div>
                          </div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="stat-item">
                          <MessageOutlined className="stat-icon" />
                          <div className="stat-content">
                            <div className="stat-number">{currentItem.stats.messages}</div>
                            <div className="stat-label">咨询</div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                )}

                {/* 交易提示 */}
                <Card title="交易提示" className="tips-card">
                  <div className="tips-content">
                    <div className="tip-item">
                      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                      <Text type="secondary">
                        交易前请仔细核实商品信息
                      </Text>
                    </div>
                    
                    <div className="tip-item">
                      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                      <Text type="secondary">
                        建议当面交易，确认无误后付款
                      </Text>
                    </div>
                    
                    <div className="tip-item">
                      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                      <Text type="secondary">
                        注意保护个人隐私和财产安全
                      </Text>
                    </div>
                    
                    <div className="tip-item">
                      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                      <Text type="secondary">
                        如遇可疑情况请及时举报
                      </Text>
                    </div>
                  </div>
                </Card>

                {/* 相似商品推荐 */}
                <Card title="相似商品" className="similar-items-card">
                  <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
                    暂无相似商品推荐
                  </Text>
                </Card>
              </div>
            </Col>
          </Row>
        </div>

        {/* 联系卖家弹窗 */}
        <ContactSellerModal
          visible={contactModalVisible}
          onSubmit={handleContact}
          onCancel={() => setContactModalVisible(false)}
          itemInfo={{
            title: currentItem?.title || '',
            price: currentItem?.price || 0,
            sellerName: currentItem?.seller.username || ''
          }}
        />

        <BackTop />
      </Content>
    </MainLayout>
  );
};

export default MarketDetail;