import { currentUser } from "@clerk/nextjs/server";
import Replicate from 'replicate';
import { NextResponse } from "next/server";
import { checkSubscription, checkUserLimit, incrementUserLimit } from "@/lib/user-limit";

const configuration = {
  auth: process.env.REPLICATE_API_KEY!,
};

const replicate = new Replicate(configuration);

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      console.log("Unauthorized neeee");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!configuration.auth) {
      return new NextResponse("Miss Replicate API Key.", { status: 500 });
    }

    const { text, audioFile } = await req.json();

    const reachToLimit = await checkUserLimit();
    const isPro = await checkSubscription();

    if (!reachToLimit && !isPro) {
      return NextResponse.json({ message: "You are reach to limit. Please upgrade to higher plan.", status: 403 }, { status: 403 });
    }

    
    let audioUrl = "https://replicate.delivery/pbxt/KibHoI1aA7kYweYgeSV2fFOY67QwEuZNe5l1tFX7Z6FkaEoi/samples_nu-luu-loat.wav";

    if (audioFile) {
      audioUrl = audioFile;
    }   

    const input = {
      text: text,
      speaker: audioUrl
    };

    const output = await replicate.run("suminhthanh/vixtts:5222190b47dfb128cd588f07dadb78107aa489bdcd0af45814d7841d47f608c6", { input });

    if (!isPro) {
      await incrementUserLimit();
    }
    return NextResponse.json(output);
  } catch (error) {
    return new NextResponse("Something went wrong.", { status: 500 });
  }
}
