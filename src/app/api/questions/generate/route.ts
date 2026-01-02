import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateQuestions } from "@/lib/ai";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId, difficulty = "medium", count = 5 } = await req.json();

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

    // Generate questions
    const questions = await generateQuestions(
      document.content,
      difficulty,
      count
    );

    // Save questions to database
    for (const q of questions) {
      await prisma.question.create({
        data: {
          userId: session.user.id as string,
          question: q.question,
          options: JSON.stringify(q.options), // Store as JSON string for SQLite
          answer: q.answer,
          difficulty: q.difficulty,
          subject: document.subject,
        },
      });
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Question generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
