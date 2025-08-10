"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, UserPlus, MapPin, MoreHorizontal, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock notifications data
const mockNotifications = [
  {
    id: "1",
    type: "like",
    user: {
      name: "Sarah Johnson",
      avatar: "",
      initials: "SJ"
    },
    action: "liked your post",
    target: "Dubai Burj Khalifa",
    timestamp: "2m ago",
    read: false,
    postId: "post1"
  },
  {
    id: "2",
    type: "comment",
    user: {
      name: "Mike Chen",
      avatar: "",
      initials: "MC"
    },
    action: "commented on your post",
    target: "Amazing shot! Love the composition",
    timestamp: "5m ago",
    read: false,
    postId: "post2"
  },
  {
    id: "3",
    type: "follow",
    user: {
      name: "Emma Wilson",
      avatar: "",
      initials: "EW"
    },
    action: "started following you",
    target: "",
    timestamp: "1h ago",
    read: false,
    postId: ""
  },
  {
    id: "4",
    type: "like",
    user: {
      name: "Alex Rodriguez",
      avatar: "",
      initials: "AR"
    },
    action: "liked your post",
    target: "Paris Eiffel Tower",
    timestamp: "2h ago",
    read: true,
    postId: "post3"
  },
  {
    id: "5",
    type: "comment",
    user: {
      name: "Lisa Park",
      avatar: "",
      initials: "LP"
    },
    action: "commented on your post",
    target: "When was this taken? Beautiful lighting!",
    timestamp: "3h ago",
    read: true,
    postId: "post4"
  },
  {
    id: "6",
    type: "follow",
    user: {
      name: "David Kim",
      avatar: "",
      initials: "DK"
    },
    action: "started following you",
    target: "",
    timestamp: "1d ago",
    read: true,
    postId: ""
  }
];

export default function NotificationsDialog({ open, onOpenChange }: NotificationsDialogProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "unread") return !notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "comment":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "follow":
        return <UserPlus className="h-4 w-4 text-green-500" />;
      default:
        return <MapPin className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "like":
        return "bg-red-50 border-red-200";
      case "comment":
        return "bg-blue-50 border-blue-200";
      case "follow":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[600px] p-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-blue-500 text-white">
                  {unreadCount}
                </Badge>
              )}
            </DialogTitle>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark all read
              </Button>
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex gap-1 mt-3">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
              className="text-xs"
            >
              All
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("unread")}
              className="text-xs"
            >
              Unread
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[500px]">
          {filteredNotifications.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">🔔</div>
                <p>No notifications</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b hover:bg-gray-50 transition-colors ${
                    !notification.read ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src={notification.user.avatar} />
                      <AvatarFallback className="text-xs">
                        {notification.user.initials}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getNotificationIcon(notification.type)}
                            <span className="font-medium text-sm">
                              {notification.user.name}
                            </span>
                            <span className="text-sm text-gray-600">
                              {notification.action}
                            </span>
                          </div>
                          
                          {notification.target && (
                            <p className="text-sm text-gray-600 mb-1">
                              "{notification.target}"
                            </p>
                          )}
                          
                          <p className="text-xs text-gray-500">
                            {notification.timestamp}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
