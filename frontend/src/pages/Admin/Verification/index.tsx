import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select,
  Typography,
  message,
  Image,
  Row,
  Col,
  Statistic,
  Tabs,
  Avatar,
  Descriptions
} from 'antd';
import { 
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  UserOutlined,
  CrownOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { 
  fetchVerificationRequests, 
  approveVerification, 
  rejectVerification,
  fetchVerificationStats
} from '../../../store/slices/adminSlice';
import './index.less';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const VerificationManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    studentVerifications, 
    blueCardVerifications, 
    verificationStats, 
    loading 
  } = useAppSelector(state => state.admin);
  
  const [rejectForm] = Form.useForm();
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [currentVerification, setCurrentVerification] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('student');

  useEffect(() => {
    dispatch(fetchVerificationRequests());
    dispatch(fetchVerificationStats());
  }, [dispatch]);

  // 学生认证列
  const studentColumns = [
    {
      title: '申请人',
      key: 'applicant',
      width: 200,
      render: (_, record: any) => (
        <div className="applicant-info">
          <Avatar 
            src={record.user.avatar} 
            icon={<UserOutlined />}
            size="small"
          />
          <div className="applicant-details">
            <div>{record.user.username}</div>
            <Text type="secondary">{record.user.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: '学生信息',
      key: 'studentInfo',
      width: 200,
      render: (_, record: any) => (
        <div>
          <div><strong>学号：</strong>{record.studentId}</div>
          <div><strong>专业：</strong>{record.major}</div>
          <div><strong>班级：</strong>{record.className}</div>
          <div><strong>QQ：</strong>{record.qqNumber}</div>
        </div>
      ),
    },
    {
      title: '认证材料',
      dataIndex: 'materials',
      key: 'materials',
      width: 120,
      render: (materials: string[]) => (
        <Space>
          {materials.map((material, index) => (
            <Image
              key={index}
              src={material}
              alt="认证材料"
              width={40}
              height={40}
              style={{ objectFit: 'cover', borderRadius: 4 }}
            />
          ))}
        </Space>
      ),
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: { [key: string]: { color: string; text: string } } = {
          'pending': { color: 'orange', text: '待审核' },
          'approved': { color: 'green', text: '已通过' },
          'rejected': { color: 'red', text: '已拒绝' },
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record: any) => (
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleViewVerification(record)}
          >
            查看
          </Button>
          
          {record.status === 'pending' && (
            <>
              <Button 
                type="text" 
                icon={<CheckOutlined />}
                size="small"
                style={{ color: '#52c41a' }}
                onClick={() => handleApprove(record.id, 'student')}
              >
                通过
              </Button>
              
              <Button 
                type="text" 
                icon={<CloseOutlined />}
                size="small"
                danger
                onClick={() => handleReject(record, 'student')}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  // 蓝卡认证列
  const blueCardColumns = [
    {
      title: '申请人',
      key: 'applicant',
      width: 200,
      render: (_, record: any) => (
        <div className="applicant-info">
          <Avatar 
            src={record.user.avatar} 
            icon={<UserOutlined />}
            size="small"
          />
          <div className="applicant-details">
            <div>{record.user.username}</div>
            <Text type="secondary">{record.user.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: '认证类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <Tag color="blue">
          {type === 'unicom_user' ? '联通用户' : '驾校学员'}
        </Tag>
      ),
    },
    {
      title: '认证信息',
      key: 'verificationInfo',
      width: 150,
      render: (_, record: any) => (
        <div>
          {record.type === 'unicom_user' ? (
            <div><strong>手机号：</strong>{record.unicomNumber}</div>
          ) : (
            <div><strong>学号：</strong>{record.drivingSchoolId}</div>
          )}
        </div>
      ),
    },
    {
      title: '认证材料',
      dataIndex: 'materials',
      key: 'materials',
      width: 120,
      render: (materials: string[]) => (
        <Space>
          {materials.map((material, index) => (
            <Image
              key={index}
              src={material}
              alt="认证材料"
              width={40}
              height={40}
              style={{ objectFit: 'cover', borderRadius: 4 }}
            />
          ))}
        </Space>
      ),
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: { [key: string]: { color: string; text: string } } = {
          'pending': { color: 'orange', text: '待审核' },
          'approved': { color: 'green', text: '已通过' },
          'rejected': { color: 'red', text: '已拒绝' },
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record: any) => (
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleViewVerification(record)}
          >
            查看
          </Button>
          
          {record.status === 'pending' && (
            <>
              <Button 
                type="text" 
                icon={<CheckOutlined />}
                size="small"
                style={{ color: '#52c41a' }}
                onClick={() => handleApprove(record.id, 'bluecard')}
              >
                通过
              </Button>
              
              <Button 
                type="text" 
                icon={<CloseOutlined />}
                size="small"
                danger
                onClick={() => handleReject(record, 'bluecard')}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleViewVerification = (verification: any) => {
    Modal.info({
      title: '认证详情',
      width: 600,
      content: (
        <div className="verification-detail">
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="申请人">
              {verification.user.username}
            </Descriptions.Item>
            <Descriptions.Item label="邮箱">
              {verification.user.email}
            </Descriptions.Item>
            {verification.type ? (
              <>
                <Descriptions.Item label="认证类型">
                  {verification.type === 'unicom_user' ? '联通用户' : '驾校学员'}
                </Descriptions.Item>
                <Descriptions.Item label="认证信息">
                  {verification.type === 'unicom_user' 
                    ? verification.unicomNumber 
                    : verification.drivingSchoolId
                  }
                </Descriptions.Item>
              </>
            ) : (
              <>
                <Descriptions.Item label="学号">
                  {verification.studentId}
                </Descriptions.Item>
                <Descriptions.Item label="专业">
                  {verification.major}
                </Descriptions.Item>
                <Descriptions.Item label="班级">
                  {verification.className}
                </Descriptions.Item>
                <Descriptions.Item label="QQ号">
                  {verification.qqNumber}
                </Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="申请时间">
              {new Date(verification.createdAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
          </Descriptions>
          
          {verification.materials && verification.materials.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Title level={5}>认证材料</Title>
              <Image.PreviewGroup>
                <Space>
                  {verification.materials.map((material: string, index: number) => (
                    <Image
                      key={index}
                      src={material}
                      alt={`认证材料 ${index + 1}`}
                      width={100}
                      height={100}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                  ))}
                </Space>
              </Image.PreviewGroup>
            </div>
          )}
        </div>
      ),
    });
  };

  const handleApprove = async (verificationId: string, type: 'student' | 'bluecard') => {
    try {
      await dispatch(approveVerification({ verificationId, type })).unwrap();
      message.success('审核通过成功');
      dispatch(fetchVerificationRequests());
      dispatch(fetchVerificationStats());
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleReject = (verification: any, type: 'student' | 'bluecard') => {
    setCurrentVerification({ ...verification, type });
    setRejectModalVisible(true);
  };

  const handleSubmitReject = async () => {
    try {
      const values = await rejectForm.validateFields();
      await dispatch(rejectVerification({ 
        verificationId: currentVerification.id, 
        type: currentVerification.type,
        reason: values.reason 
      })).unwrap();
      
      message.success('审核拒绝成功');
      setRejectModalVisible(false);
      rejectForm.resetFields();
      dispatch(fetchVerificationRequests());
      dispatch(fetchVerificationStats());
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <div className="verification-management">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="待审核总数"
              value={verificationStats?.pendingTotal || 0}
              prefix="⏳"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="学生认证"
              value={verificationStats?.pendingStudent || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="蓝卡认证"
              value={verificationStats?.pendingBlueCard || 0}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="今日审核"
              value={verificationStats?.todayProcessed || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 认证列表 */}
      <Card 
        title="身份认证审核" 
        extra={
          <Button 
            icon={<ReloadOutlined />}
            onClick={() => dispatch(fetchVerificationRequests())}
          >
            刷新
          </Button>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={`学生认证 (${studentVerifications?.length || 0})`} 
            key="student"
          >
            <Table
              columns={studentColumns}
              dataSource={studentVerifications}
              loading={loading}
              rowKey="id"
              scroll={{ x: 1000 }}
              pagination={false}
            />
          </TabPane>
          
          <TabPane 
            tab={`蓝卡认证 (${blueCardVerifications?.length || 0})`} 
            key="bluecard"
          >
            <Table
              columns={blueCardColumns}
              dataSource={blueCardVerifications}
              loading={loading}
              rowKey="id"
              scroll={{ x: 1000 }}
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 拒绝原因弹窗 */}
      <Modal
        title="审核拒绝"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        onOk={handleSubmitReject}
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="reason"
            label="拒绝原因"
            rules={[{ required: true, message: '请输入拒绝原因' }]}
          >
            <TextArea
              placeholder="请详细说明拒绝原因..."
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VerificationManagement;