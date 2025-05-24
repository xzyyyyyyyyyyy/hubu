import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Comment, 
  Avatar, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Pagination,
  Empty,
  Divider,
  Select,
  message,
  Modal
} from 'antd';
import { 
  LikeOutlined,
  LikeFilled,
  DislikeOutlined,
  DislikeFilled,
  MessageOutlined,
  UserOutlined,
  SendOutlined
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { 
  fetchComments, 
  createComment, 
  toggleLikeComment,
  deleteComment 
} from '../../store/slices/commentSlice';
import CommentEditor from '../CommentEditor';
import './index.less';

const { TextArea } = Input;
const { Option } = Select;

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const dispatch = useAppDispatch();
  const { comments, loading, pagination } = useAppSelector(state => state.comments);
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'likes'>('latest');
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    dispatch(fetchComments({ 
      postId, 
      page: 1, 
      limit: 20, 
      sort: sortBy 
    }));
  }, [dispatch, postId, sortBy]);

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      return;
    }

    if (!newComment.trim()) {
      message.warning('请输入评论内容');
      return;
    }

    try {
      await dispatch(createComment({
        content: newComment,
        post: postId,
        isAnonymous
      })).unwrap();
      
      setNewComment('');
      message.success('评论发布成功');
      
      // 重新获取评论列表
      dispatch(fetchComments({ 
        postId, 
        page: 1, 
        limit: 20, 
        sort: sortBy 
      }));
    } catch (error) {
      message.error('评论发布失败');
    }
  };

  const handleReply = async (parentId: string, content: string, anonymous: boolean) => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      return;
    }

    try {
      await dispatch(createComment({
        content,
        post: postId,
        parent: parentId,
        isAnonymous: anonymous
      })).unwrap();
      
      setReplyingTo(null);
      message.success('回复发布成功');
      
      // 重新获取评论列表
      dispatch(fetchComments({ 
        postId, 
        page: pagination.current, 
        limit: 20, 
        sort: sortBy 
      }));
    } catch (error) {
      message.error('回复发布失败');
    }
  };

  const handleLikeComment = (commentId: string, type: 'like' | 'dislike') => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      return;
    }
    
    dispatch(toggleLikeComment({ commentId, type }));
  };

  const handleDeleteComment = (commentId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条评论吗？',
      onOk: async () => {
        try {
          await dispatch(deleteComment(commentId)).unwrap();
          message.success('评论删除成功');
          
          // 重新获取评论列表
          dispatch(fetchComments({ 
            postId, 
            page: pagination.current, 
            limit: 20, 
            sort: sortBy 
          }));
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  const formatTime = (timeStr: string) => {
    const now = new Date();
    const time = new Date(timeStr);
    const diff = now.getTime() - time.getTime();
    
    if (diff < 60 * 1000) return '刚刚';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分钟前`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
  };

  const renderComment = (comment: any) => {
    const isCommentAuthor = comment.author.id === user?.id;
    const canDelete = isCommentAuthor || user?.role === 'admin';

    return (
      <Comment
        key={comment.id}
        author={
          <Space>
            <span>
              {comment.isAnonymous ? '匿名用户' : comment.author.username}
            </span>
            {comment.author.isStudentVerified && (
              <Tag color="blue" size="small">已认证</Tag>
            )}
          </Space>
        }
        avatar={
          <Avatar 
            src={comment.isAnonymous ? null : comment.author.avatar}
            icon={<UserOutlined />}
          />
        }
        content={
          <div className="comment-content">
            <p>{comment.content}</p>
          </div>
        }
        datetime={formatTime(comment.createdAt)}
        actions={[
          <Space key="actions">
            <Button
              type="text"
              size="small"
              icon={comment.userLikeStatus === 'like' ? <LikeFilled /> : <LikeOutlined />}
              onClick={() => handleLikeComment(comment.id, 'like')}
            >
              {comment.stats.likes}
            </Button>
            
            <Button
              type="text"
              size="small"
              icon={comment.userLikeStatus === 'dislike' ? <DislikeFilled /> : <DislikeOutlined />}
              onClick={() => handleLikeComment(comment.id, 'dislike')}
            >
              {comment.stats.dislikes}
            </Button>
            
            <Button
              type="text"
              size="small"
              icon={<MessageOutlined />}
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            >
              回复
            </Button>
            
            {canDelete && (
              <Button
                type="text"
                size="small"
                danger
                onClick={() => handleDeleteComment(comment.id)}
              >
                删除
              </Button>
            )}
          </Space>
        ]}
      >
        {/* 回复框 */}
        {replyingTo === comment.id && (
          <CommentEditor
            placeholder={`回复 ${comment.isAnonymous ? '匿名用户' : comment.author.username}`}
            onSubmit={(content, anonymous) => handleReply(comment.id, content, anonymous)}
            onCancel={() => setReplyingTo(null)}
          />
        )}
        
        {/* 子回复 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map((reply: any) => renderComment(reply))}
          </div>
        )}
      </Comment>
    );
  };

  return (
    <Card 
      title={
        <Space>
          <MessageOutlined />
          评论 ({pagination.total})
        </Space>
      }
      extra={
        <Select
          value={sortBy}
          onChange={setSortBy}
          size="small"
          style={{ width: 100 }}
        >
          <Option value="latest">最新</Option>
          <Option value="oldest">最早</Option>
          <Option value="likes">最热</Option>
        </Select>
      }
      className="comment-section"
    >
      {/* 发表评论 */}
      {isAuthenticated ? (
        <div className="comment-editor">
          <div className="editor-header">
            <Space>
              <Avatar 
                src={user?.avatar} 
                size={32}
                icon={<UserOutlined />}
              />
              <span>{user?.username}</span>
            </Space>
          </div>
          
          <TextArea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="发表您的看法..."
            rows={4}
            maxLength={1000}
            showCount
          />
          
          <div className="editor-actions">
            <Space>
              <label>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <span style={{ marginLeft: 4 }}>匿名发布</span>
              </label>
            </Space>
            
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
            >
              发布评论
            </Button>
          </div>
        </div>
      ) : (
        <div className="login-prompt">
          <p>请先登录后发表评论</p>
          <Button type="primary" href="/login">
            立即登录
          </Button>
        </div>
      )}

      <Divider />

      {/* 评论列表 */}
      {loading ? (
        <div className="loading-comments">加载中...</div>
      ) : comments.length > 0 ? (
        <>
          <div className="comments-list">
            {comments.map(comment => renderComment(comment))}
          </div>
          
          {pagination.total > pagination.pageSize && (
            <div className="comments-pagination">
              <Pagination
                current={pagination.current}
                total={pagination.total}
                pageSize={pagination.pageSize}
                onChange={(page) => {
                  dispatch(fetchComments({ 
                    postId, 
                    page, 
                    limit: 20, 
                    sort: sortBy 
                  }));
                }}
                showSizeChanger={false}
                size="small"
              />
            </div>
          )}
        </>
      ) : (
        <Empty
          description="暂无评论"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          {isAuthenticated && (
            <p>成为第一个评论的人吧！</p>
          )}
        </Empty>
      )}
    </Card>
  );
};

export default CommentSection;