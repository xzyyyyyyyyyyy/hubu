import React, { useEffect, useState } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Select, 
  DatePicker,
  Space,
  Typography,
  Button,
  Table,
  Progress,
  Tag,
  Tooltip
} from 'antd';
import { 
  UserOutlined,
  FileTextOutlined,
  ShopOutlined,
  TruckOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DownloadOutlined,
  ReloadOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { Line, Column, Pie, Area } from '@ant-design/plots';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchReportsOverview } from '../../../../store/slices/adminSlice';
import moment from 'moment';
import './index.less';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ReportsOverview: React.FC = () => {
  const dispatch = useAppDispatch();
  const { reportsData, loading } = useAppSelector(state => state.admin);
  
  const [timeRange, setTimeRange] = useState('30d');
  const [dateRange, setDateRange] = useState<any>([
    moment().subtract(30, 'days'),
    moment()
  ]);

  useEffect(() => {
    dispatch(fetchReportsOverview({ 
      timeRange,
      startDate: dateRange[0]?.format('YYYY-MM-DD'),
      endDate: dateRange[1]?.format('YYYY-MM-DD')
    }));
  }, [dispatch, timeRange, dateRange]);

  // 核心指标数据
  const coreMetrics = [
    {
      title: '总用户数',
      value: reportsData?.overview?.totalUsers || 0,
      prefix: <UserOutlined />,
      suffix: '人',
      growth: reportsData?.overview?.userGrowth || 0,
      color: '#3f8600'
    },
    {
      title: '活跃用户',
      value: reportsData?.overview?.activeUsers || 0,
      prefix: <UserOutlined />,
      suffix: '人',
      growth: reportsData?.overview?.activeUserGrowth || 0,
      color: '#1890ff'
    },
    {
      title: '总帖子数',
      value: reportsData?.overview?.totalPosts || 0,
      prefix: <FileTextOutlined />,
      suffix: '篇',
      growth: reportsData?.overview?.postGrowth || 0,
      color: '#722ed1'
    },
    {
      title: '今日活跃',
      value: reportsData?.overview?.todayActive || 0,
      prefix: <CalendarOutlined />,
      suffix: '人',
      growth: reportsData?.overview?.todayActiveGrowth || 0,
      color: '#f5222d'
    }
  ];

  // 用户增长趋势图表配置
  const userGrowthConfig = {
    data: reportsData?.userGrowthTrend || [],
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    color: ['#1890ff', '#52c41a', '#faad14'],
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      shared: true,
      showCrosshairs: true,
    },
  };

  // 内容发布趋势图表配置
  const contentTrendConfig = {
    data: reportsData?.contentTrend || [],
    xField: 'date',
    yField: 'count',
    seriesField: 'category',
    isStack: true,
    color: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'],
    legend: {
      position: 'top' as const,
    },
  };

  // 用户活跃度分布图表配置
  const userActivityConfig = {
    data: reportsData?.userActivityDistribution || [],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name}: {percentage}',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  // 平台数据概览图表配置
  const platformOverviewConfig = {
    data: reportsData?.platformOverview || [],
    xField: 'date',
    yField: 'value',
    smooth: true,
    areaStyle: {
      fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
    },
    line: {
      color: '#1890ff',
    },
  };

  // 热门内容表格列
  const hotContentColumns = [
    {
      title: '内容标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <div>
          <div className="content-title">{text}</div>
          <div className="content-meta">
            <Tag color="blue">{record.type}</Tag>
            <Text type="secondary">{record.author}</Text>
          </div>
        </div>
      ),
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      sorter: true,
      render: (views: number) => (
        <Statistic value={views} valueStyle={{ fontSize: 14 }} />
      ),
    },
    {
      title: '互动数',
      dataIndex: 'interactions',
      key: 'interactions',
      sorter: true,
      render: (interactions: number) => (
        <Statistic value={interactions} valueStyle={{ fontSize: 14 }} />
      ),
    },
    {
      title: '热度',
      dataIndex: 'popularity',
      key: 'popularity',
      render: (popularity: number) => (
        <Progress 
          percent={popularity} 
          size="small" 
          status={popularity > 80 ? 'success' : 'normal'}
        />
      ),
    },
  ];

  const handleExport = () => {
    // 实现导出报表功能
    const link = document.createElement('a');
    link.href = `/api/admin/reports/export?timeRange=${timeRange}&startDate=${dateRange[0]?.format('YYYY-MM-DD')}&endDate=${dateRange[1]?.format('YYYY-MM-DD')}`;
    link.download = `platform_report_${moment().format('YYYY-MM-DD')}.xlsx`;
    link.click();
  };

  return (
    <div className="reports-overview">
      {/* 页面头部 */}
      <div className="reports-header">
        <div className="header-left">
          <Title level={3}>数据报表总览</Title>
          <Text type="secondary">
            数据更新时间：{moment().format('YYYY-MM-DD HH:mm:ss')}
          </Text>
        </div>
        
        <div className="header-right">
          <Space>
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
              onClick={() => dispatch(fetchReportsOverview({ timeRange }))}
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

      {/* 核心指标卡片 */}
      <Row gutter={[16, 16]} className="metrics-row">
        {coreMetrics.map((metric, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="metric-card">
              <Statistic
                title={metric.title}
                value={metric.value}
                prefix={metric.prefix}
                suffix={metric.suffix}
                valueStyle={{ color: metric.color }}
              />
              <div className="metric-growth">
                {metric.growth > 0 ? (
                  <Space>
                    <ArrowUpOutlined style={{ color: '#3f8600' }} />
                    <Text type="success">+{metric.growth}%</Text>
                  </Space>
                ) : metric.growth < 0 ? (
                  <Space>
                    <ArrowDownOutlined style={{ color: '#cf1322' }} />
                    <Text type="danger">{metric.growth}%</Text>
                  </Space>
                ) : (
                  <Text type="secondary">无变化</Text>
                )}
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  vs 上期
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* 用户增长趋势 */}
        <Col xs={24} lg={12}>
          <Card title="用户增长趋势" className="chart-card">
            <Line {...userGrowthConfig} height={300} />
          </Card>
        </Col>

        {/* 内容发布趋势 */}
        <Col xs={24} lg={12}>
          <Card title="内容发布趋势" className="chart-card">
            <Column {...contentTrendConfig} height={300} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 用户活跃度分布 */}
        <Col xs={24} lg={8}>
          <Card title="用户活跃度分布" className="chart-card">
            <Pie {...userActivityConfig} height={300} />
          </Card>
        </Col>

        {/* 平台数据概览 */}
        <Col xs={24} lg={16}>
          <Card title="平台访问量趋势" className="chart-card">
            <Area {...platformOverviewConfig} height={300} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 热门内容排行 */}
        <Col xs={24} lg={16}>
          <Card 
            title="热门内容排行" 
            extra={<Button type="link">查看更多</Button>}
            className="table-card"
          >
            <Table
              dataSource={reportsData?.hotContent || []}
              columns={hotContentColumns}
              pagination={{ pageSize: 10 }}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>

        {/* 关键指标摘要 */}
        <Col xs={24} lg={8}>
          <Card title="关键指标摘要" className="summary-card">
            <div className="summary-item">
              <div className="summary-label">用户留存率</div>
              <div className="summary-value">
                <Statistic 
                  value={reportsData?.summary?.retentionRate || 0} 
                  suffix="%" 
                  valueStyle={{ fontSize: 20 }}
                />
              </div>
              <Progress 
                percent={reportsData?.summary?.retentionRate || 0} 
                showInfo={false}
                strokeColor="#52c41a"
              />
            </div>

            <div className="summary-item">
              <div className="summary-label">日均活跃用户</div>
              <div className="summary-value">
                <Statistic 
                  value={reportsData?.summary?.dailyActiveUsers || 0} 
                  valueStyle={{ fontSize: 20 }}
                />
              </div>
              <Progress 
                percent={(reportsData?.summary?.dailyActiveUsers || 0) / (reportsData?.overview?.totalUsers || 1) * 100} 
                showInfo={false}
                strokeColor="#1890ff"
              />
            </div>

            <div className="summary-item">
              <div className="summary-label">内容质量评分</div>
              <div className="summary-value">
                <Statistic 
                  value={reportsData?.summary?.contentQualityScore || 0} 
                  suffix="/10" 
                  valueStyle={{ fontSize: 20 }}
                />
              </div>
              <Progress 
                percent={(reportsData?.summary?.contentQualityScore || 0) * 10} 
                showInfo={false}
                strokeColor="#722ed1"
              />
            </div>

            <div className="summary-item">
              <div className="summary-label">平台健康度</div>
              <div className="summary-value">
                <Statistic 
                  value={reportsData?.summary?.platformHealth || 0} 
                  suffix="%" 
                  valueStyle={{ fontSize: 20 }}
                />
              </div>
              <Progress 
                percent={reportsData?.summary?.platformHealth || 0} 
                showInfo={false}
                strokeColor="#faad14"
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReportsOverview;