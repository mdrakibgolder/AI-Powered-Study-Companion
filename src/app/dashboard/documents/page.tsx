import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { FileText, Calendar, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DocumentsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const documents = await prisma.document.findMany({
    where: {
      userId: session.user.id as string,
    },
    orderBy: {
      uploadedAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Documents</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your study materials
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button variant="outline">Back</Button>
            </Link>
            <Link href="/dashboard/upload">
              <Button>Upload New</Button>
            </Link>
          </div>
        </div>

        {documents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold">No documents yet</h3>
              <p className="mb-4 text-sm text-gray-500">
                Upload your first study material to get started
              </p>
              <Link href="/dashboard/upload">
                <Button>Upload Document</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="mt-2 line-clamp-1">{doc.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {doc.description || doc.subject || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/chat?doc=${doc.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        Ask Questions
                      </Button>
                    </Link>
                    <Link href={`/dashboard/summarize?doc=${doc.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        Summarize
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
