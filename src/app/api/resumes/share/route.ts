import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { resumes, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { resumeId, customMessage } = await req.json();
    
    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required.' }, { status: 400 });
    }

    // Get resume and user information
    const resumeInfo = await db
      .select({
        id: resumes.id,
        slug: resumes.slug,
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

    const { id, slug, userName, userEmail } = resumeInfo[0];

    // Generate shareable link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shareableLink = `${baseUrl}/resume/${slug}`;

    // Create personalized message
    const defaultMessage = `Hi! I'm ${userName} and I'd love to share my AI-powered resume with you. You can ask me any questions about my experience, skills, or background, and I'll respond just like we're having a real conversation. Feel free to explore!`;
    
    const personalizedMessage = customMessage || defaultMessage;

    return NextResponse.json({
      shareableLink,
      personalizedMessage,
      candidateName: userName,
      candidateEmail: userEmail,
      resumeId: id,
      slug: slug,
    });
  } catch (error) {
    console.error('Share link generation error:', error);
    return NextResponse.json({ error: 'Failed to generate shareable link.' }, { status: 500 });
  }
} 