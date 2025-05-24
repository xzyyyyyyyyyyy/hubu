import React from 'react';
import { Card, Row, Col, Button, Badge } from 'antd';
import { 
  CalendarOutlined,
  BookOutlined,
  TeamOutlined,
  CarryOutOutlined,
  SearchOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  CarOutlined,
  CoffeeOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './index.less';

interface Function {
  key: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  path?: string;
  url?: string;
  color: string;
  badge?: string | number;
  isNew?: boolean;
  isHot?: boolean;
}

interface FunctionGridProps {
  userMode: 'freshman' | 'senior';
}

const FunctionGrid: React.FC<FunctionGridProps> = ({ userMode }) => {
  const navigate = useNavigate();

  const allFunctions: Function[] = [
    {
      key: 'schedule',
      title: '查课表',
      icon: <CalendarOutlined />,
      description: '琴园教务系统',
      url: 'http://jwxt.hubu.edu.cn/jsxsd/',
      color: '#1890ff',
      isHot: true
    },
    {
      key: 'academic',
      title: '教务系统',
      icon: <BookOutlined />,
      description: '成绩查询、选课',
      url: 'http://jwxt.hubu.edu.cn/jsxsd/',
      color: '#52c41a'
    },
    {
      key: 'parttime',
      title: '校园兼职',
      icon: <TeamOutlined />,
      description: '兼职信息汇总',
      path: '/parttime',
      color: '#fa8c16',
      badge: 'HOT'
    },
    {
      key: 'express',
      title: '快递代拿',
      icon: <CarryOutOutlined />,
      description: '学生互助代拿',
      path: '/express',
      color: '#eb2f96',
      isNew: true
    },
    {
      key: 'lostfound',
      title: '失物招领',
      icon: <SearchOutlined />,
      description: '寻主/寻物平台',
      path: '/lostfound',
      color: '#722ed1'
    },
    {
      key: 'market',
      title: '跳蚤市场',
      icon: <ShoppingOutlined />,
      description: '学生间交易',
      path: '/market',
      color: '#13c2c2'
    },
    {
      key: 'answers',
      title: 'WeLearn答案',
      icon: <FileTextOutlined />,
      description: 'U校园题库答案',
      path: '/answers',
      color: '#f5222d'
    },
    {
      key: 'nightmarket',
      title: '湖大夜市',
      icon: <CoffeeOutlined />,
      description: '夜市美食指南',
      path: '/nightmarket',
      color: '#fa541c',
      badge: '推荐'
    },
    {
      key: 'driving',
      title: '驾校报名',
      icon: <CarOutlined />,
      description: '学车报名优惠',
      path: '/driving',
      color: '#2f54eb'
    },
    {
      key: 'entertainment',
      title: '娱乐休闲',
      icon: <VideoCameraOutlined />,
      description: 'KTV、网吧等',
      path: '/entertainment',
      color: '#531dab'
    }
  ];

  // 根据用户模式过滤功能
  const functions = userMode === 'freshman' 
    ? allFunctions.filter(f => 
        ['schedule', 'academic', 'lostfound', 'answers', 'nightmarket'].includes(f.key)
      )
    : allFunctions;

  const handleFunctionClick = (func: Function) => {
    if (func.url) {
      window.open(func.url, '_blank');
    } else if (func.path) {
      navigate(func.path);
    }
  };

  return (
    <Card 
      title="🎯 功能导航" 
      className="function-grid-card"
      extra={
        <Badge 
          count={userMode === 'freshman' ? '新生版' : '完整版'} 
          style={{ backgroundColor: userMode === 'freshman' ? '#52c41a' : '#1890ff' }}
        />
      }
    >
      <Row gutter={[12, 12]}>
        {functions.map((func) => (
          <Col xs={12} sm={8} md={6} key={func.key}>
            <div 
              className="function-item"
              onClick={() => handleFunctionClick(func)}
            >
              <Badge.Ribbon 
                text={func.badge} 
                color={func.isNew ? 'green' : func.isHot ? 'red' : 'blue'}
                style={{ 
                  display: func.badge || func.isNew || func.isHot ? 'block' : 'none' 
                }}
              >
                <div className="function-content">
                  <div 
                    className="function-icon"
                    style={{ color: func.color }}
                  >
                    {func.icon}
                  </div>
                  <div className="function-text">
                    <h4 className="function-title">{func.title}</h4>
                    <p className="function-description">{func.description}</p>
                  </div>
                </div>
              </Badge.Ribbon>
            </div>
          </Col>
        ))}
      </Row>
      
      {userMode === 'freshman' && (
        <div className="upgrade-tip">
          <Button 
            type="link" 
            size="small"
            onClick={() => navigate('/settings')}
          >
            切换到完整版体验更多功能 →
          </Button>
        </div>
      )}
    </Card>
  );
};

export default FunctionGrid;