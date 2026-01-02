import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Brain, FileText, MessageSquare, GraduationCap, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userId = session.user.id as string;

  // Fetch user statistics
  const [documentCount, conversationCount] = await Promise.all([
    prisma.document.count({ where: { userId } }),
    prisma.conversation.count({ where: { userId } }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">AI Study Companion</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {session.user.name}
            </span>
            <form action={async () => {
              "use server";
              const { signOut } = await import("@/lib/auth");
              await signOut();
            }}>
              <Button variant="ghost" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {session.user.name?.split(" ")[0]}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Ready to continue your learning journey?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documentCount}</div>
              <p className="text-xs text-gray-500">Uploaded materials</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversationCount}</div>
              <p className="text-xs text-gray-500">AI chat sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Study Score</CardTitle>
              <GraduationCap className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-gray-500">Keep it up!</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/upload">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Upload Materials</CardTitle>
                <CardDescription>
                  Add PDFs, slides, or notes to your library
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/documents">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                  <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>My Documents</CardTitle>
                <CardDescription>
                  Browse and manage your study materials
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/chat">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>AI Chat</CardTitle>
                <CardDescription>
                  Ask questions about your materials
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/summarize">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                  <Brain className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle>Summarize</CardTitle>
                <CardDescription>
                  Generate quick summaries of your content
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/questions">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                  <GraduationCap className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle>Practice Questions</CardTitle>
                <CardDescription>
                  Generate exam-style practice questions
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
