"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MoreHorizontal, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface MessagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock conversations data
const mockConversations = [
  {
    id: "1",
    user: {
      name: "Sarah Johnson",
      avatar: "",
      initials: "SJ"
    },
    lastMessage: "That photo of Dubai is amazing! 📸",
    timestamp: "2m ago",
    unread: true
  },
  {
    id: "2",
    user: {
      name: "Mike Chen",
      avatar: "",
      initials: "MC"
    },
    lastMessage: "Thanks for the travel tips!",
    timestamp: "1h ago",
    unread: false
  },
  {
    id: "3",
    user: {
      name: "Emma Wilson",
      avatar: "",
      initials: "EW"
    },
    lastMessage: "When are you visiting Tokyo?",
    timestamp: "3h ago",
    unread: true
  },
  {
    id: "4",
    user: {
      name: "Alex Rodriguez",
      avatar: "",
      initials: "AR"
    },
    lastMessage: "Love your photography style!",
    timestamp: "1d ago",
    unread: false
  }
];

export default function MessagesDialog({ open, onOpenChange }: MessagesDialogProps) {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = mockConversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[600px] p-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="flex items-center justify-between">
            <span>Messages</span>
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r">
            <div className="p-3 border-b">
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8"
              />
            </div>
            <ScrollArea className="h-[500px]">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedConversation === conversation.id ? "bg-gray-100" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.user.avatar} />
                      <AvatarFallback>{conversation.user.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">{conversation.user.name}</p>
                        <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                    </div>
                    {conversation.unread && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-3 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {mockConversations.find(c => c.id === selectedConversation)?.user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {mockConversations.find(c => c.id === selectedConversation)?.user.name}
                      </p>
                      <p className="text-xs text-gray-500">Active now</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-3">
                    {/* Mock messages */}
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-[70%]">
                        <p className="text-sm">Hey! I saw your post about Dubai. It looks incredible!</p>
                        <p className="text-xs text-gray-500 mt-1">2:30 PM</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-blue-500 text-white rounded-lg px-3 py-2 max-w-[70%]">
                        <p className="text-sm">Thanks! It was an amazing trip. Have you been there?</p>
                        <p className="text-xs text-blue-100 mt-1">2:32 PM</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-[70%]">
                        <p className="text-sm">Not yet, but it's definitely on my bucket list! 📸</p>
                        <p className="text-xs text-gray-500 mt-1">2:35 PM</p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!message.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">💬</div>
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
