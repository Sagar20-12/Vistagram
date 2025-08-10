import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Post } from "@/data/seedPosts";
import { toast } from "sonner";
import { toggleLike, checkUserLike } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  post: Post;
};

export default function VistaPostCard({ post }: Props) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [shares, setShares] = useState(post.shares);
  const [isLiking, setIsLiking] = useState(false);

  const initials = post.username.replace(/^@/, "").slice(0, 2).toUpperCase();
  const date = new Date(post.timestamp);

  // Check if user has liked this post on component mount
  useEffect(() => {
    if (user && post.id) {
      checkUserLike(post.id, user.uid)
        .then(liked => setLiked(liked))
        .catch(error => console.error('Failed to check like status:', error));
    }
  }, [user, post.id]);

  const onLike = async () => {
    if (!user) {
      toast.error('Please sign in to like posts');
      return;
    }

    setIsLiking(true);
    try {
      const result = await toggleLike(post.id, user.uid);
      setLiked(result.liked);
      setLikes(result.likes);
      
      if (result.liked) {
        toast.success('Post liked!');
      } else {
        toast.success('Post unliked');
      }
    } catch (error) {
      console.error('Like error:', error);
      toast.error(`Failed to ${liked ? 'unlike' : 'like'} post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLiking(false);
    }
  };

  const onShare = async () => {
    const url = `${window.location.origin}/#post-${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Vistagram", text: post.caption, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setShares((n) => n + 1);
      toast.success("Post shared");
      // TODO: Persist to MongoDB when connected
    } catch (e) {
      toast.error("Share canceled");
    }
  };

  // Handle image URL - if it's a relative URL, prepend the API base URL
  const getImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // If it's a relative URL, prepend the API base URL
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    return `${API_BASE_URL}${imageUrl}`;
  };

  return (
    <article id={`post-${post.id}`} className="w-full">
      <Card className="glass-card overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-3">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-left">
            <span className="font-semibold leading-tight">{post.username}</span>
            <time className="text-sm text-muted-foreground" dateTime={post.timestamp}>
              {date.toLocaleString()}
            </time>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative">
            <img
              src={getImageUrl(post.image)}
              alt={`POI photo: ${post.caption} by ${post.username}`}
              loading="lazy"
              className="block w-full h-auto"
              onError={(e) => {
                console.error('Failed to load image:', post.image);
                // Show a placeholder instead of hiding the image
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            {/* Fallback placeholder if image fails to load */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 hidden">
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
          <div className="p-4 flex flex-col gap-3">
            <p className="text-sm leading-relaxed">{post.caption}</p>
            <div className="flex items-center gap-2">
              <Button
                variant={liked ? "secondary" : "outline"}
                size="sm"
                aria-pressed={liked}
                aria-label={liked ? "Unlike" : "Like"}
                onClick={onLike}
                disabled={isLiking}
              >
                <Heart className={liked ? "fill-current" : ""} /> {likes}
              </Button>
              <Button variant="outline" size="sm" aria-label="Share" onClick={onShare}>
                <Share2 /> {shares}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </article>
  );
}
