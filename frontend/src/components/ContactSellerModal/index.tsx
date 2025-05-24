import React, { useState } from 'react';
import { Modal, Form, Input, Radio, Button, Space, Typography, Alert } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import './index.less';

const { TextArea } = Input;
const { Text } = Typography;

interface ContactSellerModalProps {
  visible: boolean;
  onSubmit: (message: string) => void;
  onCancel: () => void;
  itemInfo: {
    title: string;
    price: number;
    sellerName: string;
  };
}

const ContactSellerModal: React.FC<ContactSellerModalProps> = ({
  visible,
  onSubmit,
  onCancel,
  itemInfo
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await onSubmit(values.message);
      form.resetFields();
    } catch (error) {
      console.error('联系失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const quickMessages = [
    '你好，我对这个商品很感兴趣，请问还在吗？',
    '请问商品成色如何？有什么瑕疵吗？',
    '可以议价吗？最低多少钱？',
    '什么时候方便交易？在哪里交易？',
    '能提供更多商品图片吗？'
  ];

  return (
    <Modal
      title="联系卖家"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      className="contact-seller-modal"
    >
      <div className="modal-content">
        <Alert
          message={`联系卖家：${itemInfo.sellerName}`}
          description={`商品：${itemInfo.title} - ¥${itemInfo.price}`}
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            label="快捷消息"
          >
            <div className="quick-messages">
              {quickMessages.map((msg, index) => (
                <Button
                  key={index}
                  type="dashed"
                  size="small"
                  className="quick-message-btn"
                  onClick={() => form.setFieldsValue({ message: msg })}
                >
                  {msg}
                </Button>
              ))}
            </div>
          </Form.Item>

          <Form.Item
            name="message"
            label="留言内容"
            rules={[
              { required: true, message: '请输入留言内容' },
              { min: 5, message: '留言至少5个字符' }
            ]}
          >
            <TextArea
              placeholder="请输入您想对卖家说的话..."
              rows={4}
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>

        <Alert
          message="联系提醒"
          description={
            <ul style={{ margin: '8px 0 0 0', paddingLeft: 16 }}>
              <li>联系后可获得卖家的联系方式</li>
              <li>请详细说明购买意向和疑问</li>
              <li>交易时请注意验货和安全</li>
              <li>建议选择安全的交易地点</li>
            </ul>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <div className="modal-footer">
          <Space>
            <Button onClick={handleCancel}>
              取消
            </Button>
            <Button 
              type="primary" 
              icon={<MessageOutlined />}
              onClick={handleSubmit}
              loading={loading}
            >
              发送消息
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default ContactSellerModal;