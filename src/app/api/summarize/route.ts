import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateSummary } from "@/lib/ai";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID required" },
        { status: 400 }
      );
    }

    // Get document and verify ownership
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId: session.user.id as string,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Check if summary already exists
    if (document.summary) {
      return NextResponse.json({ summary: document.summary });
    }

    // Generate summary
    const summary = await generateSummary(document.content);

    // Save summary to document
    await prisma.document.update({
      where: { id: documentId },
      data: { summary },
    });

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
