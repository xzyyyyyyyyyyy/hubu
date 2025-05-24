import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Input, 
  Select,
  Typography,
  message,
  Popconfirm,
  Tooltip,
  Badge,
  Row,
  Col,
  Statistic,
  DatePicker,
  Image,
  Drawer
} from 'antd';
import { 
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  ExportOutlined,
  FlagOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { 
  fetchAdminPosts, 
  updatePostStatus, 
  deletePost,
  fetchPostStats
} from '../../../store/slices/adminSlice';
import PostDetailDrawer from '../../../components/Admin/PostDetailDrawer';
import './index.less';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const PostManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { posts, postStats, loading, pagination } = useAppSelector(state => state.admin);
  
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    isReported: '',
    dateRange: null as any,
  });
  const [postDetailVisible, setPostDetailVisible] = useState(false);
  const [currentPost, setCurrentPost] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchAdminPosts({ 
      page: 1, 
      limit: 20,
      search: searchText,
      ...filters
    }));
    dispatch(fetchPostStats());
  }, [dispatch, searchText, filters]);

  const columns = [
    {
      title: '帖子信息',
      key: 'postInfo',
      width: 300,
      render: (_, record: any) => (
        <div className="post-info-cell">
          {record.images && record.images.length > 0 && (
            <Image
              src={record.images[0]}
              alt="帖子图片"
              width={40}
              height={40}
              style={{ objectFit: 'cover', borderRadius: 4 }}
              preview={false}
            />
          )}
          <div className="post-details">
            <div className="post-title" onClick={() => handleViewPost(record)}>
              {record.title}
            </div>
            <div className="post-meta">
              <Text type="secondary" ellipsis>
                {record.content.substring(0, 50)}...
              </Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '作者',
      key: 'author',
      width: 120,
      render: (_, record: any) => (
        <div>
          <div>{record.author.username}</div>
          <div className="author-meta">
            {record.isAnonymous ? (
              <Tag size="small">匿名</Tag>
            ) : (
              <Text type="secondary">{record.author.className}</Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      render: (tags: string[]) => (
        <Space wrap>
          {tags.slice(0, 2).map((tag, index) => (
            <Tag key={index} size="small" color="geekblue">
              {tag}
            </Tag>
          ))}
          {tags.length > 2 && (
            <Tag size="small">+{tags.length - 2}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: { [key: string]: { color: string; text: string } } = {
          'published': { color: 'green', text: '已发布' },
          'pending': { color: 'orange', text: '待审核' },
          'rejected': { color: 'red', text: '已拒绝' },
          'hidden': { color: 'gray', text: '已隐藏' },
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '统计',
      key: 'stats',
      width: 120,
      render: (_, record: any) => (
        <Space direction="vertical" size="small">
          <span>👁 {record.stats.views}</span>
          <span>❤️ {record.stats.likes}</span>
          <span>💬 {record.stats.comments}</span>
        </Space>
      ),
    },
    {
      title: '举报',
      key: 'reports',
      width: 80,
      render: (_, record: any) => (
        record.reportCount > 0 ? (
          <Badge count={record.reportCount}>
            <Button 
              type="text" 
              icon={<FlagOutlined />} 
              size="small"
              danger
            />
          </Badge>
        ) : (
          <span>-</span>
        )
      ),
    },
    {
      title: '发布时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_, record: any) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => handleViewPost(record)}
            />
          </Tooltip>
          
          {record.status === 'pending' && (
            <>
              <Tooltip title="审核通过">
                <Popconfirm
                  title="确定要通过该帖子的审核吗？"
                  onConfirm={() => handleUpdateStatus(record.id, 'published')}
                >
                  <Button 
                    type="text" 
                    icon={<CheckOutlined />}
                    size="small"
                    style={{ color: '#52c41a' }}
                  />
                </Popconfirm>
              </Tooltip>
              
              <Tooltip title="审核拒绝">
                <Popconfirm
                  title="确定要拒绝该帖子吗？"
                  onConfirm={() => handleUpdateStatus(record.id, 'rejected')}
                >
                  <Button 
                    type="text" 
                    icon={<CloseOutlined />}
                    size="small"
                    danger
                  />
                </Popconfirm>
              </Tooltip>
            </>
          )}
          
          {record.status === 'published' && (
            <Tooltip title="隐藏帖子">
              <Popconfirm
                title="确定要隐藏该帖子吗？"
                onConfirm={() => handleUpdateStatus(record.id, 'hidden')}
              >
                <Button 
                  type="text" 
                  icon={<ExclamationCircleOutlined />}
                  size="small"
                  style={{ color: '#faad14' }}
                />
              </Popconfirm>
            </Tooltip>
          )}
          
          <Tooltip title="删除帖子">
            <Popconfirm
              title="确定要删除该帖子吗？此操作不可恢复！"
              onConfirm={() => handleDeletePost(record.id)}
            >
              <Button 
                type="text" 
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleViewPost = (post: any) => {
    setCurrentPost(post);
    setPostDetailVisible(true);
  };

  const handleUpdateStatus = async (postId: string, status: string) => {
    try {
      await dispatch(updatePostStatus({ postId, status })).unwrap();
      message.success('状态更新成功');
      dispatch(fetchAdminPosts({ page: 1, limit: 20, search: searchText, ...filters }));
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await dispatch(deletePost(postId)).unwrap();
      message.success('帖子删除成功');
      dispatch(fetchAdminPosts({ page: 1, limit: 20, search: searchText, ...filters }));
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleBatchApprove = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要审核的帖子');
      return;
    }

    Modal.confirm({
      title: '批量审核通过',
      content: `确定要通过选中的 ${selectedRowKeys.length} 个帖子吗？`,
      onOk: async () => {
        try {
          // 实现批量审核逻辑
          message.success('批量审核成功');
          setSelectedRowKeys([]);
        } catch (error) {
          message.error('批量审核失败');
        }
      },
    });
  };

  const handleBatchReject = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要拒绝的帖子');
      return;
    }

    Modal.confirm({
      title: '批量审核拒绝',
      content: `确定要拒绝选中的 ${selectedRowKeys.length} 个帖子吗？`,
      onOk: async () => {
        try {
          // 实现批量拒绝逻辑
          message.success('批量拒绝成功');
          setSelectedRowKeys([]);
        } catch (error) {
          message.error('批量操作失败');
        }
      },
    });
  };

  const handleExport = () => {
    // 实现导出帖子数据逻辑
    message.info('正在导出帖子数据...');
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  const categories = [
    '校园生活', '学习交流', '求助互助', '情感倾诉', 
    '失物招领', '二手交易', '校园活动', '其他'
  ];

  return (
    <div className="post-management">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="总帖子数"
              value={postStats?.total || 0}
              prefix="📝"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="待审核"
              value={postStats?.pending || 0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="今日新增"
              value={postStats?.todayNew || 0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="被举报"
              value={postStats?.reported || 0}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 帖子列表 */}
      <Card title="帖子列表" className="post-list-card">
        {/* 工具栏 */}
        <div className="toolbar">
          <div className="toolbar-left">
            <Space>
              <Search
                placeholder="搜索帖子标题、内容、作者"
                allowClear
                onSearch={handleSearch}
                style={{ width: 300 }}
              />
              
              <Select
                placeholder="审核状态"
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                style={{ width: 120 }}
                allowClear
              >
                <Option value="published">已发布</Option>
                <Option value="pending">待审核</Option>
                <Option value="rejected">已拒绝</Option>
                <Option value="hidden">已隐藏</Option>
              </Select>
              
              <Select
                placeholder="帖子分类"
                value={filters.category}
                onChange={(value) => setFilters({ ...filters, category: value })}
                style={{ width: 120 }}
                allowClear
              >
                {categories.map(category => (
                  <Option key={category} value={category}>
                    {category}
                  </Option>
                ))}
              </Select>
              
              <Select
                placeholder="举报状态"
                value={filters.isReported}
                onChange={(value) => setFilters({ ...filters, isReported: value })}
                style={{ width: 120 }}
                allowClear
              >
                <Option value="true">有举报</Option>
                <Option value="false">无举报</Option>
              </Select>
              
              <RangePicker
                value={filters.dateRange}
                onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              />
            </Space>
          </div>
          
          <div className="toolbar-right">
            <Space>
              <Button 
                icon={<ReloadOutlined />}
                onClick={() => dispatch(fetchAdminPosts({ page: 1, limit: 20 }))}
              >
                刷新
              </Button>
              
              <Button 
                icon={<ExportOutlined />}
                onClick={handleExport}
              >
                导出
              </Button>
              
              {selectedRowKeys.length > 0 && (
                <Space>
                  <Button 
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={handleBatchApprove}
                  >
                    批量通过({selectedRowKeys.length})
                  </Button>
                  
                  <Button 
                    danger
                    icon={<CloseOutlined />}
                    onClick={handleBatchReject}
                  >
                    批量拒绝({selectedRowKeys.length})
                  </Button>
                </Space>
              )}
            </Space>
          </div>
        </div>

        {/* 帖子表格 */}
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={posts}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={{
            current: pagination.current,
            total: pagination.total,
            pageSize: pagination.pageSize,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
          rowClassName={(record) => 
            record.reportCount > 0 ? 'reported-row' : ''
          }
        />
      </Card>

      {/* 帖子详情抽屉 */}
      <PostDetailDrawer
        visible={postDetailVisible}
        post={currentPost}
        onClose={() => setPostDetailVisible(false)}
        onUpdate={() => {
          dispatch(fetchAdminPosts({ page: 1, limit: 20, search: searchText, ...filters }));
        }}
      />
    </div>
  );
};

export default PostManagement;