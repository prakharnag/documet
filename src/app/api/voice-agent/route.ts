import { NextRequest, NextResponse } from 'next/server';
import { EmbeddingService } from '@/lib/embeddings';

export async function POST(req: NextRequest) {
  const { query, documentId, userId } = await req.json();
  
  try {
    if (!query || !documentId || !userId) {
      return NextResponse.json({ error: 'Query, documentId, and userId are required' }, { status: 400 });
    }

    // Search for relevant content in Pinecone
    const namespace = `user_${userId}`;
    const searchResult = await EmbeddingService.searchSimilarDocuments(
      query,
      3, // Get top 3 most relevant chunks
      namespace
    );
    
    if (!searchResult.success || !searchResult.results) {
      return NextResponse.json({ 
        response: "I couldn't find relevant information in your document for that question.",
        context: ''
      });
    }

    // Filter to only include chunks from this specific document
    const relevantChunks = searchResult.results.filter(
      (result: any) => result.metadata.document_id === documentId
    );
    
    if (relevantChunks.length === 0) {
      return NextResponse.json({ 
        response: "I couldn't find specific information about that in this document.",
        context: ''
      });
    }

    // Combine relevant chunks as context
    const context = relevantChunks
      .map((chunk: any) => chunk.metadata.text)
      .join('\n\n');

    return NextResponse.json({ 
      response: "Here's the relevant information from your document:",
      context: context.substring(0, 2000), // Limit context size for Vapi
      chunks: relevantChunks.length
    });

  } catch (error) {
    console.error('Voice agent API error:', error);
    return NextResponse.json({ 
      response: 'I encountered an issue accessing your document. Please try again.',
      context: '',
      error: true 
    }, { status: 500 });
  }
}