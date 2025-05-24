import React, { useEffect, useState } from 'react';
import { 
  Layout, 
  Card, 
  Row, 
  Col, 
  Button, 
  Select, 
  Input, 
  Space, 
  Tag, 
  Avatar,
  Pagination,
  Empty,
  Spin,
  Affix
} from 'antd';
import { 
  PlusOutlined,
  FireOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  MessageOutlined,
  LikeOutlined,
  SearchOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchPosts } from '../../store/slices/postSlice';
import MainLayout from '../../components/Layout/MainLayout';
import PostCard from '../../components/PostCard';
import './index.less';

const { Content, Sider } = Layout;
const { Search } = Input;
const { Option } = Select;

const Posts: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { posts, loading, pagination } = useAppSelector(state => state.posts);
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || 'latest',
    search: searchParams.get('search') || '',
    page: parseInt(searchParams.get('page') || '1'),
  });

  const categories = [
    { key: '', label: '全部分类' },
    { key: 'general', label: '综合讨论' },
    { key: 'academic', label: '学术交流' },
    { key: 'life', label: '生活分享' },
    { key: 'parttime', label: '兼职求职' },
    { key: 'lostfound', label: '失物招领' },
    { key: 'market', label: '二手交易' },
    { key: 'dining', label: '美食推荐' },
    { key: 'entertainment', label: '娱乐休闲' },
    { key: 'question', label: '问题求助' },
    { key: 'notice', label: '通知公告' },
  ];

  const sortOptions = [
    { key: 'latest', label: '最新发布', icon: <ClockCircleOutlined /> },
    { key: 'hot', label: '热门讨论', icon: <FireOutlined /> },
    { key: 'views', label: '浏览最多', icon: <EyeOutlined /> },
    { key: 'comments', label: '回复最多', icon: <MessageOutlined /> },
  ];

  useEffect(() => {
    const params = {
      page: filters.page,
      limit: 20,
      category: filters.category,
      sort: filters.sort,
      search: filters.search,
    };

    dispatch(fetchPosts(params));
  }, [dispatch, filters]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    
    // 更新URL参数
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newSearchParams.set(k, v.toString());
    });
    setSearchParams(newSearchParams);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page.toString());
    setSearchParams(newSearchParams);
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

  return (
    <MainLayout>
      <div className="posts-page">
        <Row gutter={[24, 24]}>
          {/* 主内容区 */}
          <Col xs={24} lg={18}>
            <div className="posts-main">
              {/* 头部操作栏 */}
              <Card className="posts-header">
                <Row justify="space-between" align="middle">
                  <Col>
                    <Space size="middle">
                      <Search
                        placeholder="搜索帖子..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        onSearch={(value) => handleFilterChange('search', value)}
                        style={{ width: 300 }}
                        allowClear
                      />
                      
                      <Select
                        value={filters.category}
                        onChange={(value) => handleFilterChange('category', value)}
                        style={{ width: 120 }}
                      >
                        {categories.map(cat => (
                          <Option key={cat.key} value={cat.key}>
                            {cat.label}
                          </Option>
                        ))}
                      </Select>
                      
                      <Select
                        value={filters.sort}
                        onChange={(value) => handleFilterChange('sort', value)}
                        style={{ width: 120 }}
                      >
                        {sortOptions.map(option => (
                          <Option key={option.key} value={option.key}>
                            <Space>
                              {option.icon}
                              {option.label}
                            </Space>
                          </Option>
                        ))}
                      </Select>
                    </Space>
                  </Col>
                  
                  <Col>
                    {isAuthenticated && (
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/posts/create')}
                      >
                        发布帖子
                      </Button>
                    )}
                  </Col>
                </Row>
              </Card>

              {/* 帖子列表 */}
              <div className="posts-list">
                <Spin spinning={loading}>
                  {posts.length > 0 ? (
                    <>
                      {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                      
                      {/* 分页 */}
                      <div className="posts-pagination">
                        <Pagination
                          current={pagination.current}
                          total={pagination.total}
                          pageSize={pagination.pageSize}
                          onChange={handlePageChange}
                          showSizeChanger={false}
                          showQuickJumper
                          showTotal={(total, range) =>
                            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <Empty
                      description="暂无帖子"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      {isAuthenticated && (
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => navigate('/posts/create')}
                        >
                          发布第一个帖子
                        </Button>
                      )}
                    </Empty>
                  )}
                </Spin>
              </div>
            </div>
          </Col>

          {/* 侧边栏 */}
          <Col xs={0} lg={6}>
            <Affix offsetTop={24}>
              <div className="posts-sidebar">
                {/* 用户信息卡片 */}
                {isAuthenticated && (
                  <Card className="user-info-card" size="small">
                    <div className="user-info">
                      <Avatar 
                        src={user?.avatar} 
                        size={48} 
                        icon={<UserOutlined />}
                      />
                      <div className="user-details">
                        <h4>{user?.username}</h4>
                        <Space size="small">
                          <span>帖子: {user?.stats.postsCount}</span>
                          <span>评论: {user?.stats.commentsCount}</span>
                        </Space>
                        <div className="user-tags">
                          {user?.isStudentVerified && (
                            <Tag color="blue" size="small">已认证</Tag>
                          )}
                          {user?.isBlueCardMember && (
                            <Tag color="gold" size="small">蓝卡会员</Tag>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* 热门标签 */}
                <Card title="热门标签" size="small" className="hot-tags-card">
                  <div className="hot-tags">
                    {['校园生活', '学习交流', '兼职招聘', '二手交易', '失物招领', '美食推荐'].map(tag => (
                      <Tag 
                        key={tag} 
                        className="hot-tag"
                        onClick={() => handleFilterChange('search', tag)}
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </Card>

                {/* 发帖指南 */}
                <Card title="发帖指南" size="small" className="guide-card">
                  <ul className="guide-list">
                    <li>使用恰当的标题和分类</li>
                    <li>详细描述问题或分享内容</li>
                    <li>遵守社区规则，友善交流</li>
                    <li>适当使用标签提高曝光度</li>
                  </ul>
                </Card>
              </div>
            </Affix>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};

export default Posts;