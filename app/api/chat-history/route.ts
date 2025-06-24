import { NextResponse } from "next/server";
import { getUserChatHistory } from "@/lib/chat-history";
import { ChatType } from "@/lib/chat-history";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as ChatType | undefined;
    
    const chatHistories = await getUserChatHistory(type);
    
    return NextResponse.json(chatHistories);
  } catch (error) {
    console.error("Error getting chat history:", error);
    return NextResponse.json({ error: "Failed to get chat history" }, { status: 500 });
  }
} 