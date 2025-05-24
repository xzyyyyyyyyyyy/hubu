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
  Slider,
  Checkbox,
  Affix,
  Modal
} from 'antd';
import { 
  PlusOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  ShopOutlined,
  FireOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchMarketItems } from '../../store/slices/marketSlice';
import MainLayout from '../../components/Layout/MainLayout';
import MarketItemCard from '../../components/MarketItemCard';
import CreateMarketItemModal from '../../components/CreateMarketItemModal';
import './index.less';

const { Content } = Layout;
const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Market: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { items, loading, pagination } = useAppSelector(state => state.market);
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    condition: searchParams.get('condition') || '',
    priceRange: [0, 5000] as [number, number],
    location: searchParams.get('location') || '',
    sort: searchParams.get('sort') || 'latest',
    search: searchParams.get('search') || '',
    isNegotiable: false,
    hasImages: false,
    page: parseInt(searchParams.get('page') || '1'),
  });

  const categories = [
    { key: '', label: '全部分类', icon: '📋' },
    { key: 'electronics', label: '数码电子', icon: '📱' },
    { key: 'books', label: '图书教材', icon: '📚' },
    { key: 'clothing', label: '服装配饰', icon: '👕' },
    { key: 'sports', label: '运动器材', icon: '⚽' },
    { key: 'daily', label: '生活用品', icon: '🏠' },
    { key: 'beauty', label: '美妆护肤', icon: '💄' },
    { key: 'food', label: '食品零食', icon: '🍎' },
    { key: 'furniture', label: '家具家电', icon: '🪑' },
    { key: 'bike', label: '自行车', icon: '🚲' },
    { key: 'other', label: '其他物品', icon: '🔧' },
  ];

  const conditionOptions = [
    { key: '', label: '全部成色' },
    { key: 'new', label: '全新' },
    { key: 'like_new', label: '几乎全新' },
    { key: 'good', label: '成色较好' },
    { key: 'fair', label: '有使用痕迹' },
    { key: 'poor', label: '成色一般' },
  ];

  const locationOptions = [
    '校内', '宿舍区', '教学区', '食堂附近', 
    '图书馆', '体育馆', '校门口', '其他'
  ];

  const sortOptions = [
    { key: 'latest', label: '最新发布', icon: <ClockCircleOutlined /> },
    { key: 'price_low', label: '价格最低', icon: <DollarOutlined /> },
    { key: 'price_high', label: '价格最高', icon: <DollarOutlined /> },
    { key: 'popular', label: '最受欢迎', icon: <StarOutlined /> },
    { key: 'views', label: '浏览最多', icon: <FireOutlined /> },
  ];

  useEffect(() => {
    const params = {
      page: filters.page,
      limit: 12,
      category: filters.category,
      condition: filters.condition,
      priceMin: filters.priceRange[0],
      priceMax: filters.priceRange[1],
      location: filters.location,
      sort: filters.sort,
      search: filters.search,
      isNegotiable: filters.isNegotiable,
      hasImages: filters.hasImages,
      ...(activeTab === 'my' && { sellerId: user?.id }),
    };

    dispatch(fetchMarketItems(params));
  }, [dispatch, filters, activeTab, user?.id]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    
    // 更新URL参数
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('tab', activeTab);
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

  const handleCreateItem = () => {
    if (!isAuthenticated) {
      Modal.confirm({
        title: '请先登录',
        content: '发布商品需要先登录账号',
        okText: '去登录',
        cancelText: '取消',
        onOk: () => navigate('/login'),
      });
      return;
    }

    if (!user?.isStudentVerified) {
      Modal.confirm({
        title: '需要学生认证',
        content: '发布商品需要先完成学生身份认证',
        okText: '去认证',
        cancelText: '取消',
        onOk: () => navigate('/profile?tab=verification'),
      });
      return;
    }

    setCreateModalVisible(true);
  };

  const clearFilters = () => {
    const resetFilters = {
      category: '',
      condition: '',
      priceRange: [0, 5000] as [number, number],
      location: '',
      sort: 'latest',
      search: '',
      isNegotiable: false,
      hasImages: false,
      page: 1,
    };
    setFilters(resetFilters);
    setSearchParams(new URLSearchParams({ tab: activeTab }));
  };

  const getTabCount = (tab: string) => {
    // 这里应该从状态中获取各个tab的数量
    const counts = {
      all: pagination.total,
      electronics: Math.floor(pagination.total * 0.3),
      books: Math.floor(pagination.total * 0.25),
      my: Math.floor(pagination.total * 0.1),
    };
    return counts[tab as keyof typeof counts] || 0;
  };

  return (
    <MainLayout>
      <div className="market-page">
        {/* 页面头部 */}
        <Card className="market-header">
          <Row justify="space-between" align="middle">
            <Col>
              <div className="header-info">
                <Title level={3} style={{ margin: 0 }}>
                  🛍️ 跳蚤市场
                </Title>
                <Text type="secondary">
                  校园二手交易平台，让闲置物品焕发新生
                </Text>
              </div>
            </Col>
            <Col>
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={handleCreateItem}
                >
                  发布商品
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
                <div className="intro-icon">💰</div>
                <div className="intro-content">
                  <h4>低价好物</h4>
                  <p>学生专属的超值二手商品</p>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="intro-item">
                <div className="intro-icon">🔄</div>
                <div className="intro-content">
                  <h4>循环利用</h4>
                  <p>让闲置物品重新发挥价值</p>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="intro-item">
                <div className="intro-icon">🤝</div>
                <div className="intro-content">
                  <h4>校园交易</h4>
                  <p>同学之间安全可靠的交易</p>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        <Row gutter={[24, 24]}>
          {/* 筛选侧边栏 */}
          <Col xs={0} lg={6}>
            <Affix offsetTop={24}>
              <div className="market-filters">
                {/* 筛选器 */}
                <Card title="筛选条件" size="small" className="filter-card">
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {/* 商品分类 */}
                    <div>
                      <Title level={5}>商品分类</Title>
                      <Select
                        value={filters.category}
                        onChange={(value) => handleFilterChange('category', value)}
                        style={{ width: '100%' }}
                        placeholder="选择分类"
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

                    {/* 商品成色 */}
                    <div>
                      <Title level={5}>商品成色</Title>
                      <Select
                        value={filters.condition}
                        onChange={(value) => handleFilterChange('condition', value)}
                        style={{ width: '100%' }}
                        placeholder="选择成色"
                      >
                        {conditionOptions.map(condition => (
                          <Option key={condition.key} value={condition.key}>
                            {condition.label}
                          </Option>
                        ))}
                      </Select>
                    </div>

                    {/* 价格范围 */}
                    <div>
                      <Title level={5}>价格范围 (元)</Title>
                      <Slider
                        range
                        min={0}
                        max={5000}
                        step={50}
                        value={filters.priceRange}
                        onChange={(value) => handleFilterChange('priceRange', value)}
                        tipFormatter={(value) => `¥${value}`}
                      />
                      <div className="price-range-text">
                        <Text type="secondary">
                          ¥{filters.priceRange[0]} - ¥{filters.priceRange[1]}
                        </Text>
                      </div>
                    </div>

                    {/* 交易地点 */}
                    <div>
                      <Title level={5}>交易地点</Title>
                      <Select
                        value={filters.location}
                        onChange={(value) => handleFilterChange('location', value)}
                        style={{ width: '100%' }}
                        placeholder="选择地点"
                        allowClear
                      >
                        {locationOptions.map(location => (
                          <Option key={location} value={location}>
                            <EnvironmentOutlined /> {location}
                          </Option>
                        ))}
                      </Select>
                    </div>

                    {/* 附加条件 */}
                    <div>
                      <Title level={5}>附加条件</Title>
                      <Space direction="vertical">
                        <Checkbox
                          checked={filters.isNegotiable}
                          onChange={(e) => handleFilterChange('isNegotiable', e.target.checked)}
                        >
                          支持议价
                        </Checkbox>
                        <Checkbox
                          checked={filters.hasImages}
                          onChange={(e) => handleFilterChange('hasImages', e.target.checked)}
                        >
                          有商品图片
                        </Checkbox>
                      </Space>
                    </div>

                    {/* 清除筛选 */}
                    <Button onClick={clearFilters} block>
                      清除筛选
                    </Button>
                  </Space>
                </Card>

                {/* 热门分类 */}
                <Card title="热门分类" size="small" className="hot-categories-card">
                  <div className="hot-categories">
                    {categories.slice(1, 6).map(category => (
                      <Tag 
                        key={category.key}
                        className="hot-category"
                        onClick={() => handleFilterChange('category', category.key)}
                      >
                        {category.icon} {category.label}
                      </Tag>
                    ))}
                  </div>
                </Card>
              </div>
            </Affix>
          </Col>

          {/* 主内容区 */}
          <Col xs={24} lg={18}>
            <div className="market-main">
              {/* 移动端筛选按钮 */}
              <div className="mobile-filter-btn">
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => {/* 显示移动端筛选弹窗 */}}
                >
                  筛选
                </Button>
              </div>

              {/* 标签页和操作栏 */}
              <Card className="market-header-card">
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} lg={16}>
                    <Tabs 
                      activeKey={activeTab} 
                      onChange={handleTabChange}
                      className="market-tabs"
                    >
                      <TabPane 
                        tab={
                          <Badge count={getTabCount('all')} offset={[10, 0]}>
                            <span>全部商品</span>
                          </Badge>
                        } 
                        key="all" 
                      />
                      <TabPane 
                        tab={
                          <Badge count={getTabCount('electronics')} offset={[10, 0]}>
                            <span>数码电子</span>
                          </Badge>
                        } 
                        key="electronics" 
                      />
                      <TabPane 
                        tab={
                          <Badge count={getTabCount('books')} offset={[10, 0]}>
                            <span>图书教材</span>
                          </Badge>
                        } 
                        key="books" 
                      />
                      {isAuthenticated && (
                        <TabPane 
                          tab={
                            <Badge count={getTabCount('my')} offset={[10, 0]}>
                              <span>我的商品</span>
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
                        placeholder="搜索商品名称、描述..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        onSearch={(value) => handleFilterChange('search', value)}
                        style={{ width: 200 }}
                        allowClear
                      />
                      
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
              </Card>

              {/* 商品列表 */}
              <div className="market-list">
                <Spin spinning={loading}>
                  {items.length > 0 ? (
                    <>
                      <Row gutter={[16, 16]}>
                        {items.map((item) => (
                          <Col xs={24} sm={12} lg={8} key={item.id}>
                            <MarketItemCard item={item} />
                          </Col>
                        ))}
                      </Row>
                      
                      {/* 分页 */}
                      <div className="market-pagination">
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
                      description="暂无商品信息"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreateItem}
                      >
                        发布第一个商品
                      </Button>
                    </Empty>
                  )}
                </Spin>
              </div>
            </div>
          </Col>
        </Row>

        {/* 创建商品弹窗 */}
        <CreateMarketItemModal
          visible={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          onSuccess={() => {
            setCreateModalVisible(false);
            // 刷新商品列表
            const params = {
              page: 1,
              limit: 12,
              category: filters.category,
              condition: filters.condition,
              priceMin: filters.priceRange[0],
              priceMax: filters.priceRange[1],
              location: filters.location,
              sort: filters.sort,
              search: filters.search,
            };
            dispatch(fetchMarketItems(params));
          }}
        />
      </div>
    </MainLayout>
  );
};

export default Market;