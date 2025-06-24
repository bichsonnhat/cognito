import { currentUser } from "@clerk/nextjs/server";
import OpenAI from 'openai';
import { NextResponse } from "next/server";
import { checkSubscription, checkUserLimit, incrementUserLimit } from "@/lib/user-limit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveChatHistory } from "@/lib/chat-history";

const apiKey = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const configuration = {
  apiKey: process.env.OPENAI_API_KEY!,
};

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};
const openai = new OpenAI(configuration);

const instructionMessage = {
  role: "system",
  content: "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations."
};

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    const { messages, chatId } = await req.json();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!configuration.apiKey) {
      return new NextResponse("Miss OpenAI API Key.", { status: 500 });
    }

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const reachToLimit = await checkUserLimit();

    const isPro = await checkSubscription();
    if (!reachToLimit && !isPro) {
      return NextResponse.json({ message: "You are reach to limit. Please upgrade to higher plan.", status: 403 }, { status: 403 });
    }

    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });
    
    // Add system instruction to prompt Gemini to respond in markdown
    const enhancedMessages = [
      { role: "system", content: "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations." },
      ...messages
    ];
    
    // Convert messages to string
    const messagesString = enhancedMessages.map((message: any) => `${message.role}: ${message.content}`).join("\n");
    
    // Get response from Gemini
    const result = await chatSession.sendMessage(messagesString);
    const responseText = result.response.text();
    
    // Format the response as proper markdown code blocks
    let formattedResponse = responseText.trim();
    
    // If it starts with a language identifier but not with markdown code blocks
    if (formattedResponse.match(/^[a-z]+\n/) && !formattedResponse.startsWith("```")) {
      const parts = formattedResponse.split('\n');
      const language = parts[0];
      const content = parts.slice(1).join('\n');
      formattedResponse = `\`\`\`${language}${content}\n\`\`\``;
    } 
    // If it doesn't have code blocks at all
    else if (!formattedResponse.startsWith("```")) {
      formattedResponse = `\`\`\`\n${formattedResponse}\n\`\`\``;
    }
    
    // Save the chat history with the new assistant response
    const updatedMessages = [
      ...messages,
      {
        id: Date.now().toString(),
        role: "assistant",
        content: formattedResponse
      }
    ];

    try {
      await saveChatHistory(updatedMessages, "code");
    } catch (error) {
      console.error("Failed to save chat history:", error);
      // Continue with the response even if saving fails
    }
    
    // Track usage if not a pro user
    if (!isPro) {
      await incrementUserLimit();
    }

    return NextResponse.json(formattedResponse);
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      const { name, status, headers, message } = error;
      return NextResponse.json({ name, status, headers, message }, { status });
    } else {
      return NextResponse.json({ message: "An error occurred", error: String(error) }, { status: 500 });
    }
  }
}