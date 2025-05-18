import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { checkSubscription, checkUserLimit, incrementUserLimit } from "@/lib/user-limit";

export async function POST(req: Request) {
  try {
    // const user = await currentUser();
    // console.log("user", user);
    // if (!user) {
    //   console.log("Unauthorized neeee");
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    const { text, audioFile } = await req.json();

    // const reachToLimit = await checkUserLimit();
    // const isPro = await checkSubscription();

    // if (!reachToLimit && !isPro) {
    //   return NextResponse.json({ message: "You are reach to limit. Please upgrade to higher plan.", status: 403 }, { status: 403 });
    // }

    let audioUrl = "https://replicate.delivery/pbxt/KibHoI1aA7kYweYgeSV2fFOY67QwEuZNe5l1tFX7Z6FkaEoi/samples_nu-luu-loat.wav";

    if (audioFile != null) {
      console.log("audioFile", audioFile);
      audioUrl = audioFile;
    }   

    const input = {
      text: text,
      voice: audioUrl
    };

    const result = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/generate-audio`, {
      method: "POST",
      body: JSON.stringify(input),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const output = await result.json();
    // if (!isPro) {
    //   await incrementUserLimit();
    // }
    return NextResponse.json(output);
  } catch (error) {
    return new NextResponse("Something went wrong.", { status: 500 });
  }
}