import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { resumeSections, resumeSubsections } from '@/db/schema';
import { OpenAIEmbeddings } from '@langchain/openai';
import { eq } from 'drizzle-orm';

function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}

export async function POST(req: NextRequest) {
  try {
    const { resumeId, question } = await req.json();
    if (!resumeId || !question) {
      return NextResponse.json({ error: 'Missing resumeId or question.' }, { status: 400 });
    }

    // Embed the question
    const embeddings = new OpenAIEmbeddings({});
    const [questionEmbedding] = await embeddings.embedDocuments([question]);

    // Fetch all subsections for this resume (join to get section name)
    const subsections = await db
      .select({
        sectionName: resumeSections.sectionName,
        title: resumeSubsections.title,
        content: resumeSubsections.content,
        embedding: resumeSubsections.embedding,
      })
      .from(resumeSubsections)
      .innerJoin(resumeSections, eq(resumeSubsections.sectionId, resumeSections.id))
      .where(eq(resumeSections.resumeId, resumeId));

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

    // Sort by similarity, descending
    scored.sort((a, b) => b.score - a.score);
    const topSubsections = scored.slice(0, 3);

    return NextResponse.json({
      topSubsections: topSubsections.map(s => ({ section: s.sectionName, title: s.title, content: s.content, score: s.score })),
    });
  } catch (error) {
    console.error('Q&A error:', error);
    return NextResponse.json({ error: 'Failed to answer question.' }, { status: 500 });
  }
} 