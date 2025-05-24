import React from 'react';
import { Card, Space, Tag, Button, Avatar, Typography, Row, Col, Image, Tooltip } from 'antd';
import { 
  DollarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  EyeOutlined,
  HeartOutlined,
  MessageOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  FireOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import './index.less';

const { Text, Title } = Typography;

interface MarketItem {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  isNegotiable: boolean;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  category: string;
  seller: {
    id: string;
    username: string;
    avatar?: string;
    isStudentVerified: boolean;
    rating: number;
    salesCount: number;
  };
  location: string;
  images: string[];
  tags: string[];
  status: 'available' | 'sold' | 'reserved' | 'deleted';
  isUrgent: boolean;
  stats: {
    views: number;
    likes: number;
    messages: number;
  };
  createdAt: string;
  expiresAt?: string;
}

interface MarketItemCardProps {
  item: MarketItem;
}

const MarketItemCard: React.FC<MarketItemCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);

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
      available: { color: 'green', text: '在售' },
      sold: { color: 'red', text: '已售' },
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

  const formatTime = (timeStr: string) => {
    const now = new Date();
    const time = new Date(timeStr);
    const diff = now.getTime() - time.getTime();
    
    if (diff < 60 * 1000) return '刚刚';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分钟前`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
  };

  const getDiscountPercent = () => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return Math.round((1 - item.price / item.originalPrice) * 100);
    }
    return 0;
  };

  const isSeller = item.seller.id === user?.id;
  const conditionConfig = getConditionConfig(item.condition);
  const statusConfig = getStatusConfig(item.status);
  const discountPercent = getDiscountPercent();

  const handleCardClick = () => {
    navigate(`/market/${item.id}`);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/market/${item.id}?action=contact`);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 处理点赞逻辑
  };

  return (
    <Card 
      className="market-item-card"
      hoverable
      onClick={handleCardClick}
    >
      {/* 商品图片 */}
      <div className="item-image-section">
        {item.images && item.images.length > 0 ? (
          <div className="item-image">
            <Image
              src={item.images[0]}
              alt={item.title}
              width="100%"
              height={180}
              style={{ objectFit: 'cover' }}
              preview={false}
            />
            {item.images.length > 1 && (
              <div className="image-count">
                <span>+{item.images.length - 1}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="no-image">
            <ShopOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
            <div>暂无图片</div>
          </div>
        )}

        {/* 状态标签 */}
        <div className="status-tags">
          {item.isUrgent && (
            <Tag color="red" className="urgent-tag">
              <FireOutlined /> 急售
            </Tag>
          )}
          {discountPercent > 0 && (
            <Tag color="volcano" className="discount-tag">
              {discountPercent}折
            </Tag>
          )}
          <Tag color={statusConfig.color} className="status-tag">
            {statusConfig.text}
          </Tag>
        </div>
      </div>

      {/* 商品信息 */}
      <div className="item-info">
        <div className="item-header">
          <div className="item-title-section">
            <Title level={5} ellipsis={{ tooltip: item.title }} className="item-title">
              <span className="category-icon">{getCategoryIcon(item.category)}</span>
              {item.title}
            </Title>
          </div>
          
          <div className="item-condition">
            <Tag color={conditionConfig.color} size="small">
              {conditionConfig.text}
            </Tag>
          </div>
        </div>

        {/* 价格信息 */}
        <div className="price-section">
          <div className="current-price">
            <DollarOutlined />
            <span className="price-amount">¥{item.price}</span>
            {item.isNegotiable && (
              <Tag size="small" color="blue">可议价</Tag>
            )}
          </div>
          
          {item.originalPrice && item.originalPrice > item.price && (
            <div className="original-price">
              <Text delete type="secondary">¥{item.originalPrice}</Text>
            </div>
          )}
        </div>

        {/* 商品描述 */}
        <div className="item-description">
          <Text type="secondary" ellipsis={{ tooltip: item.description }}>
            {item.description.length > 50 
              ? `${item.description.substring(0, 50)}...` 
              : item.description
            }
          </Text>
        </div>

        {/* 地点信息 */}
        <div className="item-location">
          <EnvironmentOutlined />
          <Text type="secondary">{item.location}</Text>
        </div>

        {/* 标签 */}
        {item.tags && item.tags.length > 0 && (
          <div className="item-tags">
            {item.tags.slice(0, 3).map((tag, index) => (
              <Tag key={index} size="small" color="geekblue">
                {tag}
              </Tag>
            ))}
            {item.tags.length > 3 && (
              <Tag size="small">+{item.tags.length - 3}</Tag>
            )}
          </div>
        )}
      </div>

      {/* 卖家信息 */}
      <div className="seller-info">
        <div className="seller-basic">
          <Space size="small">
            <Avatar 
              src={item.seller.avatar} 
              size={24}
              icon={<UserOutlined />}
            />
            <Text className="seller-name">
              {isSeller ? '我的商品' : item.seller.username}
            </Text>
            {item.seller.isStudentVerified && (
              <Tag color="blue" size="small">已认证</Tag>
            )}
          </Space>
        </div>
        
        <div className="seller-stats">
          <Space size="small">
            <Tooltip title="卖家评分">
              <Text type="secondary">
                ⭐ {item.seller.rating.toFixed(1)}
              </Text>
            </Tooltip>
            <Tooltip title="销售数量">
              <Text type="secondary">
                {item.seller.salesCount}单
              </Text>
            </Tooltip>
          </Space>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="item-stats">
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="middle">
              <Tooltip title="浏览量">
                <Space size={4}>
                  <EyeOutlined />
                  <Text type="secondary">{item.stats.views}</Text>
                </Space>
              </Tooltip>
              
              <Tooltip title="喜欢数">
                <Space size={4} className="like-btn" onClick={handleLikeClick}>
                  <HeartOutlined />
                  <Text type="secondary">{item.stats.likes}</Text>
                </Space>
              </Tooltip>
              
              <Tooltip title="咨询数">
                <Space size={4}>
                  <MessageOutlined />
                  <Text type="secondary">{item.stats.messages}</Text>
                </Space>
              </Tooltip>
            </Space>
          </Col>
          
          <Col>
            <Text type="secondary" className="publish-time">
              {formatTime(item.createdAt)}
            </Text>
          </Col>
        </Row>
      </div>

      {/* 操作按钮 */}
      <div className="item-actions">
        {item.status === 'available' && !isSeller ? (
          <Button 
            type="primary" 
            size="small"
            onClick={handleContactClick}
            block
          >
            联系卖家
          </Button>
        ) : isSeller ? (
          <Button 
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/market/${item.id}/manage`);
            }}
            block
          >
            管理商品
          </Button>
        ) : item.status === 'sold' ? (
          <Button size="small" disabled block>
            <CheckCircleOutlined /> 已售出
          </Button>
        ) : (
          <Button 
            size="small"
            onClick={handleCardClick}
            block
          >
            查看详情
          </Button>
        )}
      </div>
    </Card>
  );
};

export default MarketItemCard;