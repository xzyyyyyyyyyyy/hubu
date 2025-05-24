import React from 'react';
import { Card, Space, Tag, Avatar, Row, Col, Image } from 'antd';
import { 
  EyeOutlined,
  MessageOutlined,
  LikeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FireOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './index.less';

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
    isStudentVerified: boolean;
  };
  category: string;
  tags: string[];
  type: string;
  isAnonymous: boolean;
  isTop: boolean;
  isHot: boolean;
  images: string[];
  stats: {
    views: number;
    likes: number;
    comments: number;
  };
  createdAt: string;
}

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const navigate = useNavigate();

  const formatTime = (timeStr: string) => {
    const now = new Date();
    const time = new Date(timeStr);
    const diff = now.getTime() - time.getTime();
    
    if (diff < 60 * 1000) return '刚刚';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分钟前`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
  };

  const getContentPreview = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleCardClick = () => {
    navigate(`/posts/${post.id}`);
  };

  return (
    <Card 
      className="post-card"
      hoverable
      onClick={handleCardClick}
    >
      <div className="post-card-header">
        <Space size="middle">
          <Avatar 
            src={post.isAnonymous ? null : post.author.avatar}
            size={40}
            icon={<UserOutlined />}
          />
          <div className="author-info">
            <div className="author-name">
              <Space>
                <span>
                  {post.isAnonymous ? '匿名用户' : post.author.username}
                </span>
                {post.author.isStudentVerified && (
                  <Tag color="blue" size="small">已认证</Tag>
                )}
              </Space>
            </div>
            <div className="post-time">
              <Space size="small">
                <ClockCircleOutlined />
                <span>{formatTime(post.createdAt)}</span>
              </Space>
            </div>
          </div>
        </Space>

        <div className="post-badges">
          <Space>
            {post.isTop && (
              <Tag icon={<StarOutlined />} color="red">置顶</Tag>
            )}
            {post.isHot && (
              <Tag icon={<FireOutlined />} color="volcano">热门</Tag>
            )}
            <Tag color="blue">{post.category}</Tag>
          </Space>
        </div>
      </div>

      <div className="post-card-content">
        <h3 className="post-title">{post.title}</h3>
        
        <p className="post-content-preview">
          {getContentPreview(post.content)}
        </p>

        {/* 图片预览 */}
        {post.images && post.images.length > 0 && (
          <div className="post-images-preview">
            <Space size={4}>
              {post.images.slice(0, 3).map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt={`图片 ${index + 1}`}
                  width={60}
                  height={60}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                  preview={false}
                />
              ))}
              {post.images.length > 3 && (
                <div className="more-images">
                  +{post.images.length - 3}
                </div>
              )}
            </Space>
          </div>
        )}

        {/* 标签 */}
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            <Space wrap size={[4, 4]}>
              {post.tags.slice(0, 5).map((tag, index) => (
                <Tag 
                  key={index} 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/posts?search=${tag}`);
                  }}
                >
                  {tag}
                </Tag>
              ))}
              {post.tags.length > 5 && (
                <Tag size="small">...</Tag>
              )}
            </Space>
          </div>
        )}
      </div>

      <div className="post-card-footer">
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="large">
              <span><EyeOutlined /> {post.stats.views}</span>
              <span><LikeOutlined /> {post.stats.likes}</span>
              <span><MessageOutlined /> {post.stats.comments}</span>
            </Space>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default PostCard;