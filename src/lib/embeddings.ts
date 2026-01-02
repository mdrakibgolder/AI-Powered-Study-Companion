import OpenAI from "openai";
import prisma from "@/lib/db";
import { chunkText } from "./document-processor";

if (!process.env.DEEPSEEK_API_KEY) {
  throw new Error("DEEPSEEK_API_KEY is not set in environment variables");
}

// Initialize OpenAI client for embeddings (using OpenAI API)
const embeddingsClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY,
});

// Initialize DeepSeek client for chat
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

export async function generateEmbeddings(
  documentId: string,
  content: string
): Promise<void> {
  try {
    // Split content into chunks
    const chunks = chunkText(content, 1000);

    // Generate embeddings for each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      try {
        // Using OpenAI embeddings (DeepSeek embeddings endpoint not yet available)
        const result = await embeddingsClient.embeddings.create({
          model: "text-embedding-3-small",
          input: chunk,
        });
        const embedding = result.data[0].embedding;

        await prisma.embedding.create({
          data: {
            documentId,
            content: chunk,
            embedding: JSON.stringify(embedding), // Store as JSON string for SQLite
            metadata: JSON.stringify({
              chunkIndex: i,
              chunkCount: chunks.length,
            }),
          },
        });
      } catch (embError) {
        console.warn(`Failed to generate embedding for chunk ${i}:`, embError);
        // Continue with next chunk even if one fails
      }
    }

    console.log(`Generated ${chunks.length} embeddings for document ${documentId}`);
  } catch (error) {
    console.error("Error generating embeddings:", error);
    // Don't throw - embeddings are optional, chat can work without them
    console.log("Chat will work without embeddings using direct document text");
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

export async function findRelevantChunks(
  query: string,
  documentIds: string[],
  topK: number = 5
): Promise<Array<{ content: string; similarity: number }>> {
  try {
    // Generate embedding for query using OpenAI
    const result = await embeddingsClient.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });
    const queryEmbedding = result.data[0].embedding;

    // Get all embeddings for the documents
    const embeddings = await prisma.embedding.findMany({
      where: {
        documentId: {
          in: documentIds,
        },
      },
    });

    // Calculate similarities
    const similarities = embeddings.map((emb) => ({
      content: emb.content,
      similarity: cosineSimilarity(queryEmbedding, JSON.parse(emb.embedding)),
    }));

    // Sort by similarity and return top K
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  } catch (error) {
    console.error("Error finding relevant chunks:", error);
    return [];
  }
}
