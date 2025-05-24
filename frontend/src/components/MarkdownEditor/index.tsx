import React, { useState, useRef } from 'react';
import { Input, Button, Space, Tabs, Typography, Upload, message } from 'antd';
import { 
  EyeOutlined,
  EditOutlined,
  PictureOutlined,
  LinkOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  CodeOutlined
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { uploadToQiniu } from '../../services/uploadService';
import './index.less';

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Text } = Typography;

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = '请输入内容...',
  height = 400
}) => {
  const [activeTab, setActiveTab] = useState('edit');
  const textareaRef = useRef<any>(null);

  // 插入文本到光标位置
  const insertText = (text: string) => {
    const textarea = textareaRef.current?.resizableTextArea?.textArea;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + text + value.substring(end);
    
    onChange(newValue);
    
    // 设置光标位置
    setTimeout(() => {
      const newPosition = start + text.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);
  };

  // 包围选中文本
  const wrapText = (prefix: string, suffix?: string) => {
    const textarea = textareaRef.current?.resizableTextArea?.textArea;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const wrapSuffix = suffix || prefix;
    
    const newText = prefix + selectedText + wrapSuffix;
    const newValue = value.substring(0, start) + newText + value.substring(end);
    
    onChange(newValue);
    
    // 设置光标位置
    setTimeout(() => {
      if (selectedText) {
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      } else {
        const newPosition = start + prefix.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }
      textarea.focus();
    }, 0);
  };

  // 工具栏按钮
  const toolbarButtons = [
    {
      icon: <BoldOutlined />,
      title: '粗体',
      action: () => wrapText('**')
    },
    {
      icon: <ItalicOutlined />,
      title: '斜体',
      action: () => wrapText('*')
    },
    {
      icon: <UnorderedListOutlined />,
      title: '无序列表',
      action: () => insertText('\n- ')
    },
    {
      icon: <OrderedListOutlined />,
      title: '有序列表',
      action: () => insertText('\n1. ')
    },
    {
      icon: <CodeOutlined />,
      title: '代码',
      action: () => wrapText('`')
    },
    {
      icon: <LinkOutlined />,
      title: '链接',
      action: () => insertText('[链接文字](URL)')
    }
  ];

  // 上传图片
  const handleImageUpload = async (file: File) => {
    try {
      const imageUrl = await uploadToQiniu(file, 'posts');
      insertText(`\n![图片描述](${imageUrl})\n`);
      message.success('图片上传成功');
    } catch (error) {
      message.error('图片上传失败');
    }
    return false; // 阻止默认上传行为
  };

  return (
    <div className="markdown-editor">
      {/* 工具栏 */}
      <div className="editor-toolbar">
        <Space size="small">
          {toolbarButtons.map((button, index) => (
            <Button
              key={index}
              type="text"
              size="small"
              icon={button.icon}
              title={button.title}
              onClick={button.action}
            />
          ))}
          
          <Upload
            beforeUpload={handleImageUpload}
            showUploadList={false}
            accept="image/*"
          >
            <Button
              type="text"
              size="small"
              icon={<PictureOutlined />}
              title="插入图片"
            />
          </Upload>
        </Space>
      </div>

      {/* 编辑区域 */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="editor-tabs"
      >
        <TabPane tab={<><EditOutlined /> 编辑</>} key="edit">
          <TextArea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ height, resize: 'vertical' }}
            className="markdown-textarea"
          />
        </TabPane>
        
        <TabPane tab={<><EyeOutlined /> 预览</>} key="preview">
          <div 
            className="markdown-preview"
            style={{ height, overflow: 'auto' }}
          >
            {value ? (
              <ReactMarkdown className="markdown-content">
                {value}
              </ReactMarkdown>
            ) : (
              <Text type="secondary">暂无内容预览</Text>
            )}
          </div>
        </TabPane>
      </Tabs>

      {/* 帮助提示 */}
      <div className="editor-help">
        <Text type="secondary" style={{ fontSize: 12 }}>
          支持 Markdown 语法：**粗体**、*斜体*、[链接](URL)、![图片](URL)、`代码`
        </Text>
      </div>
    </div>
  );
};

export default MarkdownEditor;