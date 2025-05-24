import React, { useState } from 'react';
import { Modal, Rate, Input, Button, Space, Typography, Form } from 'antd';
import { StarOutlined } from '@ant-design/icons';
import './index.less';

const { TextArea } = Input;
const { Text } = Typography;

interface RatingModalProps {
  visible: boolean;
  onSubmit: (rating: { score: number; comment: string }) => void;
  onCancel: () => void;
  orderInfo: {
    orderNumber: string;
    helperName: string;
  };
}

const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onSubmit,
  onCancel,
  orderInfo
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('评价提交失败:', error);
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
      title="评价代拿员"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={480}
      className="rating-modal"
    >
      <div className="modal-content">
        <div className="order-info">
          <Text type="secondary">订单号：{orderInfo.orderNumber}</Text>
          <br />
          <Text type="secondary">代拿员：{orderInfo.helperName}</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={{ score: 5 }}
        >
          <Form.Item
            name="score"
            label="服务评分"
            rules={[{ required: true, message: '请给出评分' }]}
          >
            <Rate 
              character={<StarOutlined />}
              style={{ fontSize: 24 }}
            />
          </Form.Item>

          <Form.Item
            name="comment"
            label="评价内容"
            rules={[{ required: true, message: '请输入评价内容' }]}
          >
            <TextArea
              placeholder="请分享您对代拿员服务的感受..."
              rows={4}
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
              提交评价
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default RatingModal;