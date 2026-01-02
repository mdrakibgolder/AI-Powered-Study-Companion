import { GoogleGenerativeAI } from "@google/generative-ai";
import { findRelevantChunks } from "./embeddings";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use gemini-2.0-flash model
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2048,
  }
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

    // Generate answer using Gemini
    const prompt = `You are an AI study assistant. Answer the student's question based ONLY on the provided context from their study materials.

Rules:
- Use only information from the context provided
- If the context doesn't contain enough information, say so
- Be concise but thorough
- Use bullet points where appropriate
- Cite which parts of the context you used by referencing [1], [2], etc.

Context from study materials:

${context}

Question: ${question}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    if (!text || text.length === 0) {
      return "I received an empty response from the AI. Please try rephrasing your question.";
    }
    
    return text;
  } catch (error: any) {
    console.error("Error generating answer:", error);
    
    if (error.message && error.message.includes('API key')) {
      return "❌ AI service error: Invalid API key. Please check your Gemini API key in the .env file.";
    }
    
    if (error.message && error.message.includes('404')) {
      return "❌ AI model not available. The Gemini API might not be accessible with your current API key. Try getting a new key from https://makersuite.google.com/app/apikey";
    }
    
    return `❌ AI error: ${error.message}. Please check the console for details.`;
  }
}

export async function generateSummary(content: string): Promise<string> {
  try {
    const prompt = `You are an AI study assistant. Create a concise, well-structured summary of the provided study material.

Include:
- Main topics and key concepts
- Important definitions
- Key takeaways
- Use bullet points for clarity

Summarize this study material:

${content.slice(0, 8000)}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text() || "Unable to generate summary.";
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
    const prompt = `You are an AI study assistant. Generate ${count} multiple-choice questions based on the provided study material.

Difficulty: ${difficulty}
- Easy: Basic recall and understanding
- Medium: Application and analysis
- Hard: Synthesis and evaluation

Format each question as JSON:
{
  "question": "Question text?",
  "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
  "answer": "A) Correct option",
  "difficulty": "${difficulty}"
}

Return ONLY a JSON array of questions.

Generate ${count} ${difficulty} questions from:

${content.slice(0, 6000)}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const content_text = response.text() || "[]";
    
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
