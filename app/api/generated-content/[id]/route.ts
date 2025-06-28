import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return new NextResponse("Missing content ID", { status: 400 });
    }

    // Check if the content belongs to the user
    const existingContent = await prismadb.generatedContent.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingContent) {
      return new NextResponse("Content not found", { status: 404 });
    }

    // Delete the content
    await prismadb.generatedContent.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting generated content:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 