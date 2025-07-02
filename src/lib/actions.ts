'use server';

import { verifyNeonToken } from "@/lib/neon-auth";
import { getUserDetails } from "@/lib/neon-auth";
import { db } from "@/db";
import { resumes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createResume(formData: FormData, token: string) {
  // Verify the token
  const user = await verifyNeonToken(token);
  if (!user) {
    throw new Error("Unauthorized");
  }

  const resumeText = formData.get("resumeText") as string;
  const slug = formData.get("slug") as string;

  try {
    const newResume = await db.insert(resumes).values({
      userId: user.id,
      resumeText,
      slug,
    }).returning();
    
    return { success: true, resume: newResume[0] };
  } catch (error) {
    throw new Error("Failed to create resume");
  }
}

export async function getUserResumes(token: string) {
  const user = await verifyNeonToken(token);
  if (!user) {
    throw new Error("Unauthorized");
  }

  const userResumes = await db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, user.id));
    
  return userResumes;
}

export async function deleteResume(resumeId: string, token: string) {
  const user = await verifyNeonToken(token);
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Delete resume (ensuring it belongs to the user)
  const deletedResume = await db
    .delete(resumes)
    .where(eq(resumes.id, resumeId) && eq(resumes.userId, user.id))
    .returning();
    
  return deletedResume[0];
} 