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
  Image,
  Typography,
  Breadcrumb,
  Modal,
  message,
  Affix,
  BackTop
} from 'antd';
import { 
  LikeOutlined,
  LikeFilled,
  DislikeOutlined,
  DislikeFilled,
  MessageOutlined,
  ShareAltOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  FlagOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchPostById, toggleLikePost, deletePost } from '../../store/slices/postSlice';
import { fetchComments } from '../../store/slices/commentSlice';
import MainLayout from '../../components/Layout/MainLayout';
import CommentSection from '../../components/CommentSection';
import RelatedPosts from '../../components/RelatedPosts';
import AuthorCard from '../../components/AuthorCard';
import './PostDetail.less';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentPost, loading } = useAppSelector(state => state.posts);
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchPostById(id));
      dispatch(fetchComments({ postId: id, page: 1, limit: 20 }));
    }
  }, [dispatch, id]);

  if (!currentPost && !loading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Title level={3}>帖子不存在或已被删除</Title>
          <Button type="primary" onClick={() => navigate('/posts')}>
            返回帖子列表
          </Button>
        </div>
      </MainLayout>
    );
  }

  const handleLike = async (type: 'like' | 'dislike') => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }

    if (id) {
      await dispatch(toggleLikePost({ postId: id, type }));
    }
  };

  const handleDelete = async () => {
    if (id) {
      try {
        await dispatch(deletePost(id)).unwrap();
        message.success('帖子删除成功');
        navigate('/posts');
      } catch (error) {
        message.error('删除失败');
      }
    }
    setDeleteModalVisible(false);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      message.success('链接已复制到剪贴板');
    }).catch(() => {
      message.error('复制失败，请手动复制链接');
    });
    setShareModalVisible(false);
  };

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleString('zh-CN');
  };

  const isAuthor = currentPost?.author.id === user?.id;
  const canEdit = isAuthor || user?.role === 'admin';
  const canDelete = isAuthor || user?.role === 'admin';

  return (
    <MainLayout>
      <Content className="post-detail-content">
        <div className="post-detail-container">
          {/* 面包屑导航 */}
          <Breadcrumb className="post-breadcrumb">
            <Breadcrumb.Item>
              <Link to="/"><HomeOutlined /> 首页</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/posts">湖大论坛</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to={`/posts?category=${currentPost?.category}`}>
                {currentPost?.category}
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{currentPost?.title}</Breadcrumb.Item>
          </Breadcrumb>

          <Row gutter={[24, 24]}>
            {/* 主内容区 */}
            <Col xs={24} lg={18}>
              <Card className="post-detail-card" loading={loading}>
                {currentPost && (
                  <>
                    {/* 帖子头部 */}
                    <div className="post-header">
                      <div className="post-meta">
                        <Space size="middle">
                          <Tag color="blue">{currentPost.category}</Tag>
                          {currentPost.type === 'question' && (
                            <Tag color="orange">提问</Tag>
                          )}
                          {currentPost.isTop && (
                            <Tag color="red">置顶</Tag>
                          )}
                          {currentPost.isHot && (
                            <Tag color="volcano">热门</Tag>
                          )}
                        </Space>
                        
                        {canEdit && (
                          <Space>
                            <Button 
                              type="text" 
                              icon={<EditOutlined />}
                              onClick={() => navigate(`/posts/${id}/edit`)}
                            >
                              编辑
                            </Button>
                            {canDelete && (
                              <Button 
                                type="text" 
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => setDeleteModalVisible(true)}
                              >
                                删除
                              </Button>
                            )}
                          </Space>
                        )}
                      </div>

                      <Title level={2} className="post-title">
                        {currentPost.title}
                      </Title>

                      <div className="post-author-info">
                        <Space size="middle">
                          <Avatar 
                            src={currentPost.author.avatar} 
                            size={40}
                            icon={<UserOutlined />}
                          />
                          <div className="author-details">
                            <div className="author-name">
                              {currentPost.isAnonymous ? '匿名用户' : currentPost.author.username}
                              {currentPost.author.isStudentVerified && (
                                <Tag color="blue" size="small">已认证</Tag>
                              )}
                            </div>
                            <div className="post-time">
                              <Space size="small">
                                <ClockCircleOutlined />
                                <span>发布于 {formatTime(currentPost.createdAt)}</span>
                                {currentPost.updatedAt !== currentPost.createdAt && (
                                  <span>（已编辑）</span>
                                )}
                              </Space>
                            </div>
                          </div>
                        </Space>
                      </div>
                    </div>

                    <Divider />

                    {/* 帖子内容 */}
                    <div className="post-content">
                      <Paragraph className="post-text">
                        {currentPost.content.split('\n').map((line, index) => (
                          <div key={index}>
                            {line}
                            <br />
                          </div>
                        ))}
                      </Paragraph>

                      {/* 图片展示 */}
                      {currentPost.images && currentPost.images.length > 0 && (
                        <div className="post-images">
                          <Image.PreviewGroup>
                            <Row gutter={[8, 8]}>
                              {currentPost.images.map((image, index) => (
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
                      {currentPost.tags && currentPost.tags.length > 0 && (
                        <div className="post-tags">
                          <Text type="secondary">标签：</Text>
                          <Space wrap>
                            {currentPost.tags.map((tag, index) => (
                              <Tag 
                                key={index}
                                onClick={() => navigate(`/posts?search=${tag}`)}
                                style={{ cursor: 'pointer' }}
                              >
                                {tag}
                              </Tag>
                            ))}
                          </Space>
                        </div>
                      )}
                    </div>

                    <Divider />

                    {/* 帖子统计和操作 */}
                    <div className="post-actions">
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Space size="large">
                            <span><EyeOutlined /> {currentPost.stats.views} 浏览</span>
                            <span><MessageOutlined /> {currentPost.stats.comments} 回复</span>
                          </Space>
                        </Col>
                        <Col>
                          <Space size="middle">
                            <Button 
                              type={currentPost.userLikeStatus === 'like' ? 'primary' : 'default'}
                              icon={currentPost.userLikeStatus === 'like' ? <LikeFilled /> : <LikeOutlined />}
                              onClick={() => handleLike('like')}
                            >
                              {currentPost.stats.likes}
                            </Button>
                            
                            <Button 
                              type={currentPost.userLikeStatus === 'dislike' ? 'primary' : 'default'}
                              icon={currentPost.userLikeStatus === 'dislike' ? <DislikeFilled /> : <DislikeOutlined />}
                              onClick={() => handleLike('dislike')}
                            >
                              {currentPost.stats.dislikes}
                            </Button>
                            
                            <Button 
                              icon={<ShareAltOutlined />}
                              onClick={() => setShareModalVisible(true)}
                            >
                              分享
                            </Button>
                            
                            {!isAuthor && (
                              <Button 
                                icon={<FlagOutlined />}
                                onClick={() => message.info('举报功能开发中')}
                              >
                                举报
                              </Button>
                            )}
                          </Space>
                        </Col>
                      </Row>
                    </div>
                  </>
                )}
              </Card>

              {/* 评论区 */}
              {currentPost && (
                <CommentSection postId={currentPost.id} />
              )}
            </Col>

            {/* 侧边栏 */}
            <Col xs={0} lg={6}>
              <Affix offsetTop={24}>
                <div className="post-sidebar">
                  {/* 作者信息卡片 */}
                  {currentPost && !currentPost.isAnonymous && (
                    <AuthorCard author={currentPost.author} />
                  )}

                  {/* 相关帖子 */}
                  {currentPost && (
                    <RelatedPosts 
                      currentPostId={currentPost.id}
                      category={currentPost.category}
                      tags={currentPost.tags}
                    />
                  )}
                </div>
              </Affix>
            </Col>
          </Row>
        </div>

        {/* 删除确认弹窗 */}
        <Modal
          title="确认删除"
          open={deleteModalVisible}
          onOk={handleDelete}
          onCancel={() => setDeleteModalVisible(false)}
          okText="确认删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <p>确定要删除这个帖子吗？删除后无法恢复。</p>
        </Modal>

        {/* 分享弹窗 */}
        <Modal
          title="分享帖子"
          open={shareModalVisible}
          onOk={handleShare}
          onCancel={() => setShareModalVisible(false)}
          okText="复制链接"
          cancelText="取消"
        >
          <p>点击确定复制帖子链接到剪贴板</p>
          <Text code>{window.location.href}</Text>
        </Modal>

        <BackTop />
      </Content>
    </MainLayout>
  );
};

export default PostDetail;