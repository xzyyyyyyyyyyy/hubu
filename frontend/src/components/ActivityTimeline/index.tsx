import React, { useEffect, useState } from 'react';
import { Card, Timeline, Typography, Space, Tag, Button, Empty } from 'antd';
import { 
  MessageOutlined,
  LikeOutlined,
  TruckOutlined,
  TeamOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './index.less';

const { Text } = Typography;

interface ActivityTimelineProps {
  userId: string;
}

interface Activity {
  id: string;
  type: 'post' | 'comment' | 'like' | 'express' | 'parttime';
  title: string;
  description: string;
  targetId?: string;
  targetType?: string;
  createdAt: string;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟获取活动数据
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'post',
        title: '发布了新帖子',
        description: '校园生活分享：今天的食堂新菜品真不错',
        targetId: '123',
        targetType: 'post',
        createdAt: '2025-05-24T06:30:00Z'
      },
      {
        id: '2',
        type: 'comment',
        title: '评论了帖子',
        description: '在"期末考试复习攻略"下发表了评论',
        targetId: '124',
        targetType: 'post',
        createdAt: '2025-05-23T15:20:00Z'
      },
      {
        id: '3',
        type: 'express',
        title: '发布了快递代拿订单',
        description: '申通快递代取，地点：东门快递点',
        targetId: '125',
        targetType: 'express',
        createdAt: '2025-05-22T09:15:00Z'
      },
      {
        id: '4',
        type: 'parttime',
        title: '申请了兼职职位',
        description: '申请了"图书馆助理"职位',
        targetId: '126',
        targetType: 'parttime',
        createdAt: '2025-05-21T14:45:00Z'
      },
      {
        id: '5',
        type: 'like',
        title: '点赞了帖子',
        description: '为"新生入学指南"点了赞',
        targetId: '127',
        targetType: 'post',
        createdAt: '2025-05-20T11:30:00Z'
      }
    ];

    setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 1000);
  }, [userId]);

  const getActivityIcon = (type: string) => {
    const iconMap = {
      post: <MessageOutlined style={{ color: '#1890ff' }} />,
      comment: <MessageOutlined style={{ color: '#52c41a' }} />,
      like: <LikeOutlined style={{ color: '#fa8c16' }} />,
      express: <TruckOutlined style={{ color: '#eb2f96' }} />,
      parttime: <TeamOutlined style={{ color: '#722ed1' }} />
    };
    return iconMap[type as keyof typeof iconMap] || <ClockCircleOutlined />;
  };

  const getActivityTag = (type: string) => {
    const tagMap = {
      post: { color: 'blue', text: '发帖' },
      comment: { color: 'green', text: '评论' },
      like: { color: 'orange', text: '点赞' },
      express: { color: 'magenta', text: '快递' },
      parttime: { color: 'purple', text: '兼职' }
    };
    const tag = tagMap[type as keyof typeof tagMap] || { color: 'default', text: '活动' };
    return <Tag color={tag.color} size="small">{tag.text}</Tag>;
  };

  const formatTime = (timeStr: string) => {
    const now = new Date();
    const time = new Date(timeStr);
    const diff = now.getTime() - time.getTime();
    
    if (diff < 60 * 1000) return '刚刚';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分钟前`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
    if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
    return time.toLocaleDateString('zh-CN');
  };

  const handleActivityClick = (activity: Activity) => {
    if (activity.targetId && activity.targetType) {
      switch (activity.targetType) {
        case 'post':
          navigate(`/posts/${activity.targetId}`);
          break;
        case 'express':
          navigate(`/express/${activity.targetId}`);
          break;
        case 'parttime':
          navigate(`/parttime/${activity.targetId}`);
          break;
        default:
          break;
      }
    }
  };

  return (
    <Card title="🕐 最近活动" size="small" className="activity-timeline-card">
      {loading ? (
        <div className="timeline-loading">加载中...</div>
      ) : activities.length > 0 ? (
        <Timeline className="activity-timeline">
          {activities.map((activity) => (
            <Timeline.Item
              key={activity.id}
              dot={getActivityIcon(activity.type)}
              className="activity-item"
            >
              <div className="activity-content">
                <div className="activity-header">
                  <Space>
                    {getActivityTag(activity.type)}
                    <Text strong>{activity.title}</Text>
                  </Space>
                  <Text type="secondary" className="activity-time">
                    {formatTime(activity.createdAt)}
                  </Text>
                </div>
                <div className="activity-description">
                  <Text 
                    type="secondary"
                    className={activity.targetId ? 'clickable' : ''}
                    onClick={() => handleActivityClick(activity)}
                  >
                    {activity.description}
                  </Text>
                </div>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      ) : (
        <Empty 
          description="暂无活动记录"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
      
      {activities.length > 0 && (
        <div className="timeline-footer">
          <Button type="link" size="small">
            查看更多活动
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ActivityTimeline;