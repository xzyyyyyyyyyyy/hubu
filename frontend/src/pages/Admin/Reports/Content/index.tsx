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
  Avatar,
  Rate
} from 'antd';
import { 
  FileTextOutlined,
  LikeOutlined,
  MessageOutlined,
  EyeOutlined,
  DownloadOutlined,
  ReloadOutlined,
  FireOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { Line, Column, Pie, WordCloud } from '@ant-design/plots';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchContentAnalytics } from '../../../../store/slices/adminSlice';
import moment from 'moment';
import './index.less';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ContentAnalytics: React.FC = () => {
  const dispatch = useAppDispatch();
  const { contentAnalytics, loading } = useAppSelector(state => state.admin);
  
  const [timeRange, setTimeRange] = useState('30d');
  const [dateRange, setDateRange] = useState<any>([
    moment().subtract(30, 'days'),
    moment()
  ]);
  const [contentType, setContentType] = useState('all');

  useEffect(() => {
    dispatch(fetchContentAnalytics({ 
      timeRange,
      contentType,
      startDate: dateRange[0]?.format('YYYY-MM-DD'),
      endDate: dateRange[1]?.format('YYYY-MM-DD')
    }));
  }, [dispatch, timeRange, contentType, dateRange]);

  // 内容发布趋势图表配置
  const contentTrendConfig = {
    data: contentAnalytics?.contentTrend || [],
    xField: 'date',
    yField: 'count',
    seriesField: 'type',
    smooth: true,
    color: ['#1890ff', '#52c41a', '#faad14', '#f5222d'],
  };

  // 内容类型分布图表配置
  const contentDistributionConfig = {
    data: contentAnalytics?.contentDistribution || [],
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

  // 内容互动数据图表配置
  const interactionTrendConfig = {
    data: contentAnalytics?.interactionTrend || [],
    xField: 'date',
    yField: 'count',
    seriesField: 'type',
    isStack: true,
    color: ['#1890ff', '#52c41a', '#faad14'],
  };

  // 热词云图配置
  const wordCloudConfig = {
    data: contentAnalytics?.wordCloud || [],
    wordField: 'word',
    weightField: 'count',
    colorField: 'word',
    wordStyle: {
      fontFamily: 'Verdana',
      fontSize: [8, 32],
      rotation: 0,
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
    state: {
      active: {
        style: {
          lineWidth: 3,
        },
      },
    },
  };

  // 热门内容表格列
  const hotContentColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 60,
      render: (_: any, record: any, index: number) => {
        const rankColors = ['#f5222d', '#fa8c16', '#faad14'];
        return (
          <div 
            className="rank-badge"
            style={{ 
              backgroundColor: index < 3 ? rankColors[index] : '#d9d9d9',
              color: 'white'
            }}
          >
            {index + 1}
          </div>
        );
      },
    },
    {
      title: '内容信息',
      key: 'content',
      render: (_, record: any) => (
        <div className="content-info">
          <div className="content-title">{record.title}</div>
          <div className="content-meta">
            <Space>
              <Tag color="blue">{record.category}</Tag>
              <Text type="secondary">{record.author}</Text>
              <Text type="secondary">
                {moment(record.createdAt).format('MM-DD HH:mm')}
              </Text>
            </Space>
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
        <div className="stat-cell">
          <EyeOutlined />
          <span>{views.toLocaleString()}</span>
        </div>
      ),
    },
    {
      title: '点赞数',
      dataIndex: 'likes',
      key: 'likes',
      sorter: true,
      render: (likes: number) => (
        <div className="stat-cell">
          <LikeOutlined style={{ color: '#f5222d' }} />
          <span>{likes.toLocaleString()}</span>
        </div>
      ),
    },
    {
      title: '评论数',
      dataIndex: 'comments',
      key: 'comments',
      sorter: true,
      render: (comments: number) => (
        <div className="stat-cell">
          <MessageOutlined style={{ color: '#52c41a' }} />
          <span>{comments.toLocaleString()}</span>
        </div>
      ),
    },
    {
      title: '热度',
      dataIndex: 'popularity',
      key: 'popularity',
      render: (popularity: number) => (
        <div className="popularity-cell">
          <FireOutlined style={{ color: '#faad14' }} />
          <Progress 
            percent={popularity} 
            size="small" 
            showInfo={false}
            strokeColor={{
              '0%': '#faad14',
              '100%': '#f5222d',
            }}
          />
          <span>{popularity}%</span>
        </div>
      ),
    },
  ];

  // 内容质量分析表格列
  const contentQualityColumns = [
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      ),
    },
    {
      title: '总数量',
      dataIndex: 'totalCount',
      key: 'totalCount',
    },
    {
      title: '优质内容',
      dataIndex: 'qualityCount',
      key: 'qualityCount',
      render: (count: number, record: any) => (
        <div>
          <span>{count}</span>
          <span style={{ color: '#52c41a', marginLeft: 8 }}>
            ({((count / record.totalCount) * 100).toFixed(1)}%)
          </span>
        </div>
      ),
    },
    {
      title: '平均互动率',
      dataIndex: 'avgInteractionRate',
      key: 'avgInteractionRate',
      render: (rate: number) => (
        <Progress 
          percent={rate} 
          size="small" 
          format={(percent) => `${percent}%`}
        />
      ),
    },
    {
      title: '质量评分',
      dataIndex: 'qualityScore',
      key: 'qualityScore',
      render: (score: number) => (
        <Rate 
          disabled 
          value={score} 
          allowHalf 
          style={{ fontSize: 14 }}
        />
      ),
    },
  ];

  const handleExport = () => {
    // 实现导出内容分析报表功能
    const link = document.createElement('a');
    link.href = `/api/admin/reports/content/export?timeRange=${timeRange}&type=${contentType}&startDate=${dateRange[0]?.format('YYYY-MM-DD')}&endDate=${dateRange[1]?.format('YYYY-MM-DD')}`;
    link.download = `content_analytics_${moment().format('YYYY-MM-DD')}.xlsx`;
    link.click();
  };

  return (
    <div className="content-analytics">
      {/* 页面头部 */}
      <div className="analytics-header">
        <div className="header-left">
          <Title level={3}>内容分析报表</Title>
          <Text type="secondary">
            分析平台内容质量和用户互动情况
          </Text>
        </div>
        
        <div className="header-right">
          <Space>
            <Select
              value={contentType}
              onChange={setContentType}
              style={{ width: 120 }}
            >
              <Option value="all">全部内容</Option>
              <Option value="posts">帖子</Option>
              <Option value="market">商品</Option>
              <Option value="lostfound">失物招领</Option>
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
              onClick={() => dispatch(fetchContentAnalytics({ timeRange, contentType }))}
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

      {/* 内容概览指标 */}
      <Row gutter={[16, 16]} className="overview-metrics">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="总内容数"
              value={contentAnalytics?.overview?.totalContent || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="今日新增"
              value={contentAnalytics?.overview?.todayNew || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="总互动数"
              value={contentAnalytics?.overview?.totalInteractions || 0}
              prefix={<LikeOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="平均质量分"
              value={contentAnalytics?.overview?.avgQualityScore || 0}
              precision={1}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 内容发布趋势 */}
        <Col xs={24} lg={12}>
          <Card title="内容发布趋势" className="chart-card">
            <Line {...contentTrendConfig} height={300} />
          </Card>
        </Col>

        {/* 内容类型分布 */}
        <Col xs={24} lg={12}>
          <Card title="内容类型分布" className="chart-card">
            <Pie {...contentDistributionConfig} height={300} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 内容互动趋势 */}
        <Col xs={24} lg={16}>
          <Card title="内容互动趋势" className="chart-card">
            <Column {...interactionTrendConfig} height={300} />
          </Card>
        </Col>

        {/* 热门关键词 */}
        <Col xs={24} lg={8}>
          <Card title="热门关键词" className="chart-card">
            <WordCloud {...wordCloudConfig} height={300} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 热门内容排行 */}
        <Col xs={24} lg={16}>
          <Card 
            title="热门内容排行榜" 
            extra={<Button type="link">查看更多</Button>}
            className="table-card"
          >
            <Table
              dataSource={contentAnalytics?.hotContent || []}
              columns={hotContentColumns}
              pagination={{ pageSize: 10 }}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>

        {/* 内容质量分析 */}
        <Col xs={24} lg={8}>
          <Card title="内容质量分析" className="table-card">
            <Table
              dataSource={contentAnalytics?.qualityAnalysis || []}
              columns={contentQualityColumns}
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

export default ContentAnalytics;