import React, { useState } from 'react';
import { 
  Drawer, 
  Descriptions, 
  Tag, 
  Space, 
  Button, 
  Tabs, 
  List,
  Typography,
  Image,
  Avatar,
  Card,
  Modal,
  Form,
  Input,
  Select,
  message,
  Divider,
  Alert
} from 'antd';
import { 
  UserOutlined,
  CalendarOutlined,
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  FlagOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useAppDispatch } from '../../../store/hooks';
import { updatePostStatus, deletePost } from '../../../store/slices/adminSlice';
import './index.less';

const { Text, Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

interface PostDetailDrawerProps {
  visible: boolean;
  post: any;
  onClose: () => void;
  onUpdate: () => void;
}

const PostDetailDrawer: React.FC<PostDetailDrawerProps> = ({
  visible,
  post,
  onClose,
  onUpdate
}) => {
  const dispatch = useAppDispatch();
  const [actionForm] = Form.useForm();
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'hide'>('approve');

  if (!post) return null;

  const handleAction = (type: 'approve' | 'reject' | 'hide') => {
    setActionType(type);
    setActionModalVisible(true);
  };

  const handleSubmitAction = async () => {
    try {
      const values = await actionForm.validateFields();
      
      const statusMap = {
        approve: 'published',
        reject: 'rejected',
        hide: 'hidden'
      };

      await dispatch(updatePostStatus({ 
        postId: post.id, 
        status: statusMap[actionType],
        reason: values.reason 
      })).unwrap();

      message.success('操作成功');
      setActionModalVisible(false);
      actionForm.resetFields();
      onUpdate();
      onClose();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个帖子吗？此操作不可恢复！',
      onOk: async () => {
        try {
          await dispatch(deletePost(post.id)).unwrap();
          message.success('删除成功');
          onUpdate();
          onClose();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'published': 'green',
      'pending': 'orange',
      'rejected': 'red',
      'hidden': 'gray',
    };
    return colorMap[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const textMap: { [key: string]: string } = {
      'published': '已发布',
      'pending': '待审核',
      'rejected': '已拒绝',
      'hidden': '已隐藏',
    };
    return textMap[status] || status;
  };

  return (
    <>
      <Drawer
        title="帖子详情"
        placement="right"
        onClose={onClose}
        open={visible}
        width={800}
        className="post-detail-drawer"
      >
        {/* 操作按钮 */}
        <div className="action-buttons">
          <Space>
            {post.status === 'pending' && (
              <>
                <Button 
                  type="primary" 
                  icon={<CheckOutlined />}
                  onClick={() => handleAction('approve')}
                >
                  审核通过
                </Button>
                <Button 
                  danger 
                  icon={<CloseOutlined />}
                  onClick={() => handleAction('reject')}
                >
                  审核拒绝
                </Button>
              </>
            )}
            
            {post.status === 'published' && (
              <Button 
                icon={<CloseOutlined />}
                onClick={() => handleAction('hide')}
              >
                隐藏帖子
              </Button>
            )}
            
            <Button 
              danger 
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            >
              删除帖子
            </Button>
          </Space>
        </div>

        <Tabs defaultActiveKey="content">
          {/* 帖子内容 */}
          <TabPane tab="帖子内容" key="content">
            <div className="post-content">
              {/* 基本信息 */}
              <Card size="small" title="基本信息" style={{ marginBottom: 16 }}>
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="标题" span={2}>
                    <Title level={4} style={{ margin: 0 }}>
                      {post.title}
                    </Title>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="分类">
                    <Tag color="blue">{post.category}</Tag>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="状态">
                    <Tag color={getStatusColor(post.status)}>
                      {getStatusText(post.status)}
                    </Tag>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="作者">
                    <Space>
                      <Avatar 
                        src={post.author.avatar} 
                        icon={<UserOutlined />}
                        size="small"
                      />
                      <span>
                        {post.isAnonymous ? '匿名用户' : post.author.username}
                      </span>
                    </Space>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="发布时间">
                    <Space>
                      <CalendarOutlined />
                      {new Date(post.createdAt).toLocaleString('zh-CN')}
                    </Space>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="标签" span={2}>
                    <Space wrap>
                      {post.tags.map((tag: string, index: number) => (
                        <Tag key={index} color="geekblue">
                          {tag}
                        </Tag>
                      ))}
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* 内容详情 */}
              <Card size="small" title="帖子内容" style={{ marginBottom: 16 }}>
                <Paragraph>
                  {post.content.split('\n').map((line: string, index: number) => (
                    <div key={index}>
                      {line}
                      <br />
                    </div>
                  ))}
                </Paragraph>

                {/* 图片 */}
                {post.images && post.images.length > 0 && (
                  <div className="post-images">
                    <Title level={5}>图片附件</Title>
                    <Image.PreviewGroup>
                      <Space wrap>
                        {post.images.map((image: string, index: number) => (
                          <Image
                            key={index}
                            src={image}
                            alt={`图片 ${index + 1}`}
                            width={100}
                            height={100}
                            style={{ objectFit: 'cover', borderRadius: 4 }}
                          />
                        ))}
                      </Space>
                    </Image.PreviewGroup>
                  </div>
                )}
              </Card>

              {/* 统计数据 */}
              <Card size="small" title="数据统计">
                <Space size="large">
                  <div className="stat-item">
                    <EyeOutlined />
                    <span>浏览 {post.stats.views}</span>
                  </div>
                  <div className="stat-item">
                    <LikeOutlined />
                    <span>点赞 {post.stats.likes}</span>
                  </div>
                  <div className="stat-item">
                    <MessageOutlined />
                    <span>评论 {post.stats.comments}</span>
                  </div>
                  {post.reportCount > 0 && (
                    <div className="stat-item">
                      <FlagOutlined style={{ color: '#f5222d' }} />
                      <span style={{ color: '#f5222d' }}>举报 {post.reportCount}</span>
                    </div>
                  )}
                </Space>
              </Card>
            </div>
          </TabPane>

          {/* 评论列表 */}
          <TabPane tab={`评论 (${post.comments?.length || 0})`} key="comments">
            <List
              dataSource={post.comments || []}
              renderItem={(comment: any) => (
                <List.Item
                  actions={[
                    <Button type="link" size="small">查看</Button>,
                    <Button type="link" size="small" danger>删除</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        src={comment.author.avatar} 
                        icon={<UserOutlined />}
                      />
                    }
                    title={
                      <Space>
                        <span>{comment.author.username}</span>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(comment.createdAt).toLocaleString('zh-CN')}
                        </Text>
                      </Space>
                    }
                    description={comment.content}
                  />
                </List.Item>
              )}
            />
          </TabPane>

          {/* 举报记录 */}
          {post.reports && post.reports.length > 0 && (
            <TabPane tab={`举报记录 (${post.reports.length})`} key="reports">
              <List
                dataSource={post.reports}
                renderItem={(report: any) => (
                  <List.Item
                    actions={[
                      <Button type="link" size="small">处理</Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Tag color="red">{report.type}</Tag>
                          <span>{report.reason}</span>
                        </Space>
                      }
                      description={
                        <Space>
                          <Text type="secondary">
                            举报人：{report.reporter.username}
                          </Text>
                          <Text type="secondary">
                            时间：{new Date(report.createdAt).toLocaleString('zh-CN')}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </TabPane>
          )}

          {/* 操作历史 */}
          <TabPane tab="操作历史" key="history">
            <List
              dataSource={post.operationHistory || []}
              renderItem={(operation: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <span>{operation.action}</span>
                        <Tag color="blue">{operation.operator}</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <div>{operation.reason}</div>
                        <Text type="secondary">
                          {new Date(operation.createdAt).toLocaleString('zh-CN')}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Drawer>

      {/* 操作确认弹窗 */}
      <Modal
        title={`${actionType === 'approve' ? '审核通过' : actionType === 'reject' ? '审核拒绝' : '隐藏帖子'}`}
        open={actionModalVisible}
        onCancel={() => setActionModalVisible(false)}
        onOk={handleSubmitAction}
      >
        <Form form={actionForm} layout="vertical">
          <Form.Item
            name="reason"
            label="操作理由"
            rules={[{ required: true, message: '请输入操作理由' }]}
          >
            <TextArea
              placeholder="请说明操作理由..."
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default PostDetailDrawer;