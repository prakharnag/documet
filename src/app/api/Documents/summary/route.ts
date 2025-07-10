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

    // Generate summary and questions using GPT-4 for better accuracy
    const chatModel = new ChatOpenAI({
      modelName: "gpt-3.5-turbo", // Use gpt-3.5-turbo for cost efficiency
      temperature: 0.3,
      maxTokens: 800,
    });

    const prompt = `Analyze this document and generate:

1. A concise, informative summary (2-3 sentences)
2. 3 highly relevant, specific questions that users would naturally ask about this content

Document: "${fileName}"
Content: ${DocumentText.substring(0, 5000)}${DocumentText.length > 5000 ? '...' : ''}

Requirements for questions:
- Must be directly answerable from the document content
- Should cover different aspects (main topic, details, implications)
- Use natural, conversational language
- Be specific to this document, not generic

Format exactly as:
Summary: [summary]
Questions:
1. [question 1]
2. [question 2]
3. [question 3]`;

    const response = await chatModel.invoke([
      {
        role: "system",
        content: "You are an expert document analyst. Your task is to create accurate summaries and generate highly relevant, specific questions that users would naturally ask about the document content. Focus on the document's actual content, key information, and practical details that readers would want to know."
      },
      {
        role: "user",
        content: prompt
      }
    ]);

    const content = response.content?.toString() || '';
    
    // Extract summary and questions
    const summaryMatch = content.match(/Summary:\s*([\s\S]*?)(?=Questions:|$)/);
    const questionsMatch = content.match(/Questions:\s*((?:1\.|2\.|3\.)[\s\S]*)/);
    
    let summary = '';
    let questions: string[] = [];
    
    if (summaryMatch) {
      summary = summaryMatch[1].trim();
    }
    
    if (questionsMatch) {
      const questionsText = questionsMatch[1];
      questions = questionsText
        .split(/\d+\.\s*/)
        .filter((q: string) => q.trim().length > 0)
        .map((q: string) => q.trim())
        .slice(0, 3);
    }

    // Fallback if parsing fails
    if (!summary) {
      summary = "This document contains important information that can be explored through questions.";
    }
    
    if (questions.length === 0) {
      questions = [
        "What are the key points in this document?",
        "What is the main purpose of this document?",
        "What important details should I know about?"
      ];
    }

    return NextResponse.json({ 
      summary, 
      questions 
    });
  } catch (error) {
    console.error('Summary generation error:', error);
    return NextResponse.json({ error: 'Failed to generate summary.' }, { status: 500 });
  }
} 