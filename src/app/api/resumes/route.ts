import { NextRequest, NextResponse } from "next/server";
import { verifyNeonToken } from "@/lib/neon-auth";
import { db } from "@/db";
import { resumes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  // Extract token from Authorization header
  const token = req.headers.get("authorization")?.split("Bearer ")[1];
  
  // Verify the token
  const user = await verifyNeonToken(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Now you can safely use user.id for database operations
  const { resumeText, slug } = await req.json();
  
  try {
    const newResume = await db.insert(resumes).values({
      userId: user.id,
      resumeText,
      slug,
    }).returning();
    
    return NextResponse.json({ success: true, resume: newResume[0] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create resume" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required.' }, { status: 400 });
    }
    const userResumes = await db
      .select({ id: resumes.id, slug: resumes.slug, createdAt: resumes.createdAt })
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .orderBy(desc(resumes.createdAt));
    return NextResponse.json({ resumes: userResumes });
  } catch (error) {
    console.error('List resumes error:', error);
    return NextResponse.json({ error: 'Failed to list resumes.' }, { status: 500 });
  }
} 