"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Loader2, FileText } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const searchParams = useSearchParams();
  const docId = searchParams.get("doc");
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>(docId ? [docId] : []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || selectedDocs.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one document and enter a message",
        variant: "destructive",
      });
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setMessages([...messages, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
          documentIds: selectedDocs,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      setConversationId(data.conversationId);
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Chat</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Ask questions about your study materials
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back</Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Document Selection */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Select Documents</CardTitle>
              <CardDescription>Choose materials to query</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {documents.length === 0 ? (
                <p className="text-sm text-gray-500">No documents available</p>
              ) : (
                documents.map((doc) => (
                  <label
                    key={doc.id}
                    className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDocs([...selectedDocs, doc.id]);
                        } else {
                          setSelectedDocs(selectedDocs.filter((id) => id !== doc.id));
                        }
                      }}
                      className="rounded"
                    />
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm flex-1 truncate">{doc.title}</span>
                  </label>
                ))
              )}
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Messages */}
              <div className="mb-4 h-96 space-y-4 overflow-y-auto rounded-lg border p-4">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="mx-auto mb-2 h-8 w-8" />
                      <p>No messages yet. Start asking questions!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`rounded-lg p-3 ${
                        msg.role === "user"
                          ? "bg-blue-100 dark:bg-blue-900 ml-8"
                          : "bg-gray-100 dark:bg-gray-800 mr-8"
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">
                        {msg.role === "user" ? "You" : "AI Assistant"}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ask a question about your materials..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  disabled={loading || selectedDocs.length === 0}
                />
                <Button onClick={handleSend} disabled={loading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
