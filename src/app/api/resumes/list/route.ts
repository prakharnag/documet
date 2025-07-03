import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { resumes, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required.' }, { status: 400 });
    }

    // Fetch resumes with user information
    const userResumes = await db
      .select({
        id: resumes.id,
        slug: resumes.slug,
        createdAt: resumes.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(resumes)
      .innerJoin(users, eq(resumes.userId, users.id))
      .where(eq(resumes.userId, userId));

    return NextResponse.json({ resumes: userResumes });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json({ error: 'Failed to fetch resumes.' }, { status: 500 });
  }
} 