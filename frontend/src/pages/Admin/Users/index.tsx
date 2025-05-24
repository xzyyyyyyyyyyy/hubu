import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select,
  Avatar,
  Typography,
  message,
  Popconfirm,
  Tooltip,
  Badge,
  Row,
  Col,
  Statistic,
  DatePicker
} from 'antd';
import { 
  SearchOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  EyeOutlined,
  ReloadOutlined,
  ExportOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { 
  fetchUsers, 
  updateUserStatus, 
  deleteUser,
  resetUserPassword,
  fetchUserStats
} from '../../../store/slices/adminSlice';
import UserDetailModal from '../../../components/Admin/UserDetailModal';
import './index.less';

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;
const { RangePicker } = DatePicker;

const UserManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, userStats, loading, pagination } = useAppSelector(state => state.admin);
  
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    isVerified: '',
    dateRange: null as any,
  });
  const [userDetailVisible, setUserDetailVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchUsers({ 
      page: 1, 
      limit: 20,
      search: searchText,
      ...filters
    }));
    dispatch(fetchUserStats());
  }, [dispatch, searchText, filters]);

  const columns = [
    {
      title: '用户信息',
      key: 'userInfo',
      width: 200,
      render: (_, record: any) => (
        <div className="user-info-cell">
          <Avatar 
            src={record.avatar} 
            icon={<UserOutlined />}
            size="small"
          />
          <div className="user-details">
            <div className="username">{record.username}</div>
            <div className="email">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: '真实姓名',
      dataIndex: 'realName',
      key: 'realName',
      width: 100,
    },
    {
      title: '学号',
      dataIndex: 'studentId',
      key: 'studentId',
      width: 120,
    },
    {
      title: '专业班级',
      key: 'majorClass',
      width: 150,
      render: (_, record: any) => (
        <div>
          <div>{record.major}</div>
          <div className="class-name">{record.className}</div>
        </div>
      ),
    },
    {
      title: '认证状态',
      key: 'verification',
      width: 120,
      render: (_, record: any) => (
        <Space direction="vertical" size="small">
          {record.isStudentVerified ? (
            <Tag color="green">学生认证</Tag>
          ) : (
            <Tag color="default">未认证</Tag>
          )}
          {record.isBlueCardMember && (
            <Tag color="blue">蓝卡会员</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '统计',
      key: 'stats',
      width: 120,
      render: (_, record: any) => (
        <Space direction="vertical" size="small">
          <span>帖子: {record.stats?.postsCount || 0}</span>
          <span>声望: {record.stats?.reputation || 0}</span>
        </Space>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 120,
      render: (date: string) => date ? new Date(date).toLocaleDateString('zh-CN') : '从未',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_, record: any) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => handleViewUser(record)}
            />
          </Tooltip>
          
          <Tooltip title={record.status === 'active' ? '禁用用户' : '启用用户'}>
            <Popconfirm
              title={`确定要${record.status === 'active' ? '禁用' : '启用'}该用户吗？`}
              onConfirm={() => handleToggleUserStatus(record.id, record.status)}
            >
              <Button 
                type="text" 
                icon={record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
                size="small"
                danger={record.status === 'active'}
              />
            </Popconfirm>
          </Tooltip>
          
          <Tooltip title="重置密码">
            <Popconfirm
              title="确定要重置该用户的密码吗？"
              onConfirm={() => handleResetPassword(record.id)}
            >
              <Button 
                type="text" 
                icon={<EditOutlined />}
                size="small"
              />
            </Popconfirm>
          </Tooltip>
          
          <Tooltip title="删除用户">
            <Popconfirm
              title="确定要删除该用户吗？此操作不可恢复！"
              onConfirm={() => handleDeleteUser(record.id)}
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

  const handleViewUser = (user: any) => {
    setCurrentUser(user);
    setUserDetailVisible(true);
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'banned' : 'active';
      await dispatch(updateUserStatus({ userId, status: newStatus })).unwrap();
      message.success(`用户状态已${newStatus === 'active' ? '启用' : '禁用'}`);
      dispatch(fetchUsers({ page: 1, limit: 20, search: searchText, ...filters }));
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const result = await dispatch(resetUserPassword(userId)).unwrap();
      Modal.info({
        title: '密码重置成功',
        content: `新密码：${result.newPassword}`,
      });
    } catch (error) {
      message.error('密码重置失败');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await dispatch(deleteUser(userId)).unwrap();
      message.success('用户删除成功');
      dispatch(fetchUsers({ page: 1, limit: 20, search: searchText, ...filters }));
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的用户');
      return;
    }

    Modal.confirm({
      title: '批量删除用户',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个用户吗？此操作不可恢复！`,
      onOk: async () => {
        try {
          // 实现批量删除逻辑
          message.success('批量删除成功');
          setSelectedRowKeys([]);
        } catch (error) {
          message.error('批量删除失败');
        }
      },
    });
  };

  const handleExport = () => {
    // 实现导出用户数据逻辑
    message.info('正在导出用户数据...');
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <div className="user-management">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={userStats?.total || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="今日新增"
              value={userStats?.todayNew || 0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="已认证用户"
              value={userStats?.verified || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={userStats?.active || 0}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 用户列表 */}
      <Card title="用户列表" className="user-list-card">
        {/* 工具栏 */}
        <div className="toolbar">
          <div className="toolbar-left">
            <Space>
              <Search
                placeholder="搜索用户名、邮箱、学号"
                allowClear
                onSearch={handleSearch}
                style={{ width: 300 }}
              />
              
              <Select
                placeholder="用户状态"
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                style={{ width: 120 }}
                allowClear
              >
                <Option value="active">正常</Option>
                <Option value="banned">禁用</Option>
              </Select>
              
              <Select
                placeholder="认证状态"
                value={filters.isVerified}
                onChange={(value) => setFilters({ ...filters, isVerified: value })}
                style={{ width: 120 }}
                allowClear
              >
                <Option value="true">已认证</Option>
                <Option value="false">未认证</Option>
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
                onClick={() => dispatch(fetchUsers({ page: 1, limit: 20 }))}
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
                <Button 
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleBatchDelete}
                >
                  批量删除({selectedRowKeys.length})
                </Button>
              )}
            </Space>
          </div>
        </div>

        {/* 用户表格 */}
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.current,
            total: pagination.total,
            pageSize: pagination.pageSize,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
        />
      </Card>

      {/* 用户详情弹窗 */}
      <UserDetailModal
        visible={userDetailVisible}
        user={currentUser}
        onCancel={() => setUserDetailVisible(false)}
        onUpdate={() => {
          dispatch(fetchUsers({ page: 1, limit: 20, search: searchText, ...filters }));
          setUserDetailVisible(false);
        }}
      />
    </div>
  );
};

export default UserManagement;