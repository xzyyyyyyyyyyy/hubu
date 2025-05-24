import React, { useState } from 'react';
import { 
  Card, 
  Steps, 
  Button, 
  Space, 
  Alert, 
  Typography, 
  Tag,
  Upload,
  Form,
  Input,
  Select,
  message,
  Modal,
  Progress
} from 'antd';
import { 
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  UserOutlined,
  CrownOutlined,
  FileImageOutlined
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { 
  applyStudentVerification, 
  applyBlueCardVerification 
} from '../../store/slices/authSlice';
import './index.less';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Option } = Select;

const VerificationCenter: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  const [studentForm] = Form.useForm();
  const [blueCardForm] = Form.useForm();
  const [studentModalVisible, setStudentModalVisible] = useState(false);
  const [blueCardModalVisible, setBlueCardModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // 学生认证状态
  const getStudentVerificationStatus = () => {
    if (user?.isStudentVerified) {
      return { status: 'approved', text: '已认证', color: 'success' };
    }
    if (user?.studentVerification?.status === 'pending') {
      return { status: 'pending', text: '审核中', color: 'processing' };
    }
    if (user?.studentVerification?.status === 'rejected') {
      return { status: 'rejected', text: '已拒绝', color: 'error' };
    }
    return { status: 'none', text: '未认证', color: 'default' };
  };

  // 蓝卡认证状态
  const getBlueCardStatus = () => {
    if (user?.isBlueCardMember) {
      return { status: 'approved', text: '已认证', color: 'success' };
    }
    if (user?.blueCardVerification?.status === 'pending') {
      return { status: 'pending', text: '审核中', color: 'processing' };
    }
    if (user?.blueCardVerification?.status === 'rejected') {
      return { status: 'rejected', text: '已拒绝', color: 'error' };
    }
    return { status: 'none', text: '未认证', color: 'default' };
  };

  const studentStatus = getStudentVerificationStatus();
  const blueCardStatus = getBlueCardStatus();

  // 提交学生认证
  const handleStudentVerification = async () => {
    try {
      const values = await studentForm.validateFields();
      setLoading(true);

      const formData = new FormData();
      formData.append('major', values.major);
      formData.append('className', values.className);
      formData.append('qqNumber', values.qqNumber);
      
      if (values.screenshot && values.screenshot.file) {
        formData.append('screenshot', values.screenshot.file);
      }

      await dispatch(applyStudentVerification(formData)).unwrap();
      message.success('学生认证申请提交成功，请等待审核');
      setStudentModalVisible(false);
      studentForm.resetFields();
    } catch (error) {
      message.error('申请提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 提交蓝卡认证
  const handleBlueCardVerification = async () => {
    try {
      const values = await blueCardForm.validateFields();
      setLoading(true);

      const formData = new FormData();
      formData.append('type', values.type);
      
      if (values.type === 'unicom_user') {
        formData.append('unicomNumber', values.unicomNumber);
      } else {
        formData.append('drivingSchoolId', values.drivingSchoolId);
      }
      
      if (values.document && values.document.file) {
        formData.append('document', values.document.file);
      }

      await dispatch(applyBlueCardVerification(formData)).unwrap();
      message.success('蓝卡认证申请提交成功，请等待审核');
      setBlueCardModalVisible(false);
      blueCardForm.resetFields();
    } catch (error) {
      message.error('申请提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verification-center">
      <div className="verification-intro">
        <Title level={4}>🎓 身份认证中心</Title>
        <Paragraph type="secondary">
          完成身份认证，享受更多平台特权和功能
        </Paragraph>
      </div>

      {/* 学生认证 */}
      <Card className="verification-card">
        <div className="verification-header">
          <Space>
            <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <div>
              <Title level={5} style={{ margin: 0 }}>学生身份认证</Title>
              <Text type="secondary">验证您的学生身份，获得发帖和评论权限</Text>
            </div>
          </Space>
          <Tag color={studentStatus.color} icon={
            studentStatus.status === 'approved' ? <CheckCircleOutlined /> :
            studentStatus.status === 'pending' ? <ClockCircleOutlined /> :
            studentStatus.status === 'rejected' ? <ExclamationCircleOutlined /> : null
          }>
            {studentStatus.text}
          </Tag>
        </div>

        <div className="verification-content">
          <Steps size="small" current={
            studentStatus.status === 'approved' ? 2 :
            studentStatus.status === 'pending' ? 1 : 0
          }>
            <Step title="提交申请" />
            <Step title="审核中" />
            <Step title="认证完成" />
          </Steps>

          <div className="verification-benefits">
            <Text strong>认证后可获得：</Text>
            <ul>
              <li>发布帖子和评论权限</li>
              <li>参与校园活动组织</li>
              <li>发布兼职信息</li>
              <li>使用快递代拿服务</li>
            </ul>
          </div>

          {studentStatus.status === 'none' && (
            <Button 
              type="primary" 
              onClick={() => setStudentModalVisible(true)}
            >
              申请学生认证
            </Button>
          )}

          {studentStatus.status === 'pending' && (
            <Alert
              message="您的学生认证申请正在审核中"
              description="请耐心等待，通常在1-3个工作日内完成审核"
              type="info"
              showIcon
            />
          )}

          {studentStatus.status === 'rejected' && (
            <Alert
              message="学生认证申请被拒绝"
              description={user?.studentVerification?.rejectReason || '请检查提交的信息是否正确'}
              type="error"
              showIcon
              action={
                <Button 
                  size="small" 
                  onClick={() => setStudentModalVisible(true)}
                >
                  重新申请
                </Button>
              }
            />
          )}

          {studentStatus.status === 'approved' && (
            <Alert
              message="学生身份认证成功"
              description="您已获得完整的平台使用权限"
              type="success"
              showIcon
            />
          )}
        </div>
      </Card>

      {/* 蓝卡会员认证 */}
      <Card className="verification-card">
        <div className="verification-header">
          <Space>
            <CrownOutlined style={{ fontSize: 24, color: '#faad14' }} />
            <div>
              <Title level={5} style={{ margin: 0 }}>蓝卡会员认证</Title>
              <Text type="secondary">联通用户或驾校学员专享特权</Text>
            </div>
          </Space>
          <Tag color={blueCardStatus.color} icon={
            blueCardStatus.status === 'approved' ? <CheckCircleOutlined /> :
            blueCardStatus.status === 'pending' ? <ClockCircleOutlined /> :
            blueCardStatus.status === 'rejected' ? <ExclamationCircleOutlined /> : null
          }>
            {blueCardStatus.text}
          </Tag>
        </div>

        <div className="verification-content">
          <Steps size="small" current={
            blueCardStatus.status === 'approved' ? 2 :
            blueCardStatus.status === 'pending' ? 1 : 0
          }>
            <Step title="提交申请" />
            <Step title="审核中" />
            <Step title="认证完成" />
          </Steps>

          <div className="verification-benefits">
            <Text strong>蓝卡会员特权：</Text>
            <ul>
              <li>专属会员标识</li>
              <li>优先展示权限</li>
              <li>专属优惠活动</li>
              <li>客服优先处理</li>
            </ul>
          </div>

          {blueCardStatus.status === 'none' && user?.isStudentVerified && (
            <Button 
              type="primary" 
              onClick={() => setBlueCardModalVisible(true)}
            >
              申请蓝卡认证
            </Button>
          )}

          {blueCardStatus.status === 'none' && !user?.isStudentVerified && (
            <Alert
              message="请先完成学生认证"
              description="蓝卡认证需要先完成学生身份认证"
              type="warning"
              showIcon
            />
          )}

          {blueCardStatus.status === 'pending' && (
            <Alert
              message="您的蓝卡认证申请正在审核中"
              description="请耐心等待，通常在1-3个工作日内完成审核"
              type="info"
              showIcon
            />
          )}

          {blueCardStatus.status === 'rejected' && (
            <Alert
              message="蓝卡认证申请被拒绝"
              description={user?.blueCardVerification?.rejectReason || '请检查提交的信息是否正确'}
              type="error"
              showIcon
              action={
                <Button 
                  size="small" 
                  onClick={() => setBlueCardModalVisible(true)}
                >
                  重新申请
                </Button>
              }
            />
          )}

          {blueCardStatus.status === 'approved' && (
            <Alert
              message="蓝卡会员认证成功"
              description="您已成为蓝卡会员，享受专属特权"
              type="success"
              showIcon
            />
          )}
        </div>
      </Card>

      {/* 学生认证申请弹窗 */}
      <Modal
        title="学生身份认证申请"
        open={studentModalVisible}
        onCancel={() => setStudentModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={studentForm}
          layout="vertical"
          onFinish={handleStudentVerification}
          initialValues={{
            major: user?.major,
            className: user?.className,
            qqNumber: user?.qqNumber
          }}
        >
          <Alert
            message="请确保提交的信息真实有效"
            description="虚假信息将导致认证失败，并可能影响账号使用"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            name="major"
            label="专业"
            rules={[{ required: true, message: '请输入专业' }]}
          >
            <Input placeholder="请输入您的专业" />
          </Form.Item>

          <Form.Item
            name="className"
            label="班级"
            rules={[{ required: true, message: '请输入班级' }]}
          >
            <Input placeholder="如：计科2021-1班" />
          </Form.Item>

          <Form.Item
            name="qqNumber"
            label="QQ号"
            rules={[
              { required: true, message: '请输入QQ号' },
              { pattern: /^[1-9]\d{4,10}$/, message: '请输入正确的QQ号' }
            ]}
          >
            <Input placeholder="请输入您的QQ号" />
          </Form.Item>

          <Form.Item
            name="screenshot"
            label="班级群截图"
            rules={[{ required: true, message: '请上传班级群截图' }]}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
              listType="picture-card"
            >
              <div>
                <FileImageOutlined />
                <div style={{ marginTop: 8 }}>上传截图</div>
              </div>
            </Upload>
          </Form.Item>

          <Text type="secondary" style={{ fontSize: 12 }}>
            请上传包含您QQ昵称和班级群名称的群聊截图作为认证材料
          </Text>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setStudentModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                提交申请
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* 蓝卡认证申请弹窗 */}
      <Modal
        title="蓝卡会员认证申请"
        open={blueCardModalVisible}
        onCancel={() => setBlueCardModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={blueCardForm}
          layout="vertical"
          onFinish={handleBlueCardVerification}
        >
          <Alert
            message="蓝卡会员认证"
            description="联通用户或合作驾校学员可申请蓝卡会员，享受专属特权"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            name="type"
            label="认证类型"
            rules={[{ required: true, message: '请选择认证类型' }]}
          >
            <Select placeholder="请选择您的身份类型">
              <Option value="unicom_user">联通用户</Option>
              <Option value="driving_school_student">驾校学员</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.type !== currentValues.type
            }
          >
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              
              if (type === 'unicom_user') {
                return (
                  <Form.Item
                    name="unicomNumber"
                    label="联通手机号"
                    rules={[
                      { required: true, message: '请输入联通手机号' },
                      { pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号' }
                    ]}
                  >
                    <Input placeholder="请输入您的联通手机号" />
                  </Form.Item>
                );
              }
              
              if (type === 'driving_school_student') {
                return (
                  <Form.Item
                    name="drivingSchoolId"
                    label="驾校学号"
                    rules={[{ required: true, message: '请输入驾校学号' }]}
                  >
                    <Input placeholder="请输入您的驾校学号" />
                  </Form.Item>
                );
              }
              
              return null;
            }}
          </Form.Item>

          <Form.Item
            name="document"
            label="认证材料"
            rules={[{ required: true, message: '请上传认证材料' }]}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
              listType="picture-card"
            >
              <div>
                <FileImageOutlined />
                <div style={{ marginTop: 8 }}>上传材料</div>
              </div>
            </Upload>
          </Form.Item>

          <Text type="secondary" style={{ fontSize: 12 }}>
            联通用户请上传联通APP个人信息截图；驾校学员请上传学员证或缴费凭证
          </Text>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setBlueCardModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                提交申请
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default VerificationCenter;