import React, { useState } from 'react';
import { Modal, Form, Input, Radio, Button, Space, Typography, Alert } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import './index.less';

const { TextArea } = Input;
const { Text } = Typography;

interface ContactModalProps {
  visible: boolean;
  onSubmit: (reason: string) => void;
  onCancel: () => void;
  itemInfo: {
    title: string;
    type: 'lost' | 'found';
    posterName: string;
  };
}

const ContactModal: React.FC<ContactModalProps> = ({
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
      await onSubmit(values.reason);
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

  const contactReasons = [
    '我就是失主/拾到者',
    '我有相关线索',
    '物品特征匹配',
    '其他原因'
  ];

  return (
    <Modal
      title="联系发布者"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      className="contact-modal"
    >
      <div className="modal-content">
        <Alert
          message={`联系${itemInfo.type === 'lost' ? '失主' : '拾到者'}：${itemInfo.posterName}`}
          description={`物品：${itemInfo.title}`}
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          initialValues={{ reason: contactReasons[0] }}
        >
          <Form.Item
            name="contactReason"
            label="联系原因"
            rules={[{ required: true, message: '请选择联系原因' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                {contactReasons.map((reason, index) => (
                  <Radio key={index} value={reason}>
                    {reason}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="message"
            label="留言"
            rules={[
              { required: true, message: '请输入留言内容' },
              { min: 10, message: '留言至少10个字符' }
            ]}
          >
            <TextArea
              placeholder="请简要说明情况，如物品特征、发现地点等..."
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
              <li>联系后可获得对方的联系方式</li>
              <li>请详细描述物品特征以便核实</li>
              <li>见面交接时请注意安全</li>
              <li>确认无误后请更新物品状态</li>
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
              icon={<PhoneOutlined />}
              onClick={handleSubmit}
              loading={loading}
            >
              发送联系
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default ContactModal;