import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { resumeSections, resumeSubsections, resumes, users } from '@/db/schema';
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
    const { resumeId, question } = await req.json();
    if (!resumeId || !question) {
      return NextResponse.json({ error: 'Missing resumeId or question.' }, { status: 400 });
    }

    // Get resume and user information for personalization
    const resumeInfo = await db
      .select({
        resumeText: resumes.resumeText,
        userName: users.name,
        userEmail: users.email,
      })
      .from(resumes)
      .innerJoin(users, eq(resumes.userId, users.id))
      .where(eq(resumes.id, resumeId))
      .limit(1);

    if (resumeInfo.length === 0) {
      return NextResponse.json({ error: 'Resume not found.' }, { status: 404 });
    }

    const { resumeText, userName, userEmail } = resumeInfo[0];

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

    // If the question is about current role, always include the most recent job entry
    const isCurrentRoleQuestion = /current role|present role|current position|present position|current job|present job|current responsibilities|present responsibilities/i.test(question);

    let topSubsections = scored.slice(0, 3);

    if (isCurrentRoleQuestion) {
      // Find the most recent job entry in Work Experience/Professional Experience
      const workSections = ["Experience", "Work Experience", "Professional Experience"];
      // Find the scored version (with score property)
      const mostRecentJob = scored.find(sub => workSections.includes(sub.sectionName));
      if (mostRecentJob) {
        // If not already in topSubsections, add it at the top
        if (!topSubsections.some(s => s.title === mostRecentJob.title && s.content === mostRecentJob.content)) {
          topSubsections = [mostRecentJob, ...topSubsections.slice(0, 2)];
        } else {
          // Move it to the top if present
          topSubsections = [mostRecentJob, ...topSubsections.filter(s => s !== mostRecentJob).slice(0, 2)];
        }
      }
    }

    // Generate conversational AI response
    const chatModel = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.7, // Higher temperature for more conversational responses
      maxTokens: 200,
    });

    const relevantContent = topSubsections
      .map(sub => `${sub.sectionName}: ${sub.content}`)
      .join('\n\n');

    const prompt = `You are ${userName}, a professional candidate having a conversation with a recruiter. The recruiter just asked: "${question}"

Based on your resume information below, provide a natural, conversational response as if you're speaking directly to them. Be confident, enthusiastic, and authentic. Use "I" statements and speak in first person.

Your resume information:
${relevantContent}

Respond naturally as ${userName} would in a real conversation. Keep it concise (2-3 sentences) but make it feel personal and engaging.`;

    const response = await chatModel.invoke([
      {
        role: "system",
        content: `You are ${userName}, a professional candidate. Respond naturally and conversationally as if you're speaking directly to a recruiter. Be confident, authentic, and use first-person perspective. Make your responses feel personal and engaging, not robotic.`
      },
      {
        role: "user",
        content: prompt
      }
    ]);

    const summary = response.content?.toString().trim() || 'I appreciate your question, but I need to review my information to give you a proper answer.';

    return NextResponse.json({
      summary,
      question,
      relevantSections: topSubsections.map(s => s.sectionName),
      candidateName: userName,
    });
  } catch (error) {
    console.error('Q&A error:', error);
    return NextResponse.json({ error: 'Failed to answer question.' }, { status: 500 });
  }
} 