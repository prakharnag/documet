'use server';

import { verifyNeonToken } from "@/lib/neon-auth";
import { getUserDetails } from "@/lib/neon-auth";
import { db } from "@/db";
import { Documents } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createDocument(formData: FormData, token: string) {
  // Verify the token
  const user = await verifyNeonToken(token);
  if (!user) {
    throw new Error("Unauthorized");
  }

  const DocumentText = formData.get("DocumentText") as string;
  const slug = formData.get("slug") as string;

  try {
    const newDocument = await db.insert(Documents).values({
      userId: user.id,
      DocumentText,
      slug,
    }).returning();
    
    return { success: true, Document: newDocument[0] };
  } catch (error) {
    throw new Error("Failed to create Document");
  }
}

export async function getUserDocuments(token: string) {
  const user = await verifyNeonToken(token);
  if (!user) {
    throw new Error("Unauthorized");
  }

  const userDocuments = await db
    .select()
    .from(Documents)
    .where(eq(Documents.userId, user.id));
    
  return userDocuments;
}

export async function deleteDocument(DocumentId: string, token: string) {
  const user = await verifyNeonToken(token);
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Delete Document (ensuring it belongs to the user)
  const deletedDocument = await db
    .delete(Documents)
    .where(eq(Documents.id, DocumentId) && eq(Documents.userId, user.id))
    .returning();
    
  return deletedDocument[0];
} 