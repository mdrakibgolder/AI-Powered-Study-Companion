import OpenAI from "openai";
import { findRelevantChunks } from "./embeddings";

if (!process.env.DEEPSEEK_API_KEY) {
  throw new Error("DEEPSEEK_API_KEY is not set in environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

export async function generateAnswer(
  question: string,
  documentIds: string[]
): Promise<string> {
  try {
    // Try to find relevant chunks using embeddings
    let relevantChunks = await findRelevantChunks(question, documentIds, 5);

    // Fallback: If no chunks found with embeddings, get document content directly
    if (relevantChunks.length === 0) {
      const prisma = (await import("@/lib/db")).default;
      const documents = await prisma.document.findMany({
        where: { id: { in: documentIds } },
        select: { content: true }
      });
      
      if (documents.length === 0) {
        return "I couldn't find any documents. Please make sure you have uploaded documents first.";
      }
      
      // Use first 3000 characters from each document as context
      const context = documents
        .map((doc, i) => `[${i + 1}] ${doc.content.slice(0, 3000)}`)
        .join("\n\n");
      
      relevantChunks = [{ content: context, similarity: 1.0 }];
    }

    // Build context from relevant chunks
    const context = relevantChunks
      .map((chunk, i) => `[${i + 1}] ${chunk.content}`)
      .join("\n\n");

    // Generate answer using DeepSeek
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are an AI study assistant. Answer the student's question based ONLY on the provided context from their study materials. Use only information from the context provided. If the context doesn't contain enough information, say so. Be concise but thorough. Use bullet points where appropriate. Cite which parts of the context you used by referencing [1], [2], etc."
        },
        {
          role: "user",
          content: `Context from study materials:\n\n${context}\n\nQuestion: ${question}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const text = completion.choices[0]?.message?.content;
    
    if (!text || text.length === 0) {
      return "I received an empty response from the AI. Please try rephrasing your question.";
    }
    
    return text;
  } catch (error: any) {
    console.error("Error generating answer:", error);
    
    if (error.message && error.message.includes('API key')) {
      return "❌ AI service error: Invalid API key. Please check your DeepSeek API key in the .env file.";
    }
    
    if (error.message && error.message.includes('404')) {
      return "❌ AI model not available. The DeepSeek API might not be accessible with your current API key. Try getting a new key from https://platform.deepseek.com/";
    }
    
    return `❌ AI error: ${error.message}. Please check the console for details.`;
  }
}

export async function generateSummary(content: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are an AI study assistant. Create a concise, well-structured summary of the provided study material. Include: Main topics and key concepts, Important definitions, Key takeaways. Use bullet points for clarity."
        },
        {
          role: "user",
          content: `Summarize this study material:\n\n${content.slice(0, 8000)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    return completion.choices[0]?.message?.content || "Unable to generate summary.";
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate summary");
  }
}

export async function generateQuestions(
  content: string,
  difficulty: "easy" | "medium" | "hard" = "medium",
  count: number = 5
): Promise<
  Array<{
    question: string;
    options: string[];
    answer: string;
    difficulty: string;
  }>
> {
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are an AI study assistant. Generate ${count} multiple-choice questions based on the provided study material. Difficulty: ${difficulty} (Easy: Basic recall and understanding, Medium: Application and analysis, Hard: Synthesis and evaluation). Format each question as JSON: {"question": "Question text?", "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"], "answer": "A) Correct option", "difficulty": "${difficulty}"}. Return ONLY a JSON array of questions.`
        },
        {
          role: "user",
          content: `Generate ${count} ${difficulty} questions from:\n\n${content.slice(0, 6000)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const content_text = completion.choices[0]?.message?.content || "[]";
    
    // Extract JSON from response
    const jsonMatch = content_text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return [];
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error("Failed to generate questions");
  }
}
