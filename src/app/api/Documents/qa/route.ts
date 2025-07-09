import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { Documents } from '@/db/schema';
import { ChatOpenAI } from '@langchain/openai';
import { eq } from 'drizzle-orm';
import { EmbeddingService } from '@/lib/embeddings';
import { stackServerApp } from '@/stack';

export async function POST(req: NextRequest) {
  try {
    const { DocumentId, question } = await req.json();
    if (!DocumentId || !question) {
      return NextResponse.json({ error: 'Missing DocumentId or question.' }, { status: 400 });
    }

    // Get authenticated user
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    // Get document info
    const documentInfo = await db
      .select({
        DocumentText: Documents.DocumentText,
        fileName: Documents.fileName,
        userId: Documents.userId,
      })
      .from(Documents)
      .where(eq(Documents.id, DocumentId))
      .limit(1);

    if (documentInfo.length === 0) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }

    const { DocumentText, fileName, userId } = documentInfo[0];

    // Check if user has access to this document
    if (user.id !== userId) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    // Search for relevant chunks using Pinecone
    const namespace = `user_${userId}`;
    const searchResult = await EmbeddingService.searchSimilarDocuments(
      question,
      5, // topK
      namespace
    );

    if (!searchResult.success) {
      return NextResponse.json({ error: 'Failed to search document.' }, { status: 500 });
    }

    // Filter results to only include chunks from this specific document
    const relevantChunks = searchResult.results?.filter(
      (result: any) => result.metadata.document_id === DocumentId
    ) || [];

    if (relevantChunks.length === 0) {
      return NextResponse.json({
        summary: "I couldn't find specific information about that in this document. Could you try rephrasing your question or ask about something else?",
        question,
        relevantSections: [],
        documentName: fileName,
        confidence: 0,
      });
    }

    // Generate AI response using GPT-4
    const chatModel = new ChatOpenAI({
      modelName: "gpt-4",
      temperature: 0.7,
      maxTokens: 250,
    });

    const relevantContent = relevantChunks
      .map((chunk: any) => chunk.metadata.text)
      .join('\n\n');

    const systemPrompt = `You are a helpful document assistant. Answer questions directly and naturally based on the document content.

Guidelines:
1. Give direct, useful answers from the document
2. Be conversational and helpful
3. If information isn't available, suggest what IS available instead
4. Focus on being helpful rather than defensive
5. Don't start responses with disclaimers about what the document lacks

Document: ${fileName || 'Document'}`;

    const userPrompt = `Question: ${question}

Relevant document sections:
${relevantContent}

Answer the question directly using the information above. Be helpful and conversational. If the exact information isn't available, mention what related information IS available in the document.`;

    const response = await chatModel.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);

    const summary = response.content?.toString().trim() || 'I need more specific information to answer your question accurately.';

    return NextResponse.json({
      summary,
      question,
      relevantSections: relevantChunks.map((chunk: any) => `Chunk ${chunk.metadata.chunk_index + 1}`),
      documentName: fileName,
      confidence: relevantChunks[0]?.score || 0,
      chunksFound: relevantChunks.length,
    });
  } catch (error) {
    console.error('Q&A error:', error);
    return NextResponse.json({ error: 'Failed to answer question.' }, { status: 500 });
  }
}