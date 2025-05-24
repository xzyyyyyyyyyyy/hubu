import React, { useState } from 'react';
import { Upload, Modal, Image, Button, Space, Progress, message } from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  UploadOutlined 
} from '@ant-design/icons';
import { uploadToQiniu } from '../../services/uploadService';
import './index.less';

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxCount?: number;
  maxSize?: number; // MB
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value = [],
  onChange,
  maxCount = 9,
  maxSize = 10
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  // 自定义上传
  const handleUpload = async (file: File) => {
    if (value.length >= maxCount) {
      message.error(`最多只能上传 ${maxCount} 张图片`);
      return false;
    }

    if (file.size / 1024 / 1024 > maxSize) {
      message.error(`图片大小不能超过 ${maxSize}MB`);
      return false;
    }

    if (!file.type.startsWith('image/')) {
      message.error('只能上传图片文件');
      return false;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const imageUrl = await uploadToQiniu(file, 'posts');
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        onChange([...value, imageUrl]);
        setUploading(false);
        setUploadProgress(0);
        message.success('图片上传成功');
      }, 500);

    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      message.error('图片上传失败，请重试');
    }

    return false; // 阻止默认上传行为
  };

  // 删除图片
  const handleDelete = (index: number) => {
    const newImages = [...value];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  // 预览图片
  const handlePreview = (url: string) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };

  // 上传区域
  const uploadButton = (
    <div className="upload-button">
      {uploading ? (
        <div className="upload-progress">
          <Progress
            type="circle"
            percent={uploadProgress}
            width={40}
            strokeWidth={8}
          />
          <div>上传中</div>
        </div>
      ) : (
        <>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>上传图片</div>
        </>
      )}
    </div>
  );

  return (
    <div className="image-uploader">
      <div className="upload-list">
        {value.map((url, index) => (
          <div key={index} className="upload-item">
            <div className="image-wrapper">
              <Image
                src={url}
                alt={`图片 ${index + 1}`}
                width={100}
                height={100}
                style={{ objectFit: 'cover' }}
                preview={false}
              />
              <div className="image-actions">
                <Button
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handlePreview(url)}
                />
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => handleDelete(index)}
                />
              </div>
            </div>
          </div>
        ))}
        
        {value.length < maxCount && (
          <Upload
            beforeUpload={handleUpload}
            showUploadList={false}
            accept="image/*"
            disabled={uploading}
          >
            <div className="upload-item">
              {uploadButton}
            </div>
          </Upload>
        )}
      </div>

      <div className="upload-tips">
        <Space>
          <span>支持 JPG、PNG、GIF 格式</span>
          <span>单张图片不超过 {maxSize}MB</span>
          <span>最多上传 {maxCount} 张</span>
        </Space>
      </div>

      {/* 图片预览 */}
      <Modal
        open={previewVisible}
        title="图片预览"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width="80%"
        style={{ maxWidth: 800 }}
      >
        <Image
          src={previewImage}
          style={{ width: '100%' }}
          preview={false}
        />
      </Modal>
    </div>
  );
};

export default ImageUploader;