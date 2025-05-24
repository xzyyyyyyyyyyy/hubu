import React, { useState } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber,
  Radio,
  Switch,
  Button, 
  Space, 
  Typography, 
  Alert,
  Row,
  Col,
  message,
  DatePicker
} from 'antd';
import { 
  DollarOutlined,
  EnvironmentOutlined,
  PictureOutlined,
  TagsOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useAppDispatch } from '../../store/hooks';
import { createMarketItem } from '../../store/slices/marketSlice';
import ImageUploader from '../ImageUploader';
import TagInput from '../TagInput';
import moment from 'moment';
import './index.less';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface CreateMarketItemModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateMarketItemModal: React.FC<CreateMarketItemModalProps> = ({
  visible,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const categories = [
    { key: 'electronics', label: '📱 数码电子', items: ['手机', '电脑', '耳机', '充电器', '相机', '游戏机'] },
    { key: 'books', label: '📚 图书教材', items: ['教科书', '课外读物', '考试资料', '笔记本', '文具', '字典'] },
    { key: 'clothing', label: '👕 服装配饰', items: ['上衣', '裤子', '鞋子', '包包', '饰品', '手表'] },
    { key: 'sports', label: '⚽ 运动器材', items: ['球类', '健身器材', '运动鞋', '运动服', '户外用品'] },
    { key: 'daily', label: '🏠 生活用品', items: ['床上用品', '洗护用品', '厨具', '收纳用品', '装饰品'] },
    { key: 'beauty', label: '💄 美妆护肤', items: ['护肤品', '彩妆', '香水', '美容工具', '洗发护发'] },
    { key: 'food', label: '🍎 食品零食', items: ['零食', '饮料', '保健品', '特产', '茶叶'] },
    { key: 'furniture', label: '🪑 家具家电', items: ['桌椅', '柜子', '灯具', '小家电', '装修材料'] },
    { key: 'bike', label: '🚲 自行车', items: ['山地车', '公路车', '电动车', '自行车配件'] },
    { key: 'other', label: '🔧 其他物品', items: ['工具', '乐器', '宠物用品', '办公用品', '其他'] }
  ];

  const conditionOptions = [
    { key: 'new', label: '全新', desc: '未使用过，包装完好' },
    { key: 'like_new', label: '几乎全新', desc: '使用次数极少，无明显痕迹' },
    { key: 'good', label: '成色较好', desc: '正常使用，功能完好' },
    { key: 'fair', label: '有使用痕迹', desc: '有轻微磨损，不影响使用' },
    { key: 'poor', label: '成色一般', desc: '有明显使用痕迹' }
  ];

  const locationOptions = [
    '校内交易', '宿舍区', '教学区', '食堂附近', 
    '图书馆', '体育馆', '校门口', '其他地点'
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const itemData = {
        title: values.title,
        description: values.description,
        price: values.price,
        originalPrice: values.originalPrice,
        isNegotiable: values.isNegotiable || false,
        condition: values.condition,
        category: values.category,
        location: values.location,
        images,
        tags,
        isUrgent: values.isUrgent || false,
        expiresAt: values.expiresAt ? values.expiresAt.format('YYYY-MM-DD') : null
      };

      await dispatch(createMarketItem(itemData)).unwrap();
      message.success('商品发布成功！');
      form.resetFields();
      setImages([]);
      setTags([]);
      onSuccess();
    } catch (error) {
      message.error('发布失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImages([]);
    setTags([]);
    onCancel();
  };

  return (
    <Modal
      title="发布商品"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      className="create-market-item-modal"
    >
      <div className="modal-content">
        <Alert
          message="发布二手商品"
          description="详细描述商品信息，上传清晰图片，诚信交易"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            isNegotiable: false,
            isUrgent: false,
            condition: 'good'
          }}
        >
          {/* 商品标题 */}
          <Form.Item
            name="title"
            label="商品标题"
            rules={[
              { required: true, message: '请输入商品标题' },
              { max: 50, message: '标题不能超过50个字符' }
            ]}
          >
            <Input
              placeholder="简洁准确地描述您的商品"
              maxLength={50}
              showCount
            />
          </Form.Item>

          <Row gutter={16}>
            {/* 商品分类 */}
            <Col span={12}>
              <Form.Item
                name="category"
                label="商品分类"
                rules={[{ required: true, message: '请选择商品分类' }]}
              >
                <Select placeholder="选择商品分类">
                  {categories.map(category => (
                    <Option key={category.key} value={category.key}>
                      {category.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* 商品成色 */}
            <Col span={12}>
              <Form.Item
                name="condition"
                label="商品成色"
                rules={[{ required: true, message: '请选择商品成色' }]}
              >
                <Select placeholder="选择商品成色">
                  {conditionOptions.map(condition => (
                    <Option key={condition.key} value={condition.key}>
                      <div>
                        <div>{condition.label}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {condition.desc}
                        </Text>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            {/* 售价 */}
            <Col span={8}>
              <Form.Item
                name="price"
                label="售价"
                rules={[
                  { required: true, message: '请输入售价' },
                  { type: 'number', min: 0.1, message: '售价必须大于0' }
                ]}
              >
                <InputNumber
                  prefix={<DollarOutlined />}
                  min={0.1}
                  max={99999}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="当前售价"
                  formatter={value => `¥ ${value}`}
                  parser={value => value!.replace('¥ ', '')}
                />
              </Form.Item>
            </Col>

            {/* 原价（可选） */}
            <Col span={8}>
              <Form.Item
                name="originalPrice"
                label="原价（选填）"
              >
                <InputNumber
                  prefix={<DollarOutlined />}
                  min={0.1}
                  max={99999}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="购买时价格"
                  formatter={value => `¥ ${value}`}
                  parser={value => value!.replace('¥ ', '')}
                />
              </Form.Item>
            </Col>

            {/* 是否议价 */}
            <Col span={8}>
              <Form.Item
                name="isNegotiable"
                label="支持议价"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="可议价" 
                  unCheckedChildren="不议价"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* 商品描述 */}
          <Form.Item
            name="description"
            label="商品描述"
            rules={[
              { required: true, message: '请详细描述商品' },
              { min: 20, message: '描述至少20个字符' },
              { max: 1000, message: '描述不能超过1000个字符' }
            ]}
          >
            <TextArea
              placeholder="详细描述商品的品牌、型号、购买时间、使用情况、出售原因等"
              rows={4}
              maxLength={1000}
              showCount
            />
          </Form.Item>

          {/* 商品图片 */}
          <Form.Item
            label={
              <Space>
                <PictureOutlined />
                商品图片 (最多9张)
              </Space>
            }
          >
            <ImageUploader
              maxCount={9}
              value={images}
              onChange={setImages}
            />
          </Form.Item>

          {/* 商品标签 */}
          <Form.Item
            label={
              <Space>
                <TagsOutlined />
                商品标签 (最多5个)
              </Space>
            }
          >
            <TagInput
              value={tags}
              onChange={setTags}
              maxTags={5}
              placeholder="添加商品相关标签"
            />
          </Form.Item>

          <Row gutter={16}>
            {/* 交易地点 */}
            <Col span={12}>
              <Form.Item
                name="location"
                label="交易地点"
                rules={[{ required: true, message: '请选择交易地点' }]}
              >
                <Select placeholder="选择交易地点">
                  {locationOptions.map(location => (
                    <Option key={location} value={location}>
                      <EnvironmentOutlined /> {location}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* 有效期 */}
            <Col span={12}>
              <Form.Item
                name="expiresAt"
                label="有效期（选填）"
              >
                <DatePicker 
                  placeholder="选择下架时间"
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < moment().endOf('day')}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* 紧急出售 */}
          <Form.Item
            name="isUrgent"
            label="紧急出售"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="急售" 
              unCheckedChildren="普通"
            />
          </Form.Item>

          {/* 温馨提示 */}
          <Alert
            message="发布须知"
            description={
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li>请确保商品信息真实有效</li>
                <li>上传清晰的商品实拍图片</li>
                <li>合理定价，诚信交易</li>
                <li>交易时注意人身财产安全</li>
                <li>禁止发布违禁物品信息</li>
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
              发布商品
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default CreateMarketItemModal;