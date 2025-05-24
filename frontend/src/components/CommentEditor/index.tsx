import React, { useState } from 'react';
import { Input, Button, Space, Checkbox } from 'antd';
import { SendOutlined, CloseOutlined } from '@ant-design/icons';
import './index.less';

const { TextArea } = Input;

interface CommentEditorProps {
  placeholder?: string;
  defaultValue?: string;
  onSubmit: (content: string, isAnonymous: boolean) => void;
  onCancel: () => void;
  loading?: boolean;
}

const CommentEditor: React.FC<CommentEditorProps> = ({
  placeholder = '写下您的回复...',
  defaultValue = '',
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [content, setContent] = useState(defaultValue);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim(), isAnonymous);
      setContent('');
      setIsAnonymous(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="comment-editor">
      <TextArea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={1000}
        showCount
        onKeyPress={handleKeyPress}
        autoFocus
      />
      
      <div className="editor-actions">
        <Space>
          <Checkbox
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          >
            匿名回复
          </Checkbox>
          
          <Button
            size="small"
            icon={<CloseOutlined />}
            onClick={onCancel}
          >
            取消
          </Button>
          
          <Button
            type="primary"
            size="small"
            icon={<SendOutlined />}
            onClick={handleSubmit}
            disabled={!content.trim()}
            loading={loading}
          >
            回复
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default CommentEditor;