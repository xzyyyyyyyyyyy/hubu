import React, { useState, useRef } from 'react';
import { 
  Layout, 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Upload, 
  Space, 
  Tag, 
  Typography, 
  Row, 
  Col,
  Switch,
  Alert,
  message,
  Modal,
  Divider
} from 'antd';
import { 
  PlusOutlined,
  UploadOutlined,
  EyeOutlined,
  SendOutlined,
  SaveOutlined,
  DeleteOutlined,
  PictureOutlined,
  TagsOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { createPost } from '../../store/slices/postSlice';
import MainLayout from '../../components/Layout/MainLayout';
import MarkdownEditor from '../../components/MarkdownEditor';
import ImageUploader from '../../components/ImageUploader';
import TagInput from '../../components/TagInput';
import PostPreview from '../../components/PostPreview';
import './CreatePost.less';

const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface PostForm {
  title: string;
  content: string;
  category: string;
  tags: string[];
  type: 'post' | 'question' | 'announcement' | 'activity';
  isAnonymous: boolean;
  images: string[];
}

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [formData, setFormData] = useState<Partial<PostForm>>({
    type: 'post',
    isAnonymous: false,
    tags: [],
    images: []
  });
  const [contentMode, setContentMode] = useState<'simple' | 'markdown'>('simple');
  const [draftSaved, setDraftSaved] = useState(false);

  const categories = [
    { key: 'general', label: '💬 综合讨论', desc: '日常话题、随便聊聊' },
    { key: 'academic', label: '📚 学术交流', desc: '学习问题、学术讨论' },
    { key: 'life', label: '🏠 生活分享', desc: '生活经验、心情感悟' },
    { key: 'parttime', label: '💼 兼职求职', desc: '兼职信息、求职招聘' },
    { key: 'lostfound', label: '🔍 失物招领', desc: '寻物启事、失物招领' },
    { key: 'market', label: '🛍️ 二手交易', desc: '物品交易、闲置出售' },
    { key: 'dining', label: '🍜 美食推荐', desc: '美食分享、餐厅推荐' },
    { key: 'entertainment', label: '🎮 娱乐休闲', desc: '娱乐活动、兴趣爱好' },
    { key: 'question', label: '❓ 问题求助', desc: '寻求帮助、疑难解答' },
    { key: 'notice', label: '📢 通知公告', desc: '重要通知、活动公告' },
  ];

  const postTypes = [
    { key: 'post', label: '📝 普通帖子', desc: '分享、讨论、聊天' },
    { key: 'question', label: '❓ 提问求助', desc: '寻求帮助和建议' },
    { key: 'announcement', label: '📢 公告通知', desc: '重要信息发布' },
    { key: 'activity', label: '🎉 活动组织', desc: '组织活动、聚会' },
  ];

  // 保存草稿
  const saveDraft = () => {
    const draftData = {
      ...formData,
      title: form.getFieldValue('title'),
      content: form.getFieldValue('content'),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('post_draft', JSON.stringify(draftData));
    setDraftSaved(true);
    message.success('草稿已保存');
    
    // 3秒后隐藏保存提示
    setTimeout(() => setDraftSaved(false), 3000);
  };

  // 加载草稿
  const loadDraft = () => {
    const draftStr = localStorage.getItem('post_draft');
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        form.setFieldsValue(draft);
        setFormData(draft);
        message.success('草稿已加载');
      } catch (error) {
        message.error('草稿加载失败');
      }
    }
  };

  // 清除草稿
  const clearDraft = () => {
    Modal.confirm({
      title: '确认清除草稿？',
      content: '清除后无法恢复，确定要清除草稿吗？',
      onOk: () => {
        localStorage.removeItem('post_draft');
        form.resetFields();
        setFormData({ type: 'post', isAnonymous: false, tags: [], images: [] });
        message.success('草稿已清除');
      }
    });
  };

  // 表单值变化处理
  const handleFormChange = (changedValues: any, allValues: any) => {
    setFormData({ ...formData, ...changedValues });
  };

  // 图片上传处理
  const handleImageUpload = (imageUrls: string[]) => {
    setFormData({ ...formData, images: imageUrls });
    form.setFieldsValue({ images: imageUrls });
  };

  // 标签变化处理
  const handleTagsChange = (tags: string[]) => {
    setFormData({ ...formData, tags });
    form.setFieldsValue({ tags });
  };

  // 提交发帖
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const postData = {
        ...values,
        ...formData,
        content: values.content || formData.content
      };

      await dispatch(createPost(postData)).unwrap();
      
      // 清除草稿
      localStorage.removeItem('post_draft');
      
      message.success('发帖成功！');
      navigate('/posts');
    } catch (error) {
      message.error('发帖失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 预览帖子
  const handlePreview = async () => {
    try {
      const values = await form.validateFields();
      setFormData({ ...formData, ...values });
      setPreviewVisible(true);
    } catch (error) {
      message.warning('请先完善帖子内容');
    }
  };

  // 检查是否有草稿
  React.useEffect(() => {
    const draftStr = localStorage.getItem('post_draft');
    if (draftStr) {
      Modal.confirm({
        title: '发现未完成的草稿',
        content: '是否要加载之前保存的草稿内容？',
        onOk: loadDraft,
        onCancel: () => localStorage.removeItem('post_draft')
      });
    }
  }, []);

  return (
    <MainLayout>
      <div className="create-post-page">
        <Row gutter={[24, 24]}>
          {/* 主编辑区 */}
          <Col xs={24} lg={18}>
            <Card className="create-post-card">
              {/* 页面头部 */}
              <div className="post-header">
                <Title level={3}>
                  ✍️ 发布新帖子
                </Title>
                <Text type="secondary">
                  分享您的想法，与同学们交流讨论
                </Text>
              </div>

              <Divider />

              {/* 发帖表单 */}
              <Form
                form={form}
                layout="vertical"
                onValuesChange={handleFormChange}
                initialValues={formData}
                className="create-post-form"
              >
                {/* 基本设置行 */}
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="type"
                      label="帖子类型"
                      rules={[{ required: true, message: '请选择帖子类型' }]}
                    >
                      <Select placeholder="选择帖子类型">
                        {postTypes.map(type => (
                          <Option key={type.key} value={type.key}>
                            <div>
                              <div>{type.label}</div>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {type.desc}
                              </Text>
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="category"
                      label="分类"
                      rules={[{ required: true, message: '请选择分类' }]}
                    >
                      <Select placeholder="选择分类">
                        {categories.map(cat => (
                          <Option key={cat.key} value={cat.key}>
                            <div>
                              <div>{cat.label}</div>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {cat.desc}
                              </Text>
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                {/* 标题 */}
                <Form.Item
                  name="title"
                  label="标题"
                  rules={[
                    { required: true, message: '请输入标题' },
                    { max: 100, message: '标题不能超过100个字符' }
                  ]}
                >
                  <Input
                    placeholder="请输入一个吸引人的标题..."
                    size="large"
                    maxLength={100}
                    showCount
                  />
                </Form.Item>

                {/* 内容编辑器选择 */}
                <div className="editor-mode-selector">
                  <Space>
                    <Text>编辑模式：</Text>
                    <Button.Group>
                      <Button
                        type={contentMode === 'simple' ? 'primary' : 'default'}
                        onClick={() => setContentMode('simple')}
                      >
                        简单模式
                      </Button>
                      <Button
                        type={contentMode === 'markdown' ? 'primary' : 'default'}
                        onClick={() => setContentMode('markdown')}
                      >
                        Markdown
                      </Button>
                    </Button.Group>
                  </Space>
                </div>

                {/* 内容编辑器 */}
                <Form.Item
                  name="content"
                  label="内容"
                  rules={[
                    { required: true, message: '请输入内容' },
                    { min: 10, message: '内容至少10个字符' }
                  ]}
                >
                  {contentMode === 'markdown' ? (
                    <MarkdownEditor
                      value={formData.content || ''}
                      onChange={(value) => {
                        setFormData({ ...formData, content: value });
                        form.setFieldsValue({ content: value });
                      }}
                      placeholder="使用 Markdown 语法编写内容..."
                    />
                  ) : (
                    <TextArea
                      placeholder="分享您的想法..."
                      rows={8}
                      maxLength={10000}
                      showCount
                    />
                  )}
                </Form.Item>

                {/* 图片上传 */}
                <Form.Item
                  name="images"
                  label={
                    <Space>
                      <PictureOutlined />
                      图片 (最多9张)
                    </Space>
                  }
                >
                  <ImageUploader
                    maxCount={9}
                    value={formData.images || []}
                    onChange={handleImageUpload}
                  />
                </Form.Item>

                {/* 标签输入 */}
                <Form.Item
                  name="tags"
                  label={
                    <Space>
                      <TagsOutlined />
                      标签 (最多5个)
                    </Space>
                  }
                >
                  <TagInput
                    value={formData.tags || []}
                    onChange={handleTagsChange}
                    maxTags={5}
                    placeholder="添加相关标签，按回车确认"
                  />
                </Form.Item>

                {/* 发帖设置 */}
                <Card size="small" className="post-settings-card">
                  <div className="settings-header">
                    <Space>
                      <SettingOutlined />
                      <Text strong>发帖设置</Text>
                    </Space>
                  </div>
                  
                  <div className="settings-content">
                    <Form.Item
                      name="isAnonymous"
                      valuePropName="checked"
                      className="setting-item"
                    >
                      <div className="setting-row">
                        <div className="setting-info">
                          <Text>匿名发布</Text>
                          <Text type="secondary" className="setting-desc">
                            隐藏您的用户名，以匿名方式发布
                          </Text>
                        </div>
                        <Switch />
                      </div>
                    </Form.Item>
                  </div>
                </Card>
              </Form>
            </Card>
          </Col>

          {/* 侧边栏 */}
          <Col xs={24} lg={6}>
            <div className="create-post-sidebar">
              {/* 操作按钮 */}
              <Card size="small" className="action-card">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    loading={loading}
                    onClick={handleSubmit}
                    block
                    size="large"
                  >
                    发布帖子
                  </Button>
                  
                  <Button
                    icon={<EyeOutlined />}
                    onClick={handlePreview}
                    block
                  >
                    预览效果
                  </Button>
                  
                  <div className="draft-actions">
                    <Space style={{ width: '100%' }}>
                      <Button
                        icon={<SaveOutlined />}
                        onClick={saveDraft}
                        disabled={draftSaved}
                        flex={1}
                      >
                        {draftSaved ? '已保存' : '保存草稿'}
                      </Button>
                      
                      <Button
                        icon={<DeleteOutlined />}
                        onClick={clearDraft}
                        danger
                        type="text"
                      >
                        清除
                      </Button>
                    </Space>
                  </div>
                </Space>
              </Card>

              {/* 发帖指南 */}
              <Card title="📝 发帖指南" size="small" className="guide-card">
                <div className="guide-content">
                  <div className="guide-item">
                    <Text strong>选择合适的分类</Text>
                    <Text type="secondary">
                      选择最符合内容的分类，便于其他同学找到
                    </Text>
                  </div>
                  
                  <div className="guide-item">
                    <Text strong>写好标题</Text>
                    <Text type="secondary">
                      简洁明了，概括主要内容，吸引读者点击
                    </Text>
                  </div>
                  
                  <div className="guide-item">
                    <Text strong>丰富内容</Text>
                    <Text type="secondary">
                      详细描述，配图说明，让内容更加生动
                    </Text>
                  </div>
                  
                  <div className="guide-item">
                    <Text strong>添加标签</Text>
                    <Text type="secondary">
                      使用相关标签，提高帖子的曝光度
                    </Text>
                  </div>
                </div>
              </Card>

              {/* 社区规则 */}
              <Card title="📋 社区规则" size="small" className="rules-card">
                <div className="rules-content">
                  <Alert
                    message="请遵守社区规则"
                    description={
                      <ul>
                        <li>友善交流，尊重他人</li>
                        <li>内容真实，不传播虚假信息</li>
                        <li>不发布违法违规内容</li>
                        <li>不恶意刷屏或灌水</li>
                        <li>保护个人隐私信息</li>
                      </ul>
                    }
                    type="warning"
                    showIcon
                  />
                </div>
              </Card>

              {/* 热门标签 */}
              <Card title="🏷️ 热门标签" size="small" className="tags-card">
                <div className="hot-tags">
                  {['校园生活', '学习交流', '兼职招聘', '美食推荐', '二手交易', '失物招领', '活动组织', '问题求助'].map(tag => (
                    <Tag 
                      key={tag}
                      className="hot-tag"
                      onClick={() => {
                        const currentTags = formData.tags || [];
                        if (!currentTags.includes(tag) && currentTags.length < 5) {
                          const newTags = [...currentTags, tag];
                          handleTagsChange(newTags);
                        }
                      }}
                    >
                      {tag}
                    </Tag>
                  ))}
                </div>
              </Card>
            </div>
          </Col>
        </Row>

        {/* 预览弹窗 */}
        <PostPreview
          visible={previewVisible}
          onClose={() => setPreviewVisible(false)}
          postData={{
            ...formData,
            title: form.getFieldValue('title'),
            content: form.getFieldValue('content'),
            author: {
              username: formData.isAnonymous ? '匿名用户' : user?.username || '',
              avatar: formData.isAnonymous ? '' : user?.avatar || '',
              isStudentVerified: user?.isStudentVerified || false
            }
          }}
        />
      </div>
    </MainLayout>
  );
};

export default CreatePost;