import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { Documents, DocumentSections, DocumentSubsections } from '@/db/schema';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { eq } from 'drizzle-orm';

function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}

export async function POST(req: NextRequest) {
  try {
    const { DocumentId, question } = await req.json();
    if (!DocumentId || !question) {
      return NextResponse.json({ error: 'Missing DocumentId or question.' }, { status: 400 });
    }

    // Get document info
    const documentInfo = await db
      .select({
        DocumentText: Documents.DocumentText,
        fileName: Documents.fileName,
      })
      .from(Documents)
      .where(eq(Documents.id, DocumentId))
      .limit(1);

    if (documentInfo.length === 0) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }

    const { DocumentText, fileName } = documentInfo[0];

    // Embed the question
    const embeddings = new OpenAIEmbeddings({});
    const [questionEmbedding] = await embeddings.embedDocuments([question]);

    // Fetch all subsections for this document
    const subsections = await db
      .select({
        sectionName: DocumentSections.sectionName,
        title: DocumentSubsections.title,
        content: DocumentSubsections.content,
        embedding: DocumentSubsections.embedding,
      })
      .from(DocumentSubsections)
      .innerJoin(DocumentSections, eq(DocumentSubsections.sectionId, DocumentSections.id))
      .where(eq(DocumentSections.DocumentId, DocumentId));

    // Compute similarity for each subsection
    const scored = subsections.map(sub => {
      let embedding: number[];
      if (Array.isArray(sub.embedding)) {
        embedding = sub.embedding as number[];
      } else if (typeof sub.embedding === 'object' && sub.embedding !== null) {
        embedding = Object.values(sub.embedding).map(Number);
      } else {
        embedding = [];
      }
      const score = cosineSimilarity(questionEmbedding, embedding);
      return { ...sub, score };
    });

    // Sort by similarity and get top 3 most relevant sections
    scored.sort((a, b) => b.score - a.score);
    const topSubsections = scored.slice(0, 3);

    // Generate AI response using GPT-4 with better reasoning
    const chatModel = new ChatOpenAI({
      modelName: "gpt-4",
      temperature: 0.7,
      maxTokens: 250,
    });

    const relevantContent = topSubsections
      .map(sub => `Section: ${sub.sectionName}\nContent: ${sub.content}`)
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
      relevantSections: topSubsections.map(s => s.sectionName),
      documentName: fileName,
      confidence: topSubsections[0]?.score || 0,
    });
  } catch (error) {
    console.error('Q&A error:', error);
    return NextResponse.json({ error: 'Failed to answer question.' }, { status: 500 });
  }
}