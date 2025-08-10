import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { addComment, getComments } from '@/lib/api';
import { toast } from 'sonner';
import { Send, MessageCircle } from 'lucide-react';

interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: Date;
}

interface CommentSectionProps {
  postId: string;
  initialComments?: Comment[];
  alwaysShow?: boolean;
}

export default function CommentSection({ postId, initialComments = [], alwaysShow = false }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(alwaysShow);

  useEffect(() => {
    if (showComments && comments.length === 0) {
      loadComments();
    }
  }, [showComments]);

  // Load comments immediately if alwaysShow is true
  useEffect(() => {
    if (alwaysShow) {
      loadComments();
    }
  }, [alwaysShow]);

  const loadComments = async () => {
    try {
      const fetchedComments = await getComments(postId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }
    
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Submitting comment:', {
        postId,
        userId: user.uid,
        username: user.displayName || 'Anonymous',
        text: newComment
      });

      const comment = await addComment(
        postId,
        user.uid,
        user.displayName || 'Anonymous',
        newComment.trim()
      );
      
      if (comment) {
        setComments(prev => [comment, ...prev]);
        setNewComment('');
        toast.success('Comment added successfully!');
      } else {
        toast.error('Failed to add comment. Please check if the server is running.');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error(`Failed to add comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-3">
      {/* Comment Toggle Button - Only show if not alwaysShow */}
      {!alwaysShow && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          {comments.length > 0 ? `${comments.length} comment${comments.length !== 1 ? 's' : ''}` : 'Add comment'}
        </Button>
      )}

      {(showComments || alwaysShow) && (
        <div className={`space-y-4 ${alwaysShow ? 'h-full flex flex-col' : ''}`}>
          {/* Add Comment Form */}
          {user && (
            <form onSubmit={handleSubmitComment} className="flex gap-2 p-4 border-b">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL || ''} />
                <AvatarFallback className="text-xs">
                  {user.displayName?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  disabled={isSubmitting}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newComment.trim() || isSubmitting}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className={`space-y-3 ${alwaysShow ? 'flex-1 overflow-y-auto p-4' : ''}`}>
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {comment.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
