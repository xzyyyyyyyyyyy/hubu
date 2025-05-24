import React, { useState } from 'react';
import { Modal, Form, Input, Button, Space, Typography, Alert } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { useAppSelector } from '../../store/hooks';
import './index.less';

const { TextArea } = Input;
const { Text } = Typography;

interface ApplicationModalProps {
  visible: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  jobTitle: string;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({
  visible,
  onSubmit,
  onCancel,
  jobTitle
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { user } = useAppSelector(state => state.auth);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('申请提交失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="申请职位"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      className="application-modal"
    >
      <div className="modal-content">
        <Alert
          message={`确认申请：${jobTitle}`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: user?.realName || user?.username,
            phone: user?.phone,
            email: user?.email
          }}
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入您的姓名' }]}
          >
            <Input 
              prefix={<UserOutlined />}
              placeholder="请输入您的真实姓名"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="联系电话"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
            ]}
          >
            <Input 
              prefix={<PhoneOutlined />}
              placeholder="请输入手机号"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱地址"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />}
              placeholder="请输入邮箱地址"
            />
          </Form.Item>

          <Form.Item
            name="introduction"
            label="个人简介"
            rules={[
              { required: true, message: '请介绍一下自己' },
              { min: 20, message: '个人简介至少20个字符' }
            ]}
          >
            <TextArea
              placeholder="请简单介绍一下自己的经历、技能和优势..."
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="experience"
            label="相关经验"
          >
            <TextArea
              placeholder="请描述您的相关工作或实习经验（选填）"
              rows={3}
              maxLength={300}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="availability"
            label="可工作时间"
            rules={[{ required: true, message: '请说明您的可工作时间' }]}
          >
            <TextArea
              placeholder="请说明您的空闲时间，如：周一到周五晚上6-9点，周末全天"
              rows={2}
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>

        <div className="modal-footer">
          <Space>
            <Button onClick={handleCancel}>
              取消
            </Button>
            <Button 
              type="primary" 
              onClick={handleSubmit}
              loading={loading}
            >
              提交申请
            </Button>
          </Space>
        </div>

        <div className="tips">
          <Text type="secondary" style={{ fontSize: 12 }}>
            提交申请后，您的联系方式将发送给招聘方，请确保信息准确无误。
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default ApplicationModal;