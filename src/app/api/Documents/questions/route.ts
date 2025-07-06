import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { Documents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ChatOpenAI } from '@langchain/openai';
import { stackServerApp } from '@/stack';

export async function POST(req: NextRequest) {
  try {
    const { DocumentId } = await req.json();
    
    if (!DocumentId) {
      return NextResponse.json({ error: 'DocumentId is required.' }, { status: 400 });
    }

    // Try to get authenticated user (optional for public access)
    const user = await stackServerApp.getUser();
    let isAuthenticated = !!user;

    // Fetch the document content and check access
    const doc = await db
      .select({ 
        DocumentText: Documents.DocumentText, 
        fileName: Documents.fileName,
        userId: Documents.userId 
      })
      .from(Documents)
      .where(eq(Documents.id, DocumentId))
      .limit(1);

    if (!doc.length) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }

    const { DocumentText, fileName, userId } = doc[0];

    // Check if user has access to this document
    // Allow access if: user is authenticated and owns the document, OR document is shared (public)
    if (isAuthenticated && user && user.id !== userId) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    // Generate questions using OpenAI
    const chatModel = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
      maxTokens: 500,
    });

    const prompt = `Based on the following document content, generate 8-10 intelligent, relevant questions that someone might ask about this document. 

Document: ${fileName}
Content: ${DocumentText.substring(0, 3000)}...

Generate questions that are:
1. Specific to the content and context of this document
2. Relevant to what someone would actually want to know
3. Varied in nature (technical, experience, background, etc.)
4. Natural and conversational in tone
5. Appropriate for the document type

Return only the questions as a JSON array of strings, no additional text.`;

    const response = await chatModel.invoke([
      {
        role: "system",
        content: "You are an expert at generating relevant questions based on document content. Return only a JSON array of question strings."
      },
      {
        role: "user",
        content: prompt
      }
    ]);

    let questions: string[] = [];
    try {
      const content = response.content?.toString().trim();
      if (content) {
        // Try to parse JSON response
        questions = JSON.parse(content);
      }
    } catch (parseError) {
      // Fallback: extract questions from text response
      const content = response.content?.toString() || '';
      questions = content
        .split('\n')
        .filter(line => line.trim().length > 0 && line.includes('?'))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 10);
    }

    // Fallback to default questions if AI generation fails
    if (!questions || questions.length === 0) {
      questions = [
        "What are the key points in this document?",
        "What is the main purpose of this document?",
        "What are the important details mentioned?",
        "What should I know about this document?",
        "What are the highlights of this document?",
        "What information is most relevant here?",
        "What are the key takeaways?",
        "What would you like me to know about this?"
      ];
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Question generation error:', error);
    return NextResponse.json({ error: 'Failed to generate questions.' }, { status: 500 });
  }
} 