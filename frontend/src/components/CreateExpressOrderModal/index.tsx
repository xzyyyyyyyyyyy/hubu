import React, { useState } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Radio, 
  Upload, 
  Button, 
  Space, 
  Typography, 
  Alert,
  Row,
  Col,
  message
} from 'antd';
import { 
  PlusOutlined,
  UploadOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  PhoneOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useAppDispatch } from '../../store/hooks';
import { createExpressOrder } from '../../store/slices/expressSlice';
import './index.less';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface CreateExpressOrderModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateExpressOrderModal: React.FC<CreateExpressOrderModalProps> = ({
  visible,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');

  const expressCompanies = [
    '顺丰速运', '中通快递', '圆通速递', '申通快递', '韵达速递',
    '百世快递', '京东快递', '邮政EMS', '德邦快递', '天天快递'
  ];

  const pickupLocations = [
    '东门快递点', '西门快递点', '南门快递点', '北门快递点',
    '菜鸟驿站', '快递超市', '宿舍楼下', '其他'
  ];

  const buildings = [
    '1号宿舍楼', '2号宿舍楼', '3号宿舍楼', '4号宿舍楼',
    '5号宿舍楼', '6号宿舍楼', '7号宿舍楼', '8号宿舍楼',
    '研究生宿舍A区', '研究生宿舍B区', '其他'
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const orderData = {
        type: orderType,
        details: {
          expressCompany: values.expressCompany,
          trackingNumber: values.trackingNumber,
          pickupLocation: values.pickupLocation,
          deliveryLocation: `${values.building} ${values.room}`,
          recipientInfo: {
            name: values.recipientName,
            phone: values.recipientPhone,
            building: values.building,
            room: values.room
          }
        },
        payment: {
          amount: values.amount,
          method: values.paymentMethod
        },
        notes: values.notes || '',
        duration: values.duration || 24
      };

      await dispatch(createExpressOrder(orderData)).unwrap();
      message.success('订单发布成功！');
      form.resetFields();
      onSuccess();
    } catch (error) {
      message.error('发布失败，请重试');
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
      title="发布快递代拿订单"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      className="create-express-order-modal"
    >
      <div className="modal-content">
        <Alert
          message="发布订单后，其他同学可以看到并接单帮您处理快递"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: 'pickup',
            paymentMethod: 'wechat',
            amount: 3,
            duration: 24
          }}
        >
          {/* 订单类型 */}
          <Form.Item
            name="type"
            label="订单类型"
            rules={[{ required: true, message: '请选择订单类型' }]}
          >
            <Radio.Group 
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="order-type-radio"
            >
              <Radio.Button value="pickup">
                <Space>
                  <EnvironmentOutlined />
                  代取快递
                </Space>
              </Radio.Button>
              <Radio.Button value="delivery">
                <Space>
                  <EnvironmentOutlined />
                  代送快递
                </Space>
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Row gutter={16}>
            {/* 快递公司 */}
            <Col span={12}>
              <Form.Item
                name="expressCompany"
                label="快递公司"
                rules={[{ required: true, message: '请选择快递公司' }]}
              >
                <Select placeholder="选择快递公司" showSearch>
                  {expressCompanies.map(company => (
                    <Option key={company} value={company}>
                      {company}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* 快递单号 */}
            <Col span={12}>
              <Form.Item
                name="trackingNumber"
                label="快递单号"
                rules={[
                  { required: true, message: '请输入快递单号' },
                  { min: 8, message: '快递单号至少8位' }
                ]}
              >
                <Input placeholder="请输入完整的快递单号" />
              </Form.Item>
            </Col>
          </Row>

          {/* 取件地址 */}
          <Form.Item
            name="pickupLocation"
            label={orderType === 'pickup' ? '取件地址' : '寄件地址'}
            rules={[{ required: true, message: '请选择取件地址' }]}
          >
            <Select placeholder="选择取件地址" showSearch>
              {pickupLocations.map(location => (
                <Option key={location} value={location}>
                  {location}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            {/* 收件人姓名 */}
            <Col span={12}>
              <Form.Item
                name="recipientName"
                label="收件人姓名"
                rules={[{ required: true, message: '请输入收件人姓名' }]}
              >
                <Input 
                  prefix={<UserOutlined />}
                  placeholder="请输入真实姓名" 
                />
              </Form.Item>
            </Col>

            {/* 收件人电话 */}
            <Col span={12}>
              <Form.Item
                name="recipientPhone"
                label="收件人电话"
                rules={[
                  { required: true, message: '请输入收件人电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
                ]}
              >
                <Input 
                  prefix={<PhoneOutlined />}
                  placeholder="请输入手机号" 
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            {/* 宿舍楼 */}
            <Col span={12}>
              <Form.Item
                name="building"
                label="宿舍楼"
                rules={[{ required: true, message: '请选择宿舍楼' }]}
              >
                <Select placeholder="选择宿舍楼">
                  {buildings.map(building => (
                    <Option key={building} value={building}>
                      {building}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* 房间号 */}
            <Col span={12}>
              <Form.Item
                name="room"
                label="房间号"
                rules={[{ required: true, message: '请输入房间号' }]}
              >
                <Input placeholder="如：201、A101" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            {/* 代拿费用 */}
            <Col span={12}>
              <Form.Item
                name="amount"
                label="代拿费用"
                rules={[
                  { required: true, message: '请输入代拿费用' },
                  { type: 'number', min: 1, max: 50, message: '费用应在1-50元之间' }
                ]}
              >
                <InputNumber
                  prefix={<DollarOutlined />}
                  min={1}
                  max={50}
                  precision={1}
                  step={0.5}
                  style={{ width: '100%' }}
                  placeholder="建议2-5元"
                  formatter={value => `¥ ${value}`}
                  parser={value => value!.replace('¥ ', '')}
                />
              </Form.Item>
            </Col>

            {/* 支付方式 */}
            <Col span={12}>
              <Form.Item
                name="paymentMethod"
                label="支付方式"
                rules={[{ required: true, message: '请选择支付方式' }]}
              >
                <Select placeholder="选择支付方式">
                  <Option value="wechat">微信支付</Option>
                  <Option value="alipay">支付宝</Option>
                  <Option value="cash">现金支付</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* 有效期 */}
          <Form.Item
            name="duration"
            label="订单有效期"
            rules={[{ required: true, message: '请选择有效期' }]}
          >
            <Radio.Group>
              <Radio value={12}>12小时</Radio>
              <Radio value={24}>24小时</Radio>
              <Radio value={48}>48小时</Radio>
              <Radio value={72}>72小时</Radio>
            </Radio.Group>
          </Form.Item>

          {/* 备注信息 */}
          <Form.Item
            name="notes"
            label="备注信息"
          >
            <TextArea
              placeholder="请描述特殊要求、时间要求等（选填）"
              rows={3}
              maxLength={200}
              showCount
            />
          </Form.Item>

          {/* 温馨提示 */}
          <Alert
            message="温馨提示"
            description={
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li>请确保快递单号准确无误</li>
                <li>建议合理设置代拿费用</li>
                <li>接单后请及时联系代拿员</li>
                <li>收到快递后请及时确认完成</li>
              </ul>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
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
              发布订单
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default CreateExpressOrderModal;