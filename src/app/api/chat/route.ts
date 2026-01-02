import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateAnswer } from "@/lib/ai";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, conversationId, documentIds } = await req.json();

    if (!message || !documentIds || documentIds.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user owns the documents
    const documents = await prisma.document.findMany({
      where: {
        id: { in: documentIds },
        userId: session.user.id as string,
      },
    });

    if (documents.length !== documentIds.length) {
      return NextResponse.json(
        { error: "Invalid document access" },
        { status: 403 }
      );
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: session.user.id as string,
        },
      });
    } else {
      conversation = await prisma.conversation.create({
        data: {
          userId: session.user.id as string,
          title: message.slice(0, 50),
        },
      });
    }

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    });

    // Generate AI response
    const answer = await generateAnswer(message, documentIds);

    // Save AI message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: answer,
      },
    });

    return NextResponse.json({
      conversationId: conversation.id,
      answer,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
