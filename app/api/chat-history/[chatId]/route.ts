import { NextResponse } from "next/server";
import { 
  getChatHistoryById, 
  updateChatHistory, 
  deleteChatHistory 
} from "@/lib/chat-history";

export async function GET(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatHistory = await getChatHistoryById(params.chatId);
    
    if (!chatHistory) {
      return NextResponse.json({ error: "Chat history not found" }, { status: 404 });
    }
    
    return NextResponse.json(chatHistory);
  } catch (error) {
    console.error("Error getting chat history:", error);
    return NextResponse.json({ error: "Failed to get chat history" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { messages, title } = await req.json();
    
    const chatHistory = await updateChatHistory(params.chatId, messages, title);
    
    return NextResponse.json(chatHistory);
  } catch (error) {
    console.error("Error updating chat history:", error);
    return NextResponse.json({ error: "Failed to update chat history" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    await deleteChatHistory(params.chatId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat history:", error);
    return NextResponse.json({ error: "Failed to delete chat history" }, { status: 500 });
  }
} 