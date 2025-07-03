import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { resumes, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required.' }, { status: 400 });
    }

    // Get resume and user information
    const resumeInfo = await db
      .select({
        id: resumes.id,
        slug: resumes.slug,
        resumeText: resumes.resumeText,
        createdAt: resumes.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(resumes)
      .innerJoin(users, eq(resumes.userId, users.id))
      .where(eq(resumes.slug, slug))
      .limit(1);

    if (resumeInfo.length === 0) {
      return NextResponse.json({ error: 'Resume not found.' }, { status: 404 });
    }

    const { id, slug: resumeSlug, resumeText, userName, userEmail, createdAt } = resumeInfo[0];

    return NextResponse.json({
      id,
      slug: resumeSlug,
      resumeText,
      candidateName: userName,
      candidateEmail: userEmail,
      createdAt,
    });
  } catch (error) {
    console.error('Public resume fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch resume.' }, { status: 500 });
  }
} 