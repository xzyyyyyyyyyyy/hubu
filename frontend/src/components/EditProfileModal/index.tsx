import React, { useState } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  Button, 
  Space, 
  Typography,
  Alert,
  Row,
  Col
} from 'antd';
import { 
  UserOutlined,
  PhoneOutlined,
  BookOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useAppDispatch } from '../../store/hooks';
import { updateUserProfile } from '../../store/slices/authSlice';
import './index.less';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface EditProfileModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialValues: any;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  initialValues
}) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const majors = [
    '计算机科学与技术', '软件工程', '网络工程', '信息安全',
    '电子信息工程', '通信工程', '自动化', '电气工程',
    '机械设计制造及其自动化', '车辆工程', '土木工程', '建筑学',
    '工商管理', '市场营销', '会计学', '财务管理',
    '国际经济与贸易', '金融学', '经济学', '统计学',
    '汉语言文学', '英语', '日语', '新闻学',
    '数学与应用数学', '物理学', '化学', '生物科学',
    '临床医学', '护理学', '药学', '医学影像学',
    '法学', '社会工作', '心理学', '教育学',
    '其他'
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await dispatch(updateUserProfile(values)).unwrap();
      onSuccess();
    } catch (error) {
      console.error('更新失败:', error);
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
      title="编辑个人资料"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      className="edit-profile-modal"
    >
      <div className="modal-content">
        <Alert
          message="完善个人资料有助于其他同学更好地了解您"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 2, max: 20, message: '用户名长度为2-20个字符' },
                  { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, message: '用户名只能包含字母、数字、下划线和中文' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />}
                  placeholder="请输入用户名"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="realName"
                label="真实姓名"
                rules={[
                  { required: true, message: '请输入真实姓名' },
                  { min: 2, max: 10, message: '姓名长度为2-10个字符' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />}
                  placeholder="请输入真实姓名"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="major"
                label="专业"
                rules={[{ required: true, message: '请选择专业' }]}
              >
                <Select
                  placeholder="请选择专业"
                  showSearch
                  filterOption={(input, option) =>
                    option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {majors.map(major => (
                    <Option key={major} value={major}>
                      {major}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="className"
                label="班级"
                rules={[
                  { required: true, message: '请输入班级' },
                  { max: 50, message: '班级名称不能超过50个字符' }
                ]}
              >
                <Input 
                  prefix={<TeamOutlined />}
                  placeholder="如：计科2021-1班"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="studentId"
                label="学号"
                rules={[
                  { required: true, message: '请输入学号' },
                  { pattern: /^\d{10,12}$/, message: '请输入正确的学号格式' }
                ]}
              >
                <Input 
                  prefix={<BookOutlined />}
                  placeholder="请输入学号"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="phone"
                label="手机号"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                ]}
              >
                <Input 
                  prefix={<PhoneOutlined />}
                  placeholder="请输入手机号"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="qqNumber"
            label="QQ号"
            rules={[
              { required: true, message: '请输入QQ号' },
              { pattern: /^[1-9]\d{4,10}$/, message: '请输入正确的QQ号' }
            ]}
          >
            <Input placeholder="请输入QQ号，用于联系" />
          </Form.Item>

          <Form.Item
            name="bio"
            label="个人简介"
            rules={[{ max: 200, message: '个人简介不能超过200个字符' }]}
          >
            <TextArea
              placeholder="简单介绍一下自己吧..."
              rows={4}
              maxLength={200}
              showCount
            />
          </Form.Item>

          <div className="form-tips">
            <Text type="secondary" style={{ fontSize: 12 }}>
              * 真实姓名和学号仅用于身份认证，不会公开显示
            </Text>
          </div>
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
              保存
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default EditProfileModal;