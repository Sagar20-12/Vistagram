import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";
import { useState } from "react";
import { Post } from "@/data/seedPosts";
import { toast } from "sonner";

type Props = {
  post: Post;
};

export default function VistaPostCard({ post }: Props) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [shares, setShares] = useState(post.shares);

  const initials = post.username.replace(/^@/, "").slice(0, 2).toUpperCase();
  const date = new Date(post.timestamp);

  const onLike = () => {
    setLiked((v) => !v);
    setLikes((n) => (liked ? n - 1 : n + 1));
    // TODO: Persist to Supabase when connected
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
      // TODO: Persist to Supabase when connected
    } catch (e) {
      toast.error("Share canceled");
    }
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
          <img
            src={post.image}
            alt={`POI photo: ${post.caption} by ${post.username}`}
            loading="lazy"
            className="block w-full h-auto"
          />
          <div className="p-4 flex flex-col gap-3">
            <p className="text-sm leading-relaxed">{post.caption}</p>
            <div className="flex items-center gap-2">
              <Button
                variant={liked ? "secondary" : "outline"}
                size="sm"
                aria-pressed={liked}
                aria-label={liked ? "Unlike" : "Like"}
                onClick={onLike}
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
