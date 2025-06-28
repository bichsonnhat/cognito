import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { contentType, contentUrl, title, prompt, metadata } = await req.json();

    if (!contentType || !contentUrl) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate contentType
    if (!["audio", "photo", "video"].includes(contentType)) {
      return new NextResponse("Invalid content type", { status: 400 });
    }

    const generatedContent = await prismadb.generatedContent.create({
      data: {
        userId: user.id,
        contentType,
        contentUrl,
        title,
        prompt,
        metadata,
      },
    });

    return NextResponse.json(generatedContent);
  } catch (error) {
    console.error("Error saving generated content:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const contentType = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const whereClause: any = {
      userId: user.id,
    };

    if (contentType && ["audio", "photo", "video"].includes(contentType)) {
      whereClause.contentType = contentType;
    }

    const generatedContent = await prismadb.generatedContent.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    const total = await prismadb.generatedContent.count({
      where: whereClause,
    });

    return NextResponse.json({
      data: generatedContent,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Error fetching generated content:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 