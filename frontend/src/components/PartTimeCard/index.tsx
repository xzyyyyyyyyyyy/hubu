import React from 'react';
import { Card, Space, Tag, Button, Avatar, Tooltip, Typography } from 'antd';
import { 
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FireOutlined,
  BankOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './index.less';

const { Text, Title } = Typography;

interface PartTimeJob {
  id: string;
  title: string;
  description: string;
  company: string;
  contact: {
    name: string;
    phone: string;
    wechat?: string;
    qq?: string;
  };
  location: {
    address: string;
  };
  salary: {
    type: 'hourly' | 'daily' | 'monthly' | 'piece';
    amount: number;
    unit: string;
  };
  requirements: string[];
  workTime: {
    schedule: string;
    duration: string;
    isFlexible: boolean;
  };
  category: string;
  tags: string[];
  isUrgent: boolean;
  status: string;
  poster: {
    id: string;
    username: string;
    avatar?: string;
    isStudentVerified: boolean;
  };
  stats: {
    views: number;
    applications: number;
  };
  expiresAt: string;
  createdAt: string;
}

interface PartTimeCardProps {
  job: PartTimeJob;
}

const PartTimeCard: React.FC<PartTimeCardProps> = ({ job }) => {
  const navigate = useNavigate();

  const formatSalary = () => {
    const { type, amount, unit } = job.salary;
    const typeMap = {
      hourly: '/时',
      daily: '/天',
      monthly: '/月',
      piece: '/件'
    };
    return `${amount}${unit}${typeMap[type]}`;
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

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      food: '🍽️',
      retail: '🛍️',
      education: '📚',
      promotion: '📢',
      delivery: '🚚',
      office: '💼',
      entertainment: '🎭',
      tech: '💻',
      other: '🔧'
    };
    return iconMap[category] || '💼';
  };

  const handleCardClick = () => {
    navigate(`/parttime/${job.id}`);
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/parttime/${job.id}?action=apply`);
  };

  return (
    <Card 
      className="parttime-card"
      hoverable
      onClick={handleCardClick}
      actions={[
        <Button 
          type="primary" 
          onClick={handleApplyClick}
          disabled={job.status !== 'active'}
        >
          {job.status === 'active' ? '立即申请' : '已结束'}
        </Button>
      ]}
    >
      {/* 卡片头部 */}
      <div className="card-header">
        <div className="job-basic-info">
          <div className="job-title-line">
            <Title level={4} className="job-title" ellipsis={{ tooltip: job.title }}>
              <span className="category-icon">{getCategoryIcon(job.category)}</span>
              {job.title}
            </Title>
            {job.isUrgent && (
              <Tag icon={<FireOutlined />} color="red" className="urgent-tag">
                紧急
              </Tag>
            )}
          </div>
          
          <div className="company-info">
            <Space>
              <BankOutlined />
              <Text strong>{job.company}</Text>
            </Space>
          </div>
        </div>

        <div className="salary-info">
          <div className="salary-amount">
            <DollarOutlined />
            <span className="amount">{formatSalary()}</span>
          </div>
        </div>
      </div>

      {/* 工作信息 */}
      <div className="job-info">
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div className="info-item">
            <EnvironmentOutlined />
            <Text ellipsis={{ tooltip: job.location.address }}>
              {job.location.address}
            </Text>
          </div>
          
          <div className="info-item">
            <ClockCircleOutlined />
            <Text>
              {job.workTime.schedule} · {job.workTime.duration}
              {job.workTime.isFlexible && <Tag size="small">时间灵活</Tag>}
            </Text>
          </div>
        </Space>
      </div>

      {/* 工作描述 */}
      <div className="job-description">
        <Text type="secondary" ellipsis={{ tooltip: job.description }}>
          {job.description.length > 60 
            ? `${job.description.substring(0, 60)}...` 
            : job.description
          }
        </Text>
      </div>

      {/* 技能要求标签 */}
      {job.requirements.length > 0 && (
        <div className="requirements">
          <Space wrap size={[4, 4]}>
            {job.requirements.slice(0, 3).map((req, index) => (
              <Tag key={index} size="small" color="blue">
                {req}
              </Tag>
            ))}
            {job.requirements.length > 3 && (
              <Tag size="small">+{job.requirements.length - 3}</Tag>
            )}
          </Space>
        </div>
      )}

      {/* 卡片底部 */}
      <div className="card-footer">
        <div className="poster-info">
          <Space size="small">
            <Avatar 
              src={job.poster.avatar} 
              size={20}
              icon={<UserOutlined />}
            />
            <Text type="secondary" className="poster-name">
              {job.poster.username}
            </Text>
            {job.poster.isStudentVerified && (
              <Tag color="blue" size="small">已认证</Tag>
            )}
          </Space>
        </div>

        <div className="job-stats">
          <Space size="middle">
            <Tooltip title="浏览量">
              <Space size={4}>
                <EyeOutlined />
                <Text type="secondary">{job.stats.views}</Text>
              </Space>
            </Tooltip>
            
            <Tooltip title="申请人数">
              <Space size={4}>
                <UserOutlined />
                <Text type="secondary">{job.stats.applications}</Text>
              </Space>
            </Tooltip>
            
            <Text type="secondary" className="publish-time">
              {formatTime(job.createdAt)}
            </Text>
          </Space>
        </div>
      </div>
    </Card>
  );
};

export default PartTimeCard;