import React, { useState } from 'react';
import { 
  Modal, 
  Upload, 
  Avatar, 
  Button, 
  Space, 
  message,
  Row,
  Col,
  Typography
} from 'antd';
import { 
  UploadOutlined,
  CameraOutlined,
  UserOutlined
} from '@ant-design/icons';
import { uploadToQiniu } from '../../services/uploadService';
import './index.less';

const { Text } = Typography;

interface AvatarUploadProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (avatarUrl: string) => void;
  currentAvatar?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  visible,
  onCancel,
  onSuccess,
  currentAvatar
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string>('');

  // 默认头像列表
  const defaultAvatars = [
    '/avatars/default-1.png',
    '/avatars/default-2.png',
    '/avatars/default-3.png',
    '/avatars/default-4.png',
    '/avatars/default-5.png',
    '/avatars/default-6.png',
    '/avatars/default-7.png',
    '/avatars/default-8.png',
  ];

  const handleUpload = async (file: File) => {
    if (file.size / 1024 / 1024 > 5) {
      message.error('头像大小不能超过5MB');
      return false;
    }

    if (!file.type.startsWith('image/')) {
      message.error('只能上传图片文件');
      return false;
    }

    try {
      setUploading(true);
      const avatarUrl = await uploadToQiniu(file, 'avatars');
      setPreviewAvatar(avatarUrl);
      message.success('头像上传成功');
    } catch (error) {
      message.error('头像上传失败，请重试');
    } finally {
      setUploading(false);
    }

    return false; // 阻止默认上传行为
  };

  const handleSave = () => {
    if (previewAvatar) {
      onSuccess(previewAvatar);
    } else {
      message.warning('请先选择或上传头像');
    }
  };

  const handleCancel = () => {
    setPreviewAvatar('');
    onCancel();
  };

  return (
    <Modal
      title="更换头像"
      open={visible}
      onCancel={handleCancel}
      footer={
        <Space>
          <Button onClick={handleCancel}>取消</Button>
          <Button 
            type="primary" 
            onClick={handleSave}
            disabled={!previewAvatar}
          >
            保存
          </Button>
        </Space>
      }
      width={500}
      className="avatar-upload-modal"
    >
      <div className="modal-content">
        {/* 当前头像预览 */}
        <div className="avatar-preview-section">
          <Text strong>头像预览</Text>
          <div className="avatar-preview">
            <Avatar 
              src={previewAvatar || currentAvatar} 
              size={120}
              icon={<UserOutlined />}
            />
          </div>
        </div>

        {/* 上传自定义头像 */}
        <div className="upload-section">
          <Text strong>上传自定义头像</Text>
          <Upload
            beforeUpload={handleUpload}
            showUploadList={false}
            accept="image/*"
            disabled={uploading}
          >
            <Button 
              icon={<UploadOutlined />}
              loading={uploading}
              block
            >
              {uploading ? '上传中...' : '选择图片上传'}
            </Button>
          </Upload>
          <Text type="secondary" style={{ fontSize: 12 }}>
            支持 JPG、PNG 格式，文件大小不超过 5MB
          </Text>
        </div>

        {/* 默认头像选择 */}
        <div className="default-avatars-section">
          <Text strong>选择默认头像</Text>
          <Row gutter={[16, 16]} className="default-avatars-grid">
            {defaultAvatars.map((avatar, index) => (
              <Col span={6} key={index}>
                <div 
                  className={`default-avatar-item ${previewAvatar === avatar ? 'selected' : ''}`}
                  onClick={() => setPreviewAvatar(avatar)}
                >
                  <Avatar 
                    src={avatar} 
                    size={60}
                    icon={<UserOutlined />}
                  />
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </Modal>
  );
};

export default AvatarUpload;