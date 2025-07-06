import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { db } from "@/db";
import { Documents } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }
    const { DocumentId, customMessage } = await req.json();
    if (!DocumentId) {
      return NextResponse.json({ error: "DocumentId is required." }, { status: 400 });
    }

    // Fetch the document
    const doc = await db
      .select({ id: Documents.id, slug: Documents.slug, fileName: Documents.fileName })
      .from(Documents)
      .where(eq(Documents.id, DocumentId))
      .limit(1);

    if (!doc.length) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const { slug, fileName } = doc[0];
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const shareableLink = `${baseUrl}/document/${slug}`;

    const defaultMessage = `Hi! I'd love to share my AI-powered Document with you. You can ask me any questions from the document, and I'll respond just like we're having a real conversation. Feel free to explore!`;

    return NextResponse.json({
      shareableLink,
      personalizedMessage: customMessage || defaultMessage,
      candidateName: user.displayName || user.id || "User",
      fileName,
    });
  } catch (error) {
    console.error("Share link generation error:", error);
    return NextResponse.json({ error: "Failed to generate shareable link." }, { status: 500 });
  }
} 