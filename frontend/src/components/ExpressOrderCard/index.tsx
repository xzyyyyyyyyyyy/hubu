import React from 'react';
import { Card, Space, Tag, Button, Avatar, Typography, Row, Col, Tooltip } from 'antd';
import { 
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  TruckOutlined,
  ShopOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import './index.less';

const { Text, Title } = Typography;

interface ExpressOrder {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    username: string;
    avatar?: string;
    phone: string;
  };
  helper?: {
    id: string;
    username: string;
    avatar?: string;
    phone: string;
  };
  type: 'pickup' | 'delivery';
  details: {
    expressCompany: string;
    trackingNumber: string;
    pickupLocation: string;
    deliveryLocation: string;
    recipientInfo: {
      name: string;
      phone: string;
      building: string;
      room: string;
    };
  };
  payment: {
    amount: number;
    method: string;
    status: string;
  };
  status: 'pending' | 'accepted' | 'picked' | 'delivered' | 'completed' | 'cancelled';
  notes: string;
  expiresAt: string;
  createdAt: string;
}

interface ExpressOrderCardProps {
  order: ExpressOrder;
}

const ExpressOrderCard: React.FC<ExpressOrderCardProps> = ({ order }) => {
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { color: 'orange', text: '待接单' },
      accepted: { color: 'blue', text: '已接单' },
      picked: { color: 'cyan', text: '已取件' },
      delivered: { color: 'purple', text: '已送达' },
      completed: { color: 'green', text: '已完成' },
      cancelled: { color: 'red', text: '已取消' },
    };
    return configs[status as keyof typeof configs] || { color: 'default', text: status };
  };

  const getTypeIcon = (type: string) => {
    return type === 'pickup' ? <TruckOutlined /> : <ShopOutlined />;
  };

  const getTypeText = (type: string) => {
    return type === 'pickup' ? '代取快递' : '代送快递';
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

  const isExpired = new Date(order.expiresAt) < new Date();
  const isCustomer = order.customer.id === user?.id;
  const isHelper = order.helper?.id === user?.id;
  const canAccept = order.status === 'pending' && !isCustomer && !isExpired;

  const handleCardClick = () => {
    navigate(`/express/${order.id}`);
  };

  const handleActionClick = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();
    navigate(`/express/${order.id}?action=${action}`);
  };

  const statusConfig = getStatusConfig(order.status);

  return (
    <Card 
      className="express-order-card"
      hoverable
      onClick={handleCardClick}
    >
      {/* 订单头部 */}
      <div className="order-header">
        <div className="order-info">
          <Space>
            {getTypeIcon(order.type)}
            <Text strong>{getTypeText(order.type)}</Text>
            <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
          </Space>
          {isExpired && order.status === 'pending' && (
            <Tag color="red">已过期</Tag>
          )}
        </div>
        
        <div className="order-price">
          <Space>
            <DollarOutlined />
            <Text strong className="price-text">¥{order.payment.amount}</Text>
          </Space>
        </div>
      </div>

      {/* 快递信息 */}
      <div className="express-info">
        <div className="express-company">
          <Text type="secondary">快递公司：</Text>
          <Text strong>{order.details.expressCompany}</Text>
        </div>
        <div className="tracking-number">
          <Text type="secondary">快递单号：</Text>
          <Text code copyable={{ text: order.details.trackingNumber }}>
            {order.details.trackingNumber}
          </Text>
        </div>
      </div>

      {/* 地址信息 */}
      <div className="location-info">
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <div className="location-item">
              <ShopOutlined style={{ color: '#1890ff' }} />
              <div className="location-content">
                <Text type="secondary">取件地址</Text>
                <div>
                  <Text ellipsis={{ tooltip: order.details.pickupLocation }}>
                    {order.details.pickupLocation}
                  </Text>
                </div>
              </div>
            </div>
          </Col>
          <Col span={24}>
            <div className="location-item">
              <HomeOutlined style={{ color: '#52c41a' }} />
              <div className="location-content">
                <Text type="secondary">送达地址</Text>
                <div>
                  <Text ellipsis={{ tooltip: order.details.deliveryLocation }}>
                    {order.details.deliveryLocation}
                  </Text>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* 收件人信息 */}
      <div className="recipient-info">
        <Space>
          <UserOutlined />
          <Text>{order.details.recipientInfo.name}</Text>
          <Text type="secondary">
            {order.details.recipientInfo.building} {order.details.recipientInfo.room}
          </Text>
        </Space>
      </div>

      {/* 备注信息 */}
      {order.notes && (
        <div className="order-notes">
          <Text type="secondary" ellipsis={{ tooltip: order.notes }}>
            备注：{order.notes}
          </Text>
        </div>
      )}

      {/* 订单底部 */}
      <div className="order-footer">
        <div className="customer-info">
          <Space size="small">
            <Avatar 
              src={order.customer.avatar} 
              size={20}
              icon={<UserOutlined />}
            />
            <Text type="secondary" className="customer-name">
              {isCustomer ? '我发布的' : order.customer.username}
            </Text>
            <Text type="secondary" className="publish-time">
              {formatTime(order.createdAt)}
            </Text>
          </Space>
        </div>

        <div className="order-actions">
          {canAccept ? (
            <Button 
              type="primary" 
              size="small"
              onClick={(e) => handleActionClick(e, 'accept')}
            >
              接单
            </Button>
          ) : order.status === 'pending' && isCustomer ? (
            <Button 
              size="small"
              onClick={(e) => handleActionClick(e, 'edit')}
            >
              编辑
            </Button>
          ) : (isCustomer || isHelper) && order.status !== 'completed' && order.status !== 'cancelled' ? (
            <Button 
              size="small"
              onClick={(e) => handleActionClick(e, 'manage')}
            >
              管理
            </Button>
          ) : (
            <Button 
              size="small"
              onClick={(e) => handleActionClick(e, 'view')}
            >
              查看
            </Button>
          )}
        </div>
      </div>

      {/* 代拿员信息 */}
      {order.helper && (
        <div className="helper-info">
          <Space>
            <Avatar 
              src={order.helper.avatar} 
              size={20}
              icon={<UserOutlined />}
            />
            <Text type="secondary">
              代拿员：{isHelper ? '我' : order.helper.username}
            </Text>
          </Space>
        </div>
      )}
    </Card>
  );
};

export default ExpressOrderCard;