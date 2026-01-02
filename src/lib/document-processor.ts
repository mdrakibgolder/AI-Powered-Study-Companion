import { readFile } from "fs/promises";
import pdf from "pdf-parse";
import mammoth from "mammoth";

export async function processDocument(
  filepath: string,
  mimeType: string
): Promise<string> {
  const buffer = await readFile(filepath);

  try {
    switch (mimeType) {
      case "application/pdf":
        const pdfData = await pdf(buffer);
        return pdfData.text;

      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        const docxResult = await mammoth.extractRawText({ buffer });
        return docxResult.value;

      case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        // For PPTX, we'll need a different library or service
        // For now, return a placeholder
        return "PPTX processing not yet implemented. Please use PDF format.";

      case "text/plain":
        return buffer.toString("utf-8");

      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error("Document processing error:", error);
    throw new Error("Failed to process document");
  }
}

export function chunkText(text: string, chunkSize: number = 1000): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/);
  let currentChunk = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if ((currentChunk + trimmed).length > chunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = trimmed;
    } else {
      currentChunk += (currentChunk ? ". " : "") + trimmed;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
