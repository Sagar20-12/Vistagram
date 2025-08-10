import { DraggableCardBody, DraggableCardContainer } from "./DraggableCard";
import { Button } from "./ui/button";
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import CommentSection from "./CommentSection";
import { deletePost, toggleLike, checkUserLike } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Post {
  id: string;
  author: string;
  location: string;
  image: string;
  caption: string;
  timestamp: string;
  likes: number;
  comments: number;
  commentsList?: Array<{
    id: string;
    userId: string;
    username: string;
    text: string;
    createdAt: Date;
  }>;
}

interface VistaPostCardDraggableProps {
  post: Post;
  onDelete?: (postId: string) => void;
  currentUserId?: string;
}

export default function VistaPostCardDraggable({ post, onDelete, currentUserId }: VistaPostCardDraggableProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // Check if user has liked this post on component mount
  useEffect(() => {
    if (user && post.id) {
      checkUserLike(post.id, user.uid)
        .then(liked => setIsLiked(liked))
        .catch(error => console.error('Failed to check like status:', error));
    }
  }, [user, post.id]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like posts');
      return;
    }

    setIsLiking(true);
    try {
      const result = await toggleLike(post.id, user.uid);
      setIsLiked(result.liked);
      setLikeCount(result.likes);
      
      if (result.liked) {
        toast.success('Post liked!');
      } else {
        toast.success('Post unliked');
      }
    } catch (error) {
      console.error('Like error:', error);
      toast.error(`Failed to ${isLiked ? 'unlike' : 'like'} post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUserId || !onDelete) return;
    
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      console.log('Starting delete process for post:', post.id);
      const success = await deletePost(post.id, currentUserId);
      if (success) {
        toast.success('Post deleted successfully');
        onDelete(post.id);
      } else {
        toast.error('Failed to delete post. Please check if the server is running.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(`Failed to delete post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  // Handle image URL - if it's a relative URL, prepend the API base URL
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // If it's a relative URL, prepend the API base URL
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    return `${API_BASE_URL}${imageUrl}`;
  };

  return (
    <DraggableCardContainer>
      <DraggableCardBody className="bg-white dark:bg-neutral-800 p-0">
        {/* Image */}
        <div className="relative h-64 w-full overflow-hidden bg-gray-100">
          {console.log('Rendering image with URL:', getImageUrl(post.image))} {/* Debug log */}
          {post.image ? (
            <img
              src={getImageUrl(post.image)}
              alt={post.caption}
              className="h-full w-full object-cover"
              onError={(e) => {
                console.error('Failed to load image:', post.image);
                // Show a placeholder instead of hiding the image
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          
          {/* Fallback placeholder if image fails to load or doesn't exist */}
          <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${post.image ? 'hidden' : ''}`}>
            <div className="text-center text-gray-400">
              <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📸</span>
              </div>
              <p className="text-sm">No image available</p>
              {post.image && (
                <p className="text-xs mt-1 text-gray-300">URL: {post.image}</p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {post.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm">{post.author}</p>
                <p className="text-xs text-gray-500">{post.location}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {onDelete && currentUserId && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Caption */}
          <p className="text-sm mb-3 line-clamp-2">{post.caption}</p>

          {/* Timestamp */}
          <p className="text-xs text-gray-500 mb-3">{formatTimeAgo(post.timestamp)}</p>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                             <Button
                 variant="ghost"
                 size="sm"
                 onClick={handleLike}
                 disabled={isLiking}
                 className={`h-8 w-8 p-0 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
               >
                 <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
               </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500">
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Like count */}
            <span className="text-xs text-gray-500 font-medium">
              {likeCount} likes
            </span>
          </div>

          {/* Comments Section */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <CommentSection 
              postId={post.id} 
              initialComments={post.commentsList || []}
            />
          </div>
        </div>
      </DraggableCardBody>
    </DraggableCardContainer>
  );
}
