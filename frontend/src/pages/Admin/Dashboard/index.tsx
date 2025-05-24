import React, { useEffect, useState } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  List, 
  Progress,
  Space,
  Tag,
  Typography,
  Button,
  Select,
  DatePicker,
  Alert
} from 'antd';
import { 
  UserOutlined,
  FileTextOutlined,
  ShopOutlined,
  TruckOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  MessageOutlined,
  LikeOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/plots';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchDashboardData } from '../../../store/slices/adminSlice';
import './index.less';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dashboardData, loading } = useAppSelector(state => state.admin);
  
  const [dateRange, setDateRange] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    dispatch(fetchDashboardData({ timeRange }));
  }, [dispatch, timeRange]);

  // 统计卡片数据
  const statisticsCards = [
    {
      title: '总用户数',
      value: dashboardData?.stats?.totalUsers || 0,
      prefix: <UserOutlined />,
      suffix: '人',
      precision: 0,
      valueStyle: { color: '#3f8600' },
      growth: dashboardData?.stats?.userGrowth || 0,
    },
    {
      title: '总帖子数',
      value: dashboardData?.stats?.totalPosts || 0,
      prefix: <FileTextOutlined />,
      suffix: '篇',
      precision: 0,
      valueStyle: { color: '#1890ff' },
      growth: dashboardData?.stats?.postGrowth || 0,
    },
    {
      title: '商品数量',
      value: dashboardData?.stats?.totalMarketItems || 0,
      prefix: <ShopOutlined />,
      suffix: '件',
      precision: 0,
      valueStyle: { color: '#cf1322' },
      growth: dashboardData?.stats?.marketGrowth || 0,
    },
    {
      title: '快递订单',
      value: dashboardData?.stats?.totalExpressOrders || 0,
      prefix: <TruckOutlined />,
      suffix: '单',
      precision: 0,
      valueStyle: { color: '#722ed1' },
      growth: dashboardData?.stats?.expressGrowth || 0,
    },
  ];

  // 用户活跃度图表配置
  const userActivityConfig = {
    data: dashboardData?.userActivity || [],
    xField: 'date',
    yField: 'count',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  // 内容分布图表配置
  const contentDistributionConfig = {
    data: dashboardData?.contentDistribution || [],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  // 最新用户表格列
  const recentUsersColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text: string, record: any) => (
        <Space>
          <div>{text}</div>
          {record.isStudentVerified && (
            <Tag color="blue" size="small">已认证</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '禁用'}
        </Tag>
      ),
    },
  ];

  // 待处理事项列
  const pendingTasksColumns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: { [key: string]: { text: string; color: string } } = {
          'user_verification': { text: '用户认证', color: 'blue' },
          'content_report': { text: '内容举报', color: 'orange' },
          'appeal': { text: '申诉处理', color: 'red' },
        };
        const config = typeMap[type] || { text: type, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: any) => (
        <Button type="link" size="small">
          处理
        </Button>
      ),
    },
  ];

  return (
    <div className="admin-dashboard">
      {/* 页面头部 */}
      <div className="dashboard-header">
        <Title level={3}>仪表盘</Title>
        <div className="header-actions">
          <Space>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 120 }}
            >
              <Option value="1d">今天</Option>
              <Option value="7d">近7天</Option>
              <Option value="30d">近30天</Option>
              <Option value="90d">近90天</Option>
            </Select>
            <RangePicker 
              value={dateRange}
              onChange={setDateRange}
            />
          </Space>
        </div>
      </div>

      {/* 系统警告 */}
      {dashboardData?.systemAlerts && dashboardData.systemAlerts.length > 0 && (
        <Alert
          message="系统提醒"
          description={
            <ul>
              {dashboardData.systemAlerts.map((alert, index) => (
                <li key={index}>{alert}</li>
              ))}
            </ul>
          }
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="statistics-row">
        {statisticsCards.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="statistics-card">
              <Statistic
                title={card.title}
                value={card.value}
                precision={card.precision}
                valueStyle={card.valueStyle}
                prefix={card.prefix}
                suffix={card.suffix}
              />
              <div className="growth-indicator">
                {card.growth > 0 ? (
                  <Space>
                    <ArrowUpOutlined style={{ color: '#3f8600' }} />
                    <Text type="success">+{card.growth}%</Text>
                  </Space>
                ) : card.growth < 0 ? (
                  <Space>
                    <ArrowDownOutlined style={{ color: '#cf1322' }} />
                    <Text type="danger">{card.growth}%</Text>
                  </Space>
                ) : (
                  <Text type="secondary">无变化</Text>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* 用户活跃度图表 */}
        <Col xs={24} lg={16}>
          <Card title="用户活跃度趋势" className="chart-card">
            <Line {...userActivityConfig} height={300} />
          </Card>
        </Col>

        {/* 内容分布图表 */}
        <Col xs={24} lg={8}>
          <Card title="内容类型分布" className="chart-card">
            <Pie {...contentDistributionConfig} height={300} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 最新注册用户 */}
        <Col xs={24} lg={12}>
          <Card 
            title="最新注册用户" 
            extra={<Button type="link">查看全部</Button>}
            className="table-card"
          >
            <Table
              dataSource={dashboardData?.recentUsers || []}
              columns={recentUsersColumns}
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>

        {/* 待处理事项 */}
        <Col xs={24} lg={12}>
          <Card 
            title="待处理事项" 
            extra={
              <Space>
                <Tag color="red">{dashboardData?.pendingTasks?.length || 0}</Tag>
                <Button type="link">查看全部</Button>
              </Space>
            }
            className="table-card"
          >
            <Table
              dataSource={dashboardData?.pendingTasks || []}
              columns={pendingTasksColumns}
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 热门内容 */}
        <Col xs={24} lg={8}>
          <Card title="热门帖子" className="list-card">
            <List
              dataSource={dashboardData?.hotPosts || []}
              loading={loading}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <div className="post-title">
                        {item.title}
                      </div>
                    }
                    description={
                      <Space>
                        <span><EyeOutlined /> {item.views}</span>
                        <span><LikeOutlined /> {item.likes}</span>
                        <span><MessageOutlined /> {item.comments}</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 系统性能 */}
        <Col xs={24} lg={8}>
          <Card title="系统性能" className="performance-card">
            <div className="performance-item">
              <div className="performance-label">CPU使用率</div>
              <Progress 
                percent={dashboardData?.systemPerformance?.cpu || 0} 
                status={dashboardData?.systemPerformance?.cpu > 80 ? 'exception' : 'normal'}
              />
            </div>
            
            <div className="performance-item">
              <div className="performance-label">内存使用率</div>
              <Progress 
                percent={dashboardData?.systemPerformance?.memory || 0}
                status={dashboardData?.systemPerformance?.memory > 80 ? 'exception' : 'normal'}
              />
            </div>
            
            <div className="performance-item">
              <div className="performance-label">磁盘使用率</div>
              <Progress 
                percent={dashboardData?.systemPerformance?.disk || 0}
                status={dashboardData?.systemPerformance?.disk > 90 ? 'exception' : 'normal'}
              />
            </div>
            
            <div className="performance-item">
              <div className="performance-label">数据库连接</div>
              <Progress 
                percent={dashboardData?.systemPerformance?.database || 0}
                status={dashboardData?.systemPerformance?.database > 90 ? 'exception' : 'normal'}
              />
            </div>
          </Card>
        </Col>

        {/* 快速操作 */}
        <Col xs={24} lg={8}>
          <Card title="快速操作" className="quick-actions-card">
            <div className="quick-actions">
              <Button 
                type="primary" 
                block 
                style={{ marginBottom: 8 }}
                onClick={() => window.open('/admin/users', '_blank')}
              >
                用户管理
              </Button>
              
              <Button 
                block 
                style={{ marginBottom: 8 }}
                onClick={() => window.open('/admin/posts', '_blank')}
              >
                内容审核
              </Button>
              
              <Button 
                block 
                style={{ marginBottom: 8 }}
                onClick={() => window.open('/admin/verification', '_blank')}
              >
                认证审核
              </Button>
              
              <Button 
                block
                onClick={() => window.open('/admin/settings', '_blank')}
              >
                系统设置
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;