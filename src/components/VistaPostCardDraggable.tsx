import { DraggableCardBody, DraggableCardContainer } from "./DraggableCard";
import { Button } from "./ui/button";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import CommentSection from "./CommentSection";

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
}

export default function VistaPostCardDraggable({ post }: VistaPostCardDraggableProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setIsLiked(!isLiked);
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

  return (
    <DraggableCardContainer>
      <DraggableCardBody className="bg-white dark:bg-neutral-800 p-0">
        {/* Image */}
        <div className="relative h-64 w-full overflow-hidden">
          <img
            src={post.image}
            alt={post.caption}
            className="h-full w-full object-cover"
            onError={(e) => {
              console.error('Failed to load image:', post.image);
              e.currentTarget.style.display = 'none';
            }}
          />
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
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
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
