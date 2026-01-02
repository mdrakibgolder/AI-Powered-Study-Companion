import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documents = await prisma.document.findMany({
      where: {
        userId: session.user.id as string,
      },
      orderBy: {
        uploadedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        subject: true,
        description: true,
        fileType: true,
        uploadedAt: true,
      },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
