import { currentUser } from "@clerk/nextjs/server";
import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { NextResponse } from "next/server";
import { checkSubscription, checkUserLimit, incrementUserLimit } from "@/lib/user-limit";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

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

export async function POST(req: Request) {

  try {
    const user = await currentUser();
    const { messages } = await req.json();

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
      return  NextResponse.json({ message: "You are reach to limit. Please upgrade to higher plan.", status: 403 }, { status: 403 });
    }

    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });
  
    // convert messages to string
    const messagesString = messages.map((message: any) => `${message.role}: ${message.content}`).join("\n");
    const result = await chatSession.sendMessage(messagesString);
    // const response = await openai.chat.completions.create({
    //   model: 'gpt-4o',
    //   store: true,
    //   messages,
    // });

    return NextResponse.json(result.response.text());
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      const { name, status, headers, message } = error;
      return NextResponse.json({ name, status, headers, message }, { status });
    } else {
      throw error;
    }
  }
}
