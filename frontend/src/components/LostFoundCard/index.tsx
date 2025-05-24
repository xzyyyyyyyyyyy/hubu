import React from 'react';
import { Card, Space, Tag, Button, Avatar, Typography, Row, Col, Image, Tooltip } from 'antd';
import { 
  EnvironmentOutlined,
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import './index.less';

const { Text, Title } = Typography;

interface LostFoundItem {
  id: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  category: string;
  poster: {
    id: string;
    username: string;
    avatar?: string;
    phone: string;
    isStudentVerified: boolean;
  };
  location: {
    area: string;
    specific: string;
  };
  lostDate: string;
  images: string[];
  reward?: number;
  status: 'active' | 'claimed' | 'closed';
  isUrgent: boolean;
  contactInfo: {
    method: 'phone' | 'qq' | 'wechat';
    value: string;
  };
  stats: {
    views: number;
    contacts: number;
  };
  createdAt: string;
}

interface LostFoundCardProps {
  item: LostFoundItem;
}

const LostFoundCard: React.FC<LostFoundCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);

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

  const formatTime = (timeStr: string) => {
    const now = new Date();
    const time = new Date(timeStr);
    const diff = now.getTime() - time.getTime();
    
    if (diff < 60 * 1000) return '刚刚';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分钟前`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const isPoster = item.poster.id === user?.id;
  const typeConfig = getTypeConfig(item.type);
  const statusConfig = getStatusConfig(item.status);

  const handleCardClick = () => {
    navigate(`/lostfound/${item.id}`);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/lostfound/${item.id}?action=contact`);
  };

  return (
    <Card 
      className="lostfound-card"
      hoverable
      onClick={handleCardClick}
    >
      {/* 卡片头部 */}
      <div className="card-header">
        <div className="item-info">
          <Space>
            <span className="type-icon">{typeConfig.icon}</span>
            <Tag color={typeConfig.color}>{typeConfig.text}</Tag>
            <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
            {item.isUrgent && (
              <Tag color="red" icon={<QuestionCircleOutlined />}>
                紧急
              </Tag>
            )}
          </Space>
        </div>
        
        {item.reward && item.type === 'lost' && (
          <div className="reward-info">
            <Text type="secondary">酬谢</Text>
            <Text strong className="reward-amount">¥{item.reward}</Text>
          </div>
        )}
      </div>

      {/* 物品标题 */}
      <div className="item-title">
        <Title level={4} ellipsis={{ tooltip: item.title }}>
          <span className="category-icon">{getCategoryIcon(item.category)}</span>
          {item.title}
        </Title>
      </div>

      {/* 物品描述 */}
      <div className="item-description">
        <Text type="secondary" ellipsis={{ tooltip: item.description }}>
          {item.description.length > 80 
            ? `${item.description.substring(0, 80)}...` 
            : item.description
          }
        </Text>
      </div>

      {/* 地点和时间信息 */}
      <div className="item-details">
        <div className="detail-item">
          <EnvironmentOutlined />
          <Text ellipsis={{ tooltip: `${item.location.area} ${item.location.specific}` }}>
            {item.location.area} {item.location.specific}
          </Text>
        </div>
        
        <div className="detail-item">
          <CalendarOutlined />
          <Text>
            {item.type === 'lost' ? '丢失时间' : '捡到时间'}：{formatDate(item.lostDate)}
          </Text>
        </div>
      </div>

      {/* 图片预览 */}
      {item.images && item.images.length > 0 && (
        <div className="item-images">
          <Row gutter={[4, 4]}>
            {item.images.slice(0, 3).map((image, index) => (
              <Col key={index} span={8}>
                <Image
                  src={image}
                  alt={`物品图片 ${index + 1}`}
                  width="100%"
                  height={60}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                  preview={false}
                />
              </Col>
            ))}
            {item.images.length > 3 && (
              <Col span={8}>
                <div className="more-images">
                  +{item.images.length - 3}
                </div>
              </Col>
            )}
          </Row>
        </div>
      )}

      {/* 卡片底部 */}
      <div className="card-footer">
        <div className="poster-info">
          <Space size="small">
            <Avatar 
              src={item.poster.avatar} 
              size={20}
              icon={<UserOutlined />}
            />
            <Text type="secondary" className="poster-name">
              {isPoster ? '我发布的' : item.poster.username}
            </Text>
            {item.poster.isStudentVerified && (
              <Tag color="blue" size="small">已认证</Tag>
            )}
            <Text type="secondary" className="publish-time">
              {formatTime(item.createdAt)}
            </Text>
          </Space>
        </div>

        <div className="item-stats">
          <Space size="middle">
            <Tooltip title="浏览量">
              <Space size={4}>
                <EyeOutlined />
                <Text type="secondary">{item.stats.views}</Text>
              </Space>
            </Tooltip>
            
            <Tooltip title="联系次数">
              <Space size={4}>
                <PhoneOutlined />
                <Text type="secondary">{item.stats.contacts}</Text>
              </Space>
            </Tooltip>
          </Space>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="card-actions">
        {item.status === 'active' && !isPoster ? (
          <Button 
            type="primary" 
            size="small"
            icon={<PhoneOutlined />}
            onClick={handleContactClick}
            block
          >
            联系{item.type === 'lost' ? '失主' : '拾到者'}
          </Button>
        ) : isPoster && item.status !== 'closed' ? (
          <Button 
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/lostfound/${item.id}/manage`);
            }}
            block
          >
            管理
          </Button>
        ) : item.status === 'claimed' ? (
          <Button size="small" disabled block>
            <CheckCircleOutlined /> 已找到
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

export default LostFoundCard;