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
  Pagination,
  Empty,
  Spin,
  Slider,
  Badge,
  Typography,
  Tooltip,
  Affix
} from 'antd';
import { 
  PlusOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  FireOutlined,
  BankOutlined,
  UserOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchPartTimeJobs } from '../../store/slices/partTimeSlice';
import MainLayout from '../../components/Layout/MainLayout';
import PartTimeCard from '../../components/PartTimeCard';
import './index.less';

const { Content, Sider } = Layout;
const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const PartTime: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { jobs, loading, pagination } = useAppSelector(state => state.partTime);
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    salaryRange: [0, 10000] as [number, number],
    sort: searchParams.get('sort') || 'latest',
    search: searchParams.get('search') || '',
    urgent: searchParams.get('urgent') === 'true',
    page: parseInt(searchParams.get('page') || '1'),
  });

  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { key: '', label: '全部类型', icon: '📋' },
    { key: 'food', label: '餐饮服务', icon: '🍽️' },
    { key: 'retail', label: '零售销售', icon: '🛍️' },
    { key: 'education', label: '教育培训', icon: '📚' },
    { key: 'promotion', label: '推广宣传', icon: '📢' },
    { key: 'delivery', label: '配送跑腿', icon: '🚚' },
    { key: 'office', label: '办公文员', icon: '💼' },
    { key: 'entertainment', label: '娱乐服务', icon: '🎭' },
    { key: 'tech', label: '技术开发', icon: '💻' },
    { key: 'other', label: '其他类型', icon: '🔧' },
  ];

  const sortOptions = [
    { key: 'latest', label: '最新发布', icon: <ClockCircleOutlined /> },
    { key: 'salary_high', label: '薪资最高', icon: <DollarOutlined /> },
    { key: 'salary_low', label: '薪资最低', icon: <DollarOutlined /> },
    { key: 'popular', label: '申请最多', icon: <UserOutlined /> },
  ];

  useEffect(() => {
    const params = {
      page: filters.page,
      limit: 12,
      category: filters.category,
      location: filters.location,
      salaryMin: filters.salaryRange[0],
      salaryMax: filters.salaryRange[1],
      sort: filters.sort,
      search: filters.search,
      urgent: filters.urgent,
    };

    dispatch(fetchPartTimeJobs(params));
  }, [dispatch, filters]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    
    // 更新URL参数
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== false && (Array.isArray(v) ? v.some(Boolean) : true)) {
        if (Array.isArray(v)) {
          newSearchParams.set(k, v.join(','));
        } else {
          newSearchParams.set(k, v.toString());
        }
      }
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

  const clearFilters = () => {
    const resetFilters = {
      category: '',
      location: '',
      salaryRange: [0, 10000] as [number, number],
      sort: 'latest',
      search: '',
      urgent: false,
      page: 1,
    };
    setFilters(resetFilters);
    setSearchParams(new URLSearchParams());
  };

  return (
    <MainLayout>
      <div className="parttime-page">
        <Row gutter={[24, 24]}>
          {/* 筛选侧边栏 */}
          <Col xs={0} lg={6}>
            <Affix offsetTop={24}>
              <div className="parttime-filters">
                {/* 发布兼职按钮 */}
                {isAuthenticated && user?.isStudentVerified && (
                  <Card className="publish-card" size="small">
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => navigate('/parttime/create')}
                      block
                      size="large"
                    >
                      发布兼职
                    </Button>
                  </Card>
                )}

                {/* 筛选器 */}
                <Card title="筛选条件" size="small" className="filter-card">
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {/* 职位类型 */}
                    <div>
                      <Title level={5}>职位类型</Title>
                      <Select
                        value={filters.category}
                        onChange={(value) => handleFilterChange('category', value)}
                        style={{ width: '100%' }}
                        placeholder="选择类型"
                      >
                        {categories.map(cat => (
                          <Option key={cat.key} value={cat.key}>
                            <Space>
                              <span>{cat.icon}</span>
                              <span>{cat.label}</span>
                            </Space>
                          </Option>
                        ))}
                      </Select>
                    </div>

                    {/* 工作地点 */}
                    <div>
                      <Title level={5}>工作地点</Title>
                      <Input
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        placeholder="输入地点关键词"
                        prefix={<EnvironmentOutlined />}
                      />
                    </div>

                    {/* 薪资范围 */}
                    <div>
                      <Title level={5}>薪资范围 (元)</Title>
                      <Slider
                        range
                        min={0}
                        max={10000}
                        step={100}
                        value={filters.salaryRange}
                        onChange={(value) => handleFilterChange('salaryRange', value)}
                        tipFormatter={(value) => `${value}元`}
                      />
                      <div className="salary-range-text">
                        <Text type="secondary">
                          {filters.salaryRange[0]} - {filters.salaryRange[1]} 元
                        </Text>
                      </div>
                    </div>

                    {/* 紧急招聘 */}
                    <div>
                      <Button
                        type={filters.urgent ? 'primary' : 'default'}
                        icon={<FireOutlined />}
                        onClick={() => handleFilterChange('urgent', !filters.urgent)}
                        block
                      >
                        只看紧急招聘
                      </Button>
                    </div>

                    {/* 清除筛选 */}
                    <Button onClick={clearFilters} block>
                      清除筛选
                    </Button>
                  </Space>
                </Card>

                {/* 统计信息 */}
                <Card title="招聘统计" size="small" className="stats-card">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <div className="stat-item">
                        <div className="stat-number">{pagination.total}</div>
                        <div className="stat-label">招聘职位</div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="stat-item">
                        <div className="stat-number">
                          {jobs.filter(job => job.isUrgent).length}
                        </div>
                        <div className="stat-label">紧急招聘</div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </div>
            </Affix>
          </Col>

          {/* 主内容区 */}
          <Col xs={24} lg={18}>
            <div className="parttime-main">
              {/* 移动端筛选按钮 */}
              <div className="mobile-filter-btn">
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  筛选
                </Button>
              </div>

              {/* 头部操作栏 */}
              <Card className="parttime-header">
                <Row justify="space-between" align="middle">
                  <Col flex="1">
                    <Space size="middle">
                      <Search
                        placeholder="搜索兼职职位、公司名称..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        onSearch={(value) => handleFilterChange('search', value)}
                        style={{ width: 300 }}
                        allowClear
                      />
                      
                      <Select
                        value={filters.sort}
                        onChange={(value) => handleFilterChange('sort', value)}
                        style={{ width: 140 }}
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
                    <Space>
                      <Text type="secondary">
                        共找到 <Text strong>{pagination.total}</Text> 个职位
                      </Text>
                      
                      {isAuthenticated && user?.isStudentVerified && (
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => navigate('/parttime/create')}
                        >
                          发布兼职
                        </Button>
                      )}
                    </Space>
                  </Col>
                </Row>
              </Card>

              {/* 兼职列表 */}
              <div className="parttime-list">
                <Spin spinning={loading}>
                  {jobs.length > 0 ? (
                    <>
                      <Row gutter={[16, 16]}>
                        {jobs.map((job) => (
                          <Col xs={24} sm={12} lg={8} key={job.id}>
                            <PartTimeCard job={job} />
                          </Col>
                        ))}
                      </Row>
                      
                      {/* 分页 */}
                      <div className="parttime-pagination">
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
                      description="暂无兼职信息"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      {isAuthenticated && user?.isStudentVerified && (
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => navigate('/parttime/create')}
                        >
                          发布第一个兼职
                        </Button>
                      )}
                    </Empty>
                  )}
                </Spin>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};

export default PartTime;