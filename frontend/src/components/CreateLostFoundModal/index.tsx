import React, { useState } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber,
  Radio,
  Switch,
  Button, 
  Space, 
  Typography, 
  Alert,
  Row,
  Col,
  message
} from 'antd';
import { 
  CalendarOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  PhoneOutlined,
  PictureOutlined
} from '@ant-design/icons';
import { useAppDispatch } from '../../store/hooks';
import { createLostFoundItem } from '../../store/slices/lostFoundSlice';
import ImageUploader from '../ImageUploader';
import './index.less';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface CreateLostFoundModalProps {
  visible: boolean;
  type: 'lost' | 'found';
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateLostFoundModal: React.FC<CreateLostFoundModalProps> = ({
  visible,
  type,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const categories = [
    { key: 'electronics', label: '📱 电子产品', items: ['手机', '耳机', '充电器', '移动电源', '平板电脑', 'U盘'] },
    { key: 'cards', label: '🆔 证件卡类', items: ['学生证', '身份证', '银行卡', '校园卡', '图书证', '驾驶证'] },
    { key: 'accessories', label: '💍 饰品配件', items: ['手表', '项链', '戒指', '手镯', '眼镜', '发饰'] },
    { key: 'clothing', label: '👕 服装鞋帽', items: ['外套', '裤子', '鞋子', '帽子', '围巾', '手套'] },
    { key: 'books', label: '📚 书籍文具', items: ['教材', '笔记本', '笔', '计算器', '文件夹', '资料'] },
    { key: 'keys', label: '🔑 钥匙工具', items: ['宿舍钥匙', '自行车钥匙', '车钥匙', '工具', '锁具'] },
    { key: 'bags', label: '🎒 包类箱子', items: ['书包', '手提包', '钱包', '行李箱', '化妆包', '电脑包'] },
    { key: 'sports', label: '⚽ 运动器材', items: ['篮球', '足球', '羽毛球拍', '乒乓球拍', '运动鞋', '运动服'] },
    { key: 'other', label: '🔧 其他物品', items: ['保温杯', '雨伞', '药品', '食品', '玩具', '其他'] }
  ];

  const locations = [
    { area: '教学区', places: ['教学楼A', '教学楼B', '教学楼C', '实验楼', '图书馆'] },
    { area: '生活区', places: ['食堂一楼', '食堂二楼', '食堂三楼', '超市', '洗衣房'] },
    { area: '宿舍区', places: ['1号宿舍楼', '2号宿舍楼', '3号宿舍楼', '4号宿舍楼', '宿舍园区'] },
    { area: '运动区', places: ['体育馆', '操场', '篮球场', '网球场', '游泳馆'] },
    { area: '其他区域', places: ['校门口', '停车场', '行政楼', '医务室', '其他地点'] }
  ];

  const contactMethods = [
    { key: 'phone', label: '手机号', icon: <PhoneOutlined /> },
    { key: 'qq', label: 'QQ号', icon: '🐧' },
    { key: 'wechat', label: '微信号', icon: '💬' }
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const itemData = {
        type,
        title: values.title,
        description: values.description,
        category: values.category,
        location: {
          area: values.locationArea,
          specific: values.locationSpecific
        },
        lostDate: values.lostDate.format('YYYY-MM-DD'),
        images,
        reward: values.reward || 0,
        isUrgent: values.isUrgent || false,
        contactInfo: {
          method: values.contactMethod,
          value: values.contactValue
        }
      };

      await dispatch(createLostFoundItem(itemData)).unwrap();
      message.success(`${type === 'lost' ? '寻物启事' : '失物招领'}发布成功！`);
      form.resetFields();
      setImages([]);
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
    onCancel();
  };

  const modalTitle = type === 'lost' ? '发布寻物启事' : '发布失物招领';
  const dateLabel = type === 'lost' ? '丢失时间' : '捡到时间';

  return (
    <Modal
      title={modalTitle}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={700}
      className="create-lostfound-modal"
    >
      <div className="modal-content">
        <Alert
          message={`发布${type === 'lost' ? '寻物启事' : '失物招领'}`}
          description={`详细描述物品特征，提供清晰照片，有助于${type === 'lost' ? '找回失物' : '找到失主'}`}
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            contactMethod: 'phone',
            isUrgent: false
          }}
        >
          {/* 物品标题 */}
          <Form.Item
            name="title"
            label="物品标题"
            rules={[
              { required: true, message: '请输入物品标题' },
              { max: 50, message: '标题不能超过50个字符' }
            ]}
          >
            <Input
              placeholder={`请简洁描述${type === 'lost' ? '丢失' : '捡到'}的物品`}
              maxLength={50}
              showCount
            />
          </Form.Item>

          <Row gutter={16}>
            {/* 物品类别 */}
            <Col span={12}>
              <Form.Item
                name="category"
                label="物品类别"
                rules={[{ required: true, message: '请选择物品类别' }]}
              >
                <Select placeholder="选择物品类别">
                  {categories.map(category => (
                    <Option key={category.key} value={category.key}>
                      {category.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* 时间 */}
            <Col span={12}>
              <Form.Item
                name="lostDate"
                label={dateLabel}
                rules={[{ required: true, message: `请选择${dateLabel}` }]}
              >
                <DatePicker 
                  placeholder={`选择${dateLabel}`}
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current > new Date()}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            {/* 地点区域 */}
            <Col span={12}>
              <Form.Item
                name="locationArea"
                label="地点区域"
                rules={[{ required: true, message: '请选择地点区域' }]}
              >
                <Select placeholder="选择区域">
                  {locations.map(location => (
                    <Option key={location.area} value={location.area}>
                      <EnvironmentOutlined /> {location.area}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* 具体地点 */}
            <Col span={12}>
              <Form.Item
                name="locationSpecific"
                label="具体地点"
                rules={[{ required: true, message: '请选择具体地点' }]}
              >
                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.locationArea !== curr.locationArea}>
                  {({ getFieldValue }) => {
                    const area = getFieldValue('locationArea');
                    const areaData = locations.find(l => l.area === area);
                    return (
                      <Select placeholder="选择具体地点">
                        {areaData?.places.map(place => (
                          <Option key={place} value={place}>
                            {place}
                          </Option>
                        ))}
                      </Select>
                    );
                  }}
                </Form.Item>
              </Form.Item>
            </Col>
          </Row>

          {/* 详细描述 */}
          <Form.Item
            name="description"
            label="详细描述"
            rules={[
              { required: true, message: '请详细描述物品特征' },
              { min: 10, message: '描述至少10个字符' },
              { max: 500, message: '描述不能超过500个字符' }
            ]}
          >
            <TextArea
              placeholder="请详细描述物品的外观、颜色、品牌、型号等特征，越详细越好"
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>

          {/* 物品图片 */}
          <Form.Item
            label={
              <Space>
                <PictureOutlined />
                物品图片 (最多5张)
              </Space>
            }
          >
            <ImageUploader
              maxCount={5}
              value={images}
              onChange={setImages}
            />
          </Form.Item>

          {/* 联系方式 */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="contactMethod"
                label="联系方式"
                rules={[{ required: true, message: '请选择联系方式' }]}
              >
                <Select>
                  {contactMethods.map(method => (
                    <Option key={method.key} value={method.key}>
                      <Space>
                        {method.icon}
                        {method.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={16}>
              <Form.Item
                name="contactValue"
                label="联系号码"
                rules={[
                  { required: true, message: '请输入联系号码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const method = getFieldValue('contactMethod');
                      if (!value) return Promise.resolve();
                      
                      if (method === 'phone' && !/^1[3-9]\d{9}$/.test(value)) {
                        return Promise.reject(new Error('请输入正确的手机号'));
                      }
                      if (method === 'qq' && !/^[1-9]\d{4,10}$/.test(value)) {
                        return Promise.reject(new Error('请输入正确的QQ号'));
                      }
                      if (method === 'wechat' && (value.length < 6 || value.length > 20)) {
                        return Promise.reject(new Error('微信号长度应为6-20位'));
                      }
                      
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input placeholder="请输入联系号码" />
              </Form.Item>
            </Col>
          </Row>

          {/* 额外选项 */}
          <Row gutter={16}>
            {type === 'lost' && (
              <Col span={12}>
                <Form.Item
                  name="reward"
                  label="感谢费"
                >
                  <InputNumber
                    prefix={<DollarOutlined />}
                    min={0}
                    max={1000}
                    precision={0}
                    style={{ width: '100%' }}
                    placeholder="可选，找到后的感谢费"
                    formatter={value => `¥ ${value}`}
                    parser={value => value!.replace('¥ ', '')}
                  />
                </Form.Item>
              </Col>
            )}
            
            <Col span={type === 'lost' ? 12 : 24}>
              <Form.Item
                name="isUrgent"
                label="紧急程度"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="紧急" 
                  unCheckedChildren="普通"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* 温馨提示 */}
          <Alert
            message="温馨提示"
            description={
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li>请确保联系方式准确有效</li>
                <li>详细描述有助于快速匹配</li>
                <li>上传清晰的物品照片</li>
                <li>找到物品后请及时更新状态</li>
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
              发布信息
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default CreateLostFoundModal;