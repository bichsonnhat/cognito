import { currentUser } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export type ChatType = "conversation" | "code";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export async function saveChatHistory(
  messages: ChatMessage[],
  chatType: ChatType,
  title?: string
) {
  try {
    const user = await currentUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Generate title from first user message if not provided
    const generatedTitle = title || messages.find(m => m.role === "user")?.content.slice(0, 30) + "...";

    // Save chat history to database
    const chatHistory = await prismadb.chatHistory.create({
      data: {
        userId: user.id,
        chatType,
        messages: messages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content
        })),
        title: generatedTitle,
      },
    });

    return chatHistory;
  } catch (error) {
    console.error("Error saving chat history:", error);
    throw error;
  }
}

export async function updateChatHistory(
  chatId: string,
  messages: ChatMessage[],
  title?: string
) {
  try {
    const user = await currentUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Update existing chat history
    const chatHistory = await prismadb.chatHistory.update({
      where: {
        id: chatId,
        userId: user.id,
      },
      data: {
        messages: messages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content
        })),
        ...(title && { title }),
      },
    });

    return chatHistory;
  } catch (error) {
    console.error("Error updating chat history:", error);
    throw error;
  }
}

export async function getChatHistoryById(chatId: string) {
  try {
    const user = await currentUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const chatHistory = await prismadb.chatHistory.findUnique({
      where: {
        id: chatId,
        userId: user.id,
      },
    });

    return chatHistory;
  } catch (error) {
    console.error("Error getting chat history:", error);
    throw error;
  }
}

export async function getUserChatHistory(chatType?: ChatType) {
  try {
    const user = await currentUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const whereClause = chatType 
      ? { userId: user.id, chatType } 
      : { userId: user.id };

    const chatHistories = await prismadb.chatHistory.findMany({
      where: whereClause,
      orderBy: {
        updatedAt: "desc",
      },
    });

    return chatHistories;
  } catch (error) {
    console.error("Error getting user chat history:", error);
    throw error;
  }
}

export async function deleteChatHistory(chatId: string) {
  try {
    const user = await currentUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    await prismadb.chatHistory.delete({
      where: {
        id: chatId,
        userId: user.id,
      },
    });

    return true;
  } catch (error) {
    console.error("Error deleting chat history:", error);
    throw error;
  }
} 