"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Loader2, FileText, Bot, User, Sparkles } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    setMessages([...messages, { role: "user", content: userMessage, timestamp: new Date() }]);
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
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer, timestamp: new Date() }]);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
      <div className="container mx-auto max-w-7xl p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Chat
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Ask questions about your study materials
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 lg:gap-6 lg:grid-cols-4">
          {/* Document Selection Sidebar */}
          <Card className="lg:col-span-1 h-fit max-h-[calc(100vh-12rem)] overflow-hidden flex flex-col shadow-lg border-2">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
                Study Materials
              </CardTitle>
              <CardDescription className="text-xs">
                {selectedDocs.length > 0 
                  ? `${selectedDocs.length} selected`
                  : 'No documents selected'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 overflow-y-auto flex-1">
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No documents available</p>
                  <Link href="/dashboard/upload">
                    <Button variant="link" size="sm" className="mt-2 text-purple-600">
                      Upload Documents
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <label
                      key={doc.id}
                      className={`flex items-start gap-3 rounded-lg border-2 p-3 cursor-pointer transition-all duration-200 ${
                        selectedDocs.includes(doc.id)
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
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
                        className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {doc.title}
                        </p>
                        {doc.subject && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {doc.subject}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="lg:col-span-3 flex flex-col h-[calc(100vh-12rem)] shadow-xl border-2">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950 dark:via-blue-950 dark:to-indigo-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">AI Study Assistant</CardTitle>
                    <CardDescription className="text-xs">
                      {selectedDocs.length > 0 
                        ? `Connected to ${selectedDocs.length} document${selectedDocs.length > 1 ? 's' : ''}`
                        : 'Select documents to start chatting'}
                    </CardDescription>
                  </div>
                </div>
                {messages.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setMessages([])}
                    className="text-xs"
                  >
                    Clear Chat
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 bg-white dark:bg-gray-950">
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center max-w-lg px-4">
                      <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900 shadow-xl">
                        <Bot className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Start Learning with AI
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Select your study materials and ask me anything. I'll help you understand complex topics,
                        review concepts, and prepare for exams!
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                          <p className="font-semibold text-purple-700 dark:text-purple-400">💡 Ask Questions</p>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">Get instant answers</p>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                          <p className="font-semibold text-blue-700 dark:text-blue-400">📚 Learn Concepts</p>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">Understand deeply</p>
                        </div>
                        <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                          <p className="font-semibold text-indigo-700 dark:text-indigo-400">🎯 Prepare Exams</p>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">Practice smarter</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"} message-animate`}
                      >
                        {msg.role === "assistant" && (
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-md">
                              <Bot className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        )}
                        
                        <div
                          className={`group max-w-[85%] rounded-2xl px-4 py-3 transition-all ${
                            msg.role === "user"
                              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl"
                              : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-semibold opacity-70">
                              {msg.role === "user" ? "You" : "AI Assistant"}
                            </p>
                            {msg.timestamp && (
                              <span className="text-xs opacity-50">
                                {new Date(msg.timestamp).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            )}
                          </div>
                          
                          {msg.role === "user" ? (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          ) : (
                            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({ children }) => <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{children}</p>,
                                  ul: ({ children }) => <ul className="list-disc pl-4 space-y-1">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1">{children}</ol>,
                                  li: ({ children }) => <li className="text-sm text-gray-800 dark:text-gray-200">{children}</li>,
                                  code: ({ children, className }) => {
                                    const isInline = !className;
                                    return isInline ? (
                                      <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-purple-600 dark:text-purple-400 font-mono text-xs">
                                        {children}
                                      </code>
                                    ) : (
                                      <code className={`${className} block p-2 rounded bg-gray-100 dark:bg-gray-900 text-sm overflow-x-auto`}>
                                        {children}
                                      </code>
                                    );
                                  },
                                  strong: ({ children }) => <strong className="font-bold text-gray-900 dark:text-white">{children}</strong>,
                                  a: ({ children, href }) => (
                                    <a href={href} className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                                      {children}
                                    </a>
                                  ),
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>

                        {msg.role === "user" && (
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-md">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {loading && (
                      <div className="flex gap-3 justify-start">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-md animate-pulse">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              AI is analyzing your materials...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t-2 p-4 bg-gradient-to-r from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder="Type your question here... (Press Enter to send)"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      disabled={loading || selectedDocs.length === 0}
                      className="border-2 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 dark:focus:border-purple-600 bg-white dark:bg-gray-900 shadow-sm"
                    />
                  </div>
                  <Button 
                    onClick={handleSend} 
                    disabled={loading || !input.trim() || selectedDocs.length === 0}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all px-6"
                    size="lg"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    💡 Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono">Enter</kbd> to send
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Powered by <span className="font-semibold text-purple-600 dark:text-purple-400">DeepSeek AI</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
