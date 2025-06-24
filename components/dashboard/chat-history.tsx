"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChatType } from "@/lib/chat-history";

interface ChatHistoryProps {
  chatType: ChatType;
  onSelectChat: (chatId: string, messages: any[]) => void;
  onDeleteChat: (chatId: string) => void;
}

interface ChatHistoryItem {
  id: string;
  title: string;
  messages: any[];
  updatedAt: string;
}

export default function ChatHistory({ chatType, onSelectChat, onDeleteChat }: ChatHistoryProps) {
  const [chatHistories, setChatHistories] = useState<ChatHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/chat-history?type=${chatType}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch chat history");
        }
        
        const data = await response.json();
        setChatHistories(data);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [chatType]);

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const response = await fetch(`/api/chat-history/${chatId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete chat history");
      }
      
      setChatHistories(prev => prev.filter(chat => chat.id !== chatId));
      onDeleteChat(chatId);
    } catch (error) {
      console.error("Error deleting chat history:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p>Loading chat history...</p>
      </div>
    );
  }

  if (chatHistories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40">
        <p className="text-muted-foreground">No chat history found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
      {chatHistories.map((chat) => (
        <Card
          key={chat.id}
          className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onSelectChat(chat.id, chat.messages)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 truncate">
              <h4 className="font-medium truncate">{chat.title}</h4>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3 mr-1" />
                <span>
                  {new Date(chat.updatedAt).toLocaleDateString()} {new Date(chat.updatedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
              onClick={(e) => handleDeleteChat(chat.id, e)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
} 