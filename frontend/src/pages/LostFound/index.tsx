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
  Tabs,
  Typography,
  Badge,
  Affix,
  Modal,
  DatePicker
} from 'antd';
import { 
  PlusOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  EyeOutlined,
  PhoneOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchLostFoundItems } from '../../store/slices/lostFoundSlice';
import MainLayout from '../../components/Layout/MainLayout';
import LostFoundCard from '../../components/LostFoundCard';
import CreateLostFoundModal from '../../components/CreateLostFoundModal';
import './index.less';

const { Content } = Layout;
const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const LostFound: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { items, loading, pagination } = useAppSelector(state => state.lostFound);
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createType, setCreateType] = useState<'lost' | 'found'>('lost');
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    status: searchParams.get('status') || '',
    sort: searchParams.get('sort') || 'latest',
    search: searchParams.get('search') || '',
    dateRange: null as any,
    page: parseInt(searchParams.get('page') || '1'),
  });

  const itemCategories = [
    { key: '', label: '全部类型', icon: '📋' },
    { key: 'electronics', label: '电子产品', icon: '📱' },
    { key: 'cards', label: '证件卡类', icon: '🆔' },
    { key: 'accessories', label: '饰品配件', icon: '💍' },
    { key: 'clothing', label: '服装鞋帽', icon: '👕' },
    { key: 'books', label: '书籍文具', icon: '📚' },
    { key: 'keys', label: '钥匙工具', icon: '🔑' },
    { key: 'bags', label: '包类箱子', icon: '🎒' },
    { key: 'sports', label: '运动器材', icon: '⚽' },
    { key: 'other', label: '其他物品', icon: '🔧' },
  ];

  const locationOptions = [
    '教学楼A', '教学楼B', '教学楼C', '图书馆', '食堂',
    '宿舍区', '体育馆', '实验楼', '行政楼', '校门口',
    '操场', '篮球场', '网球场', '其他'
  ];

  const statusOptions = [
    { key: '', label: '全部状态' },
    { key: 'active', label: '进行中' },
    { key: 'claimed', label: '已认领' },
    { key: 'closed', label: '已关闭' },
  ];

  const sortOptions = [
    { key: 'latest', label: '最新发布', icon: <CalendarOutlined /> },
    { key: 'views', label: '浏览最多', icon: <EyeOutlined /> },
    { key: 'urgent', label: '紧急程度', icon: <QuestionCircleOutlined /> },
  ];

  useEffect(() => {
    const params = {
      page: filters.page,
      limit: 12,
      type: getTypeByTab(),
      category: filters.category,
      location: filters.location,
      status: filters.status,
      sort: filters.sort,
      search: filters.search,
      startDate: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
      endDate: filters.dateRange?.[1]?.format('YYYY-MM-DD'),
    };

    dispatch(fetchLostFoundItems(params));
  }, [dispatch, filters, activeTab]);

  const getTypeByTab = () => {
    switch (activeTab) {
      case 'lost':
        return 'lost';
      case 'found':
        return 'found';
      case 'my':
        return ''; // 在后端根据用户ID筛选
      default:
        return filters.type;
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    
    // 更新URL参数
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('tab', activeTab);
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== null && (Array.isArray(v) ? v.length > 0 : true)) {
        if (k === 'dateRange' && Array.isArray(v)) {
          newSearchParams.set('startDate', v[0]?.format('YYYY-MM-DD') || '');
          newSearchParams.set('endDate', v[1]?.format('YYYY-MM-DD') || '');
        } else if (k !== 'dateRange') {
          newSearchParams.set(k, v.toString());
        }
      }
    });
    setSearchParams(newSearchParams);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setFilters({ ...filters, page: 1 });
    
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', key);
    newSearchParams.set('page', '1');
    setSearchParams(newSearchParams);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page.toString());
    setSearchParams(newSearchParams);
  };

  const handleCreateItem = (type: 'lost' | 'found') => {
    if (!isAuthenticated) {
      Modal.confirm({
        title: '请先登录',
        content: '发布失物招领信息需要先登录账号',
        okText: '去登录',
        cancelText: '取消',
        onOk: () => navigate('/login'),
      });
      return;
    }

    if (!user?.isStudentVerified) {
      Modal.confirm({
        title: '需要学生认证',
        content: '发布失物招领信息需要先完成学生身份认证',
        okText: '去认证',
        cancelText: '取消',
        onOk: () => navigate('/profile?tab=verification'),
      });
      return;
    }

    setCreateType(type);
    setCreateModalVisible(true);
  };

  const getTabCount = (tab: string) => {
    // 这里应该从状态中获取各个tab的数量
    // 为了演示，返回模拟数据
    const counts = {
      all: pagination.total,
      lost: Math.floor(pagination.total * 0.6),
      found: Math.floor(pagination.total * 0.4),
      my: Math.floor(pagination.total * 0.1),
    };
    return counts[tab as keyof typeof counts] || 0;
  };

  return (
    <MainLayout>
      <div className="lostfound-page">
        {/* 页面头部 */}
        <Card className="lostfound-header">
          <Row justify="space-between" align="middle">
            <Col>
              <div className="header-info">
                <Title level={3} style={{ margin: 0 }}>
                  🔍 失物招领
                </Title>
                <Text type="secondary">
                  丢失物品不用慌，找到失主有希望
                </Text>
              </div>
            </Col>
            <Col>
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => handleCreateItem('lost')}
                >
                  我丢了东西
                </Button>
                <Button 
                  type="default" 
                  icon={<PlusOutlined />}
                  onClick={() => handleCreateItem('found')}
                >
                  我捡到东西
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 功能介绍卡片 */}
        <Card className="intro-card">
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={8}>
              <div className="intro-item">
                <div className="intro-icon">😢</div>
                <div className="intro-content">
                  <h4>丢失物品</h4>
                  <p>发布寻物启事，等待好心人联系</p>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="intro-item">
                <div className="intro-icon">😊</div>
                <div className="intro-content">
                  <h4>捡到物品</h4>
                  <p>发布招领信息，等待失主认领</p>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="intro-item">
                <div className="intro-icon">🤝</div>
                <div className="intro-content">
                  <h4>成功匹配</h4>
                  <p>物归原主，传递校园正能量</p>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 筛选和标签页 */}
        <Card className="filter-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} lg={16}>
              <Tabs 
                activeKey={activeTab} 
                onChange={handleTabChange}
                className="lostfound-tabs"
              >
                <TabPane 
                  tab={
                    <Badge count={getTabCount('all')} offset={[10, 0]}>
                      <span>全部信息</span>
                    </Badge>
                  } 
                  key="all" 
                />
                <TabPane 
                  tab={
                    <Badge count={getTabCount('lost')} offset={[10, 0]}>
                      <span>寻物启事</span>
                    </Badge>
                  } 
                  key="lost" 
                />
                <TabPane 
                  tab={
                    <Badge count={getTabCount('found')} offset={[10, 0]}>
                      <span>失物招领</span>
                    </Badge>
                  } 
                  key="found" 
                />
                {isAuthenticated && (
                  <TabPane 
                    tab={
                      <Badge count={getTabCount('my')} offset={[10, 0]}>
                        <span>我的发布</span>
                      </Badge>
                    } 
                    key="my" 
                  />
                )}
              </Tabs>
            </Col>
            <Col xs={24} lg={8}>
              <Space size="middle" style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Search
                  placeholder="搜索物品名称、地点..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onSearch={(value) => handleFilterChange('search', value)}
                  style={{ width: 200 }}
                  allowClear
                />
                
                <Select
                  value={filters.category}
                  onChange={(value) => handleFilterChange('category', value)}
                  style={{ width: 120 }}
                  placeholder="物品类型"
                >
                  {itemCategories.map(cat => (
                    <Option key={cat.key} value={cat.key}>
                      <Space>
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </Space>
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
          </Row>

          {/* 高级筛选 */}
          <div className="advanced-filters">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={8}>
                <Select
                  value={filters.location}
                  onChange={(value) => handleFilterChange('location', value)}
                  placeholder="选择地点"
                  style={{ width: '100%' }}
                  allowClear
                >
                  {locationOptions.map(location => (
                    <Option key={location} value={location}>
                      <EnvironmentOutlined /> {location}
                    </Option>
                  ))}
                </Select>
              </Col>
              
              <Col xs={24} sm={8}>
                <Select
                  value={filters.status}
                  onChange={(value) => handleFilterChange('status', value)}
                  placeholder="选择状态"
                  style={{ width: '100%' }}
                >
                  {statusOptions.map(status => (
                    <Option key={status.key} value={status.key}>
                      {status.label}
                    </Option>
                  ))}
                </Select>
              </Col>
              
              <Col xs={24} sm={8}>
                <RangePicker
                  value={filters.dateRange}
                  onChange={(dates) => handleFilterChange('dateRange', dates)}
                  placeholder={['开始日期', '结束日期']}
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
          </div>
        </Card>

        {/* 物品列表 */}
        <div className="lostfound-list">
          <Spin spinning={loading}>
            {items.length > 0 ? (
              <>
                <Row gutter={[16, 16]}>
                  {items.map((item) => (
                    <Col xs={24} sm={12} lg={8} key={item.id}>
                      <LostFoundCard item={item} />
                    </Col>
                  ))}
                </Row>
                
                {/* 分页 */}
                <div className="lostfound-pagination">
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
                description="暂无失物招领信息"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Space>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleCreateItem('lost')}
                  >
                    我丢了东西
                  </Button>
                  <Button
                    icon={<PlusOutlined />}
                    onClick={() => handleCreateItem('found')}
                  >
                    我捡到东西
                  </Button>
                </Space>
              </Empty>
            )}
          </Spin>
        </div>

        {/* 创建失物招领弹窗 */}
        <CreateLostFoundModal
          visible={createModalVisible}
          type={createType}
          onCancel={() => setCreateModalVisible(false)}
          onSuccess={() => {
            setCreateModalVisible(false);
            // 刷新列表
            const params = {
              page: 1,
              limit: 12,
              type: getTypeByTab(),
              category: filters.category,
              location: filters.location,
              status: filters.status,
              sort: filters.sort,
              search: filters.search,
            };
            dispatch(fetchLostFoundItems(params));
          }}
        />
      </div>
    </MainLayout>
  );
};

export default LostFound;