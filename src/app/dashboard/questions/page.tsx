"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

type Question = {
  question: string;
  options: string[];
  answer: string;
  difficulty: string;
};

export default function QuestionsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string>("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [count, setCount] = useState<number>(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
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

  const handleGenerate = async () => {
    if (!selectedDoc) {
      toast({
        title: "Error",
        description: "Please select a document",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setQuestions([]);
    setShowAnswers(false);

    try {
      const response = await fetch("/api/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: selectedDoc,
          difficulty,
          count,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate questions");

      const data = await response.json();
      setQuestions(data.questions);
      toast({
        title: "Success",
        description: `Generated ${data.questions.length} questions`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-4xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Practice Questions</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Generate exam-style questions from your materials
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back</Button>
          </Link>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Question Settings</CardTitle>
              <CardDescription>Customize your practice questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Document</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={selectedDoc}
                  onChange={(e) => setSelectedDoc(e.target.value)}
                >
                  <option value="">Select a document...</option>
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Number of Questions</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                  >
                    <option value="3">3</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!selectedDoc || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Generate Questions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {questions.length > 0 && (
            <>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowAnswers(!showAnswers)}
                >
                  {showAnswers ? "Hide Answers" : "Show Answers"}
                </Button>
              </div>

              <div className="space-y-4">
                {questions.map((q, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Question {index + 1}
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          ({q.difficulty})
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="font-medium">{q.question}</p>
                      <div className="space-y-2">
                        {q.options.map((option, i) => (
                          <div
                            key={i}
                            className={`rounded-md border p-3 ${
                              showAnswers && option === q.answer
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                : ""
                            }`}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                      {showAnswers && (
                        <div className="mt-4 rounded-md bg-green-50 dark:bg-green-900/20 p-3">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            Correct Answer: {q.answer}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
