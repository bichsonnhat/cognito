import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const predictionId = searchParams.get("id");
    
    if (!predictionId) {
      return NextResponse.json({ error: "Missing prediction ID" }, { status: 400 });
    }

    const result = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/prediction-status?id=${predictionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    const output = await result.json();
    return NextResponse.json(output);
  } catch (error) {
    console.error("Error checking prediction status:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
} 