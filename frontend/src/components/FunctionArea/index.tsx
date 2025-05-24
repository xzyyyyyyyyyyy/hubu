import React from 'react';
import { Card, Row, Col, Button } from 'antd';
import { 
  CalendarOutlined, 
  BookOutlined, 
  TeamOutlined, 
  CarryOutOutlined,
  SearchOutlined,
  ShoppingOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import './index.less';

interface FunctionAreaProps {
  userMode: 'freshman' | 'senior';
}

const FunctionArea: React.FC<FunctionAreaProps> = ({ userMode }) => {
  const functions = [
    {
      key: 'schedule',
      title: '查课表',
      icon: <CalendarOutlined />,
      description: '湖大琴园教务系统',
      url: 'http://jwxt.hubu.edu.cn/jsxsd/',
      color: '#1890ff'
    },
    {
      key: 'academic',
      title: '教务系统',
      icon: <BookOutlined />,
      description: '成绩查询、选课等',
      url: 'http://jwxt.hubu.edu.cn/jsxsd/',
      color: '#52c41a'
    },
    {
      key: 'parttime',
      title: '校园兼职',
      icon: <TeamOutlined />,
      description: '兼职信息汇总',
      path: '/parttime',
      color: '#fa8c16'
    },
    {
      key: 'express',
      title: '快递代拿',
      icon: <CarryOutOutlined />,
      description: '学生互助代拿',
      path: '/express',
      color: '#eb2f96'
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
    }
  ];

  // 根据用户模式过滤功能
  const filteredFunctions = userMode === 'freshman' 
    ? functions.filter(f => ['schedule', 'academic', 'lostfound', 'answers'].includes(f.key))
    : functions;

  const handleFunctionClick = (func: any) => {
    if (func.url) {
      window.open(func.url, '_blank');
    } else if (func.path) {
      window.location.href = func.path;
    }
  };

  return (
    <Card title="🎯 功能区" className="function-area">
      <Row gutter={[12, 12]}>
        {filteredFunctions.map((func) => (
          <Col xs={12} sm={8} key={func.key}>
            <div 
              className="function-item"
              onClick={() => handleFunctionClick(func)}
              style={{ borderColor: func.color }}
            >
              <div className="function-icon" style={{ color: func.color }}>
                {func.icon}
              </div>
              <div className="function-content">
                <h4>{func.title}</h4>
                <p>{func.description}</p>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default FunctionArea;