import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { processDocument } from "@/lib/document-processor";
import { generateEmbeddings } from "@/lib/embeddings";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const subject = formData.get("subject") as string;
    const description = formData.get("description") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "uploads");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name}`;
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // Process document to extract text
    const content = await processDocument(filepath, file.type);

    // Create document record
    const document = await prisma.document.create({
      data: {
        title: file.name,
        filename,
        filepath,
        fileType: file.type,
        fileSize: file.size,
        subject: subject || null,
        description: description || null,
        content,
        userId: session.user.id as string,
      },
    });

    // Generate embeddings asynchronously
    generateEmbeddings(document.id, content).catch(console.error);

    return NextResponse.json({
      message: "File uploaded successfully",
      documentId: document.id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
