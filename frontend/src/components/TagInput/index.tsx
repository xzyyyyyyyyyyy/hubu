import React, { useState, useRef } from 'react';
import { Tag, Input, Space, Typography } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import './index.less';

const { Text } = Typography;

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onChange,
  maxTags = 5,
  placeholder = '输入标签后按回车确认'
}) => {
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<any>(null);

  // 显示输入框
  const showInput = () => {
    setInputVisible(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // 添加标签
  const handleInputConfirm = () => {
    const trimmedValue = inputValue.trim();
    
    if (trimmedValue && !value.includes(trimmedValue) && value.length < maxTags) {
      onChange([...value, trimmedValue]);
    }
    
    setInputVisible(false);
    setInputValue('');
  };

  // 删除标签
  const handleTagClose = (tagToRemove: string) => {
    const newTags = value.filter(tag => tag !== tagToRemove);
    onChange(newTags);
  };

  // 键盘事件处理
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInputConfirm();
    }
  };

  return (
    <div className="tag-input">
      <div className="tags-container">
        <Space wrap>
          {value.map((tag, index) => (
            <Tag
              key={tag}
              closable
              closeIcon={<CloseOutlined />}
              onClose={() => handleTagClose(tag)}
              className="editable-tag"
            >
              {tag}
            </Tag>
          ))}
          
          {inputVisible ? (
            <Input
              ref={inputRef}
              type="text"
              size="small"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleInputConfirm}
              onKeyPress={handleKeyPress}
              style={{ width: 120 }}
              maxLength={20}
            />
          ) : (
            value.length < maxTags && (
              <Tag
                onClick={showInput}
                className="add-tag"
                style={{ cursor: 'pointer' }}
              >
                <PlusOutlined /> 添加标签
              </Tag>
            )
          )}
        </Space>
      </div>
      
      <div className="tag-input-tips">
        <Text type="secondary" style={{ fontSize: 12 }}>
          {value.length}/{maxTags} 个标签，{placeholder}
        </Text>
      </div>
    </div>
  );
};

export default TagInput;