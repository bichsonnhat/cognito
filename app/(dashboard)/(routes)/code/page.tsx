"use client";

import { useChat } from "ai/react";
import { Send, History } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import UserMessage from "@/components/dashboard/user-message";
import AiResponse from "@/components/dashboard/ai-response";
import { Textarea } from "@/components/ui/textarea";
import MarkdownResponse from "@/components/dashboard/markdown-response";
import ToolsNavigation from "@/components/dashboard/tools-navigation";
import { useProStore } from "@/stores/pro-store";
import { cn } from "@/lib/utils";
import ChatHistory from "@/components/dashboard/chat-history";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const CodePage = () => {
  const { handleOpenOrCloseProModal } = useProStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    error,
    setMessages
  } = useChat({
    api: "/api/code",
    body: {
      chatId: currentChatId
    }
  });

  useEffect(() => {
    if (error) {
      const errorParsed = JSON.parse(error?.message);
      if (errorParsed?.status === 403) {
        handleOpenOrCloseProModal();
      }
    }
  }, [error, handleOpenOrCloseProModal]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleClearChat = () => {
    setMessages([]);
    setCurrentChatId(null);
  }

  const handleSelectChat = (chatId: string, chatMessages: any[]) => {
    setCurrentChatId(chatId);
    setMessages(chatMessages);
    setShowHistory(false);
  };

  const handleDeleteChat = (chatId: string) => {
    if (currentChatId === chatId) {
      setMessages([]);
      setCurrentChatId(null);
    }
  };

  return (
    <div className="h-full relative flex flex-col justify-between">
      <div className="absolute top-2 right-2 z-10">
        <Sheet open={showHistory} onOpenChange={setShowHistory}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full"
              onClick={() => setShowHistory(true)}
            >
              <History className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="py-6">
              <h3 className="text-lg font-medium mb-4">Chat History</h3>
              <ChatHistory 
                chatType="code" 
                onSelectChat={handleSelectChat}
                onDeleteChat={handleDeleteChat}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div
        ref={containerRef}
        className={cn(
          "h-[calc(100vh-180px)] pl-4 overflow-y-auto space-y-10 scroll-smooth",
          "lg:pl-0"
        )}>
        {messages.length > 0
          ? <>
            {
              messages.map(m => (
                <div key={m.id} className="whitespace-pre-wrap">
                  {m.role === 'user' ?
                    <UserMessage>
                      <MarkdownResponse content={m.content} />
                    </UserMessage>
                    :
                    <AiResponse>
                      <MarkdownResponse content={m.content} />
                    </AiResponse>
                  }
                </div>
              ))
            }
            <div className="absolute left-0 bottom-20 text-right w-full pr-3">
              <Button
                size="sm"
                onClick={handleClearChat}
                variant="outline"
              >
                Clear chat
              </Button>
            </div>
          </>
          : <ToolsNavigation />}
      </div>
      <div className="mb-[13px]">
        <form
          onSubmit={isLoading ? stop : handleSubmit}
          className="flex items-center w-full relative"
        >
          <Textarea
            placeholder="Create a beautiful button using Tailwind and React."
            value={input}
            className="min-h-1 resize-none"
            onChange={handleInputChange}
          />
          <Button
            type="submit"
            disabled={!input}
            className="absolute right-2 gradient-btn">
            {
              isLoading
                ? "Stop"
                : <Send />
            }
          </Button>
        </form>
      </div>
    </div>
  )
}

export default CodePage;
