import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Row, 
  Col, 
  Space,
  Divider,
  Checkbox,
  Alert
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined 
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser } from '../../store/slices/authSlice';
import './Auth.less';

const { Title, Text } = Typography;

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector(state => state.auth);
  
  const [form] = Form.useForm();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const onFinish = async (values: LoginForm) => {
    try {
      await dispatch(loginUser({
        email: values.email,
        password: values.password
      })).unwrap();
      
      navigate(from, { replace: true });
    } catch (error) {
      console.error('登录失败:', error);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    // 实现忘记密码逻辑
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-overlay">
          <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
            <Col xs={22} sm={16} md={12} lg={8} xl={6}>
              <Card className="auth-card">
                <div className="auth-header">
                  <img src="/logo.png" alt="Logo" className="auth-logo" />
                  <Title level={2} className="auth-title">
                    欢迎回来
                  </Title>
                  <Text type="secondary">
                    登录湖大校园平台，畅享校园生活
                  </Text>
                </div>

                {showForgotPassword && (
                  <Alert
                    message="忘记密码功能暂未开放，请联系管理员"
                    type="info"
                    showIcon
                    closable
                    style={{ marginBottom: 16 }}
                  />
                )}

                <Form
                  form={form}
                  name="login"
                  onFinish={onFinish}
                  autoComplete="off"
                  size="large"
                  className="auth-form"
                >
                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: '请输入邮箱地址' },
                      { type: 'email', message: '请输入有效的邮箱地址' }
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="邮箱地址"
                      autoComplete="email"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: '请输入密码' },
                      { min: 6, message: '密码至少6位字符' }
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="密码"
                      autoComplete="current-password"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                          <Checkbox>记住我</Checkbox>
                        </Form.Item>
                      </Col>
                      <Col>
                        <Button 
                          type="link" 
                          className="forgot-password"
                          onClick={handleForgotPassword}
                        >
                          忘记密码？
                        </Button>
                      </Col>
                    </Row>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="auth-submit-button"
                      loading={isLoading}
                      block
                    >
                      登录
                    </Button>
                  </Form.Item>
                </Form>

                <Divider plain>
                  <Text type="secondary">其他登录方式</Text>
                </Divider>

                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button block disabled>
                    <UserOutlined /> 微信登录（敬请期待）
                  </Button>
                </Space>

                <div className="auth-footer">
                  <Text type="secondary">
                    还没有账号？{' '}
                    <Link to="/register" className="auth-link">
                      立即注册
                    </Link>
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default Login;