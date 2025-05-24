import React from 'react';
import { Modal, Card, Space, Tag, Avatar, Typography, Image, Row, Col } from 'antd';
import { 
  UserOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  LikeOutlined,
  MessageOutlined
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import './index.less';

const { Text, Title } = Typography;

interface PostPreviewProps {
  visible: boolean;
  onClose: () => void;
  postData: {
    title: string;
    content: string;
    category: string;
    type: string;
    tags: string[];
    images: string[];
    isAnonymous: boolean;
    author: {
      username: string;
      avatar?: string;
      isStudentVerified: boolean;
    };
  };
}

const PostPreview: React.FC<PostPreviewProps> = ({
  visible,
  onClose,
  postData
}) => {
  const getCategoryText = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      general: '💬 综合讨论',
      academic: '📚 学术交流',
      life: '🏠 生活分享',
      parttime: '💼 兼职求职',
      lostfound: '🔍 失物招领',
      market: '🛍️ 二手交易',
      dining: '🍜 美食推荐',
      entertainment: '🎮 娱乐休闲',
      question: '❓ 问题求助',
      notice: '📢 通知公告',
    };
    return categoryMap[category] || category;
  };

  const getTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      post: '📝 普通帖子',
      question: '❓ 提问求助',
      announcement: '📢 公告通知',
      activity: '🎉 活动组织',
    };
    return typeMap[type] || type;
  };

  return (
    <Modal
      title="帖子预览"
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ maxWidth: 800 }}
      className="post-preview-modal"
    >
      <div className="post-preview-content">
        <Card className="preview-post-card">
          {/* 帖子头部 */}
          <div className="post-header">
            <div className="post-meta">
              <Space size="middle">
                <Tag color="blue">{getCategoryText(postData.category)}</Tag>
                <Tag color="green">{getTypeText(postData.type)}</Tag>
              </Space>
            </div>

            <Title level={3} className="post-title">
              {postData.title}
            </Title>

            <div className="post-author-info">
              <Space size="middle">
                <Avatar 
                  src={postData.isAnonymous ? null : postData.author.avatar} 
                  size={40}
                  icon={<UserOutlined />}
                />
                <div className="author-details">
                  <div className="author-name">
                    <Space>
                      <span>
                        {postData.isAnonymous ? '匿名用户' : postData.author.username}
                      </span>
                      {!postData.isAnonymous && postData.author.isStudentVerified && (
                        <Tag color="blue" size="small">已认证</Tag>
                      )}
                    </Space>
                  </div>
                  <div className="post-time">
                    <Space size="small">
                      <ClockCircleOutlined />
                      <span>刚刚</span>
                    </Space>
                  </div>
                </div>
              </Space>
            </div>
          </div>

          {/* 帖子内容 */}
          <div className="post-content">
            {postData.content.includes('```') || postData.content.includes('#') ? (
              <ReactMarkdown className="markdown-content">
                {postData.content}
              </ReactMarkdown>
            ) : (
              <div className="simple-content">
                {postData.content.split('\n').map((line, index) => (
                  <div key={index}>
                    {line}
                    <br />
                  </div>
                ))}
              </div>
            )}

            {/* 图片展示 */}
            {postData.images && postData.images.length > 0 && (
              <div className="post-images">
                <Image.PreviewGroup>
                  <Row gutter={[8, 8]}>
                    {postData.images.map((image, index) => (
                      <Col key={index} xs={12} sm={8} md={6}>
                        <Image
                          src={image}
                          alt={`图片 ${index + 1}`}
                          style={{ width: '100%', borderRadius: 6 }}
                        />
                      </Col>
                    ))}
                  </Row>
                </Image.PreviewGroup>
              </div>
            )}

            {/* 标签 */}
            {postData.tags && postData.tags.length > 0 && (
              <div className="post-tags">
                <Text type="secondary">标签：</Text>
                <Space wrap>
                  {postData.tags.map((tag, index) => (
                    <Tag key={index}>{tag}</Tag>
                  ))}
                </Space>
              </div>
            )}
          </div>

          {/* 帖子统计 */}
          <div className="post-stats">
            <Space size="large">
              <span><EyeOutlined /> 0 浏览</span>
              <span><LikeOutlined /> 0 点赞</span>
              <span><MessageOutlined /> 0 评论</span>
            </Space>
          </div>
        </Card>
      </div>
    </Modal>
  );
};

export default PostPreview;