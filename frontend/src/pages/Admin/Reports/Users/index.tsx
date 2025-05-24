import React, { useEffect, useState } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Table, 
  Select, 
  DatePicker,
  Space,
  Typography,
  Button,
  Tag,
  Progress,
  Tooltip,
  Statistic,
  Avatar
} from 'antd';
import { 
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
  TrophyOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Line, Column, Heatmap, Radar } from '@ant-design/plots';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchUserAnalytics } from '../../../../store/slices/adminSlice';
import moment from 'moment';
import './index.less';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const UserAnalytics: React.FC = () => {
  const dispatch = useAppDispatch();
  const { userAnalytics, loading } = useAppSelector(state => state.admin);
  
  const [timeRange, setTimeRange] = useState('30d');
  const [dateRange, setDateRange] = useState<any>([
    moment().subtract(30, 'days'),
    moment()
  ]);
  const [userSegment, setUserSegment] = useState('all');

  useEffect(() => {
    dispatch(fetchUserAnalytics({ 
      timeRange,
      userSegment,
      startDate: dateRange[0]?.format('YYYY-MM-DD'),
      endDate: dateRange[1]?.format('YYYY-MM-DD')
    }));
  }, [dispatch, timeRange, userSegment, dateRange]);

  // 用户注册趋势图表配置
  const registrationTrendConfig = {
    data: userAnalytics?.registrationTrend || [],
    xField: 'date',
    yField: 'count',
    smooth: true,
    color: '#1890ff',
    point: {
      size: 3,
      shape: 'circle',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
    tooltip: {
      showMarkers: false,
    },
    state: {
      active: {
        style: {
          shadowColor: 'yellow',
          shadowBlur: 4,
          stroke: 'transparent',
          fill: 'red',
        },
      },
    },
  };

  // 用户活跃度分布图表配置
  const userActivityHeatmapConfig = {
    data: userAnalytics?.activityHeatmap || [],
    xField: 'hour',
    yField: 'day',
    colorField: 'value',
    color: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'],
    meta: {
      hour: {
        type: 'cat',
      },
      day: {
        type: 'cat',
      },
    },
    tooltip: {
      showTitle: false,
      formatter: (data: any) => {
        return {
          name: '活跃用户数',
          value: data.value,
        };
      },
    },
  };

  // 用户分布图表配置
  const userDistributionConfig = {
    data: userAnalytics?.userDistribution || [],
    xField: 'category',
    yField: 'count',
    seriesField: 'type',
    isGroup: true,
    color: ['#1890ff', '#52c41a', '#faad14'],
  };

  // 用户画像雷达图配置
  const userProfileConfig = {
    data: userAnalytics?.userProfile || [],
    xField: 'dimension',
    yField: 'score',
    area: {
      smooth: true,
    },
    line: {
      smooth: true,
    },
    point: {
      size: 2,
    },
  };

  // 活跃用户排行表格列
  const activeUsersColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 60,
      render: (_: any, record: any, index: number) => (
        <div className="rank-badge">
          {index + 1}
        </div>
      ),
    },
    {
      title: '用户',
      key: 'user',
      render: (_, record: any) => (
        <div className="user-info">
          <Avatar 
            src={record.avatar} 
            icon={<UserOutlined />}
            size="small"
          />
          <div className="user-details">
            <div className="username">{record.username}</div>
            <div className="user-meta">
              <Tag color="blue" size="small">
                {record.isStudentVerified ? '已认证' : '未认证'}
              </Tag>
              {record.isBlueCardMember && (
                <Tag color="gold" size="small">蓝卡</Tag>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '活跃度',
      dataIndex: 'activityScore',
      key: 'activityScore',
      render: (score: number) => (
        <div>
          <Progress 
            percent={score} 
            size="small" 
            format={(percent) => `${percent}分`}
          />
        </div>
      ),
    },
    {
      title: '发帖数',
      dataIndex: 'postsCount',
      key: 'postsCount',
      sorter: true,
    },
    {
      title: '评论数',
      dataIndex: 'commentsCount',
      key: 'commentsCount',
      sorter: true,
    },
    {
      title: '获赞数',
      dataIndex: 'likesReceived',
      key: 'likesReceived',
      sorter: true,
    },
    {
      title: '声望值',
      dataIndex: 'reputation',
      key: 'reputation',
      sorter: true,
      render: (reputation: number) => (
        <div className="reputation-score">
          <TrophyOutlined style={{ color: '#faad14' }} />
          <span>{reputation}</span>
        </div>
      ),
    },
    {
      title: '最后活跃',
      dataIndex: 'lastActiveAt',
      key: 'lastActiveAt',
      render: (date: string) => (
        <Tooltip title={moment(date).format('YYYY-MM-DD HH:mm:ss')}>
          {moment(date).fromNow()}
        </Tooltip>
      ),
    },
  ];

  // 用户增长表格列
  const userGrowthColumns = [
    {
      title: '时间段',
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: '新增用户',
      dataIndex: 'newUsers',
      key: 'newUsers',
      render: (count: number, record: any) => (
        <div>
          <div>{count}</div>
          <div className="growth-rate">
            {record.growthRate > 0 ? '+' : ''}{record.growthRate}%
          </div>
        </div>
      ),
    },
    {
      title: '活跃用户',
      dataIndex: 'activeUsers',
      key: 'activeUsers',
    },
    {
      title: '留存率',
      dataIndex: 'retentionRate',
      key: 'retentionRate',
      render: (rate: number) => (
        <Progress 
          percent={rate} 
          size="small" 
          format={(percent) => `${percent}%`}
        />
      ),
    },
    {
      title: '流失率',
      dataIndex: 'churnRate',
      key: 'churnRate',
      render: (rate: number) => (
        <Progress 
          percent={rate} 
          size="small" 
          strokeColor="#f5222d"
          format={(percent) => `${percent}%`}
        />
      ),
    },
  ];

  const handleExport = () => {
    // 实现导出用户分析报表功能
    const link = document.createElement('a');
    link.href = `/api/admin/reports/users/export?timeRange=${timeRange}&segment=${userSegment}&startDate=${dateRange[0]?.format('YYYY-MM-DD')}&endDate=${dateRange[1]?.format('YYYY-MM-DD')}`;
    link.download = `user_analytics_${moment().format('YYYY-MM-DD')}.xlsx`;
    link.click();
  };

  return (
    <div className="user-analytics">
      {/* 页面头部 */}
      <div className="analytics-header">
        <div className="header-left">
          <Title level={3}>用户分析报表</Title>
          <Text type="secondary">
            深入了解用户行为和平台使用情况
          </Text>
        </div>
        
        <div className="header-right">
          <Space>
            <Select
              value={userSegment}
              onChange={setUserSegment}
              style={{ width: 120 }}
            >
              <Option value="all">全部用户</Option>
              <Option value="new">新用户</Option>
              <Option value="active">活跃用户</Option>
              <Option value="verified">认证用户</Option>
            </Select>
            
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 120 }}
            >
              <Option value="7d">近7天</Option>
              <Option value="30d">近30天</Option>
              <Option value="90d">近90天</Option>
              <Option value="1y">近1年</Option>
            </Select>
            
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="YYYY-MM-DD"
            />
            
            <Button
              icon={<ReloadOutlined />}
              onClick={() => dispatch(fetchUserAnalytics({ timeRange, userSegment }))}
            >
              刷新
            </Button>
            
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              导出报表
            </Button>
          </Space>
        </div>
      </div>

      {/* 用户概览指标 */}
      <Row gutter={[16, 16]} className="overview-metrics">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={userAnalytics?.overview?.totalUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={userAnalytics?.overview?.activeUsers || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="认证用户"
              value={userAnalytics?.overview?.verifiedUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="蓝卡会员"
              value={userAnalytics?.overview?.blueCardMembers || 0}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 用户注册趋势 */}
        <Col xs={24} lg={12}>
          <Card title="用户注册趋势" className="chart-card">
            <Line {...registrationTrendConfig} height={300} />
          </Card>
        </Col>

        {/* 用户分布分析 */}
        <Col xs={24} lg={12}>
          <Card title="用户分布分析" className="chart-card">
            <Column {...userDistributionConfig} height={300} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 用户活跃度热力图 */}
        <Col xs={24} lg={16}>
          <Card title="用户活跃度热力图" className="chart-card">
            <Heatmap {...userActivityHeatmapConfig} height={300} />
          </Card>
        </Col>

        {/* 用户画像分析 */}
        <Col xs={24} lg={8}>
          <Card title="用户画像分析" className="chart-card">
            <Radar {...userProfileConfig} height={300} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 活跃用户排行 */}
        <Col xs={24} lg={16}>
          <Card 
            title="活跃用户排行榜" 
            extra={<Button type="link">查看更多</Button>}
            className="table-card"
          >
            <Table
              dataSource={userAnalytics?.activeUsersRanking || []}
              columns={activeUsersColumns}
              pagination={{ pageSize: 10 }}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>

        {/* 用户增长数据 */}
        <Col xs={24} lg={8}>
          <Card title="用户增长数据" className="table-card">
            <Table
              dataSource={userAnalytics?.userGrowthData || []}
              columns={userGrowthColumns}
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserAnalytics;