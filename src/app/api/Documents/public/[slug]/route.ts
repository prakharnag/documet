import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { Documents } from '@/db/schema';
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

    // Get Document information
    const DocumentInfo = await db
      .select({
        id: Documents.id,
        slug: Documents.slug,
        DocumentText: Documents.DocumentText,
        createdAt: Documents.createdAt,
        fileName: Documents.fileName,
      })
      .from(Documents)
      .where(eq(Documents.slug, slug))
      .limit(1);

    if (DocumentInfo.length === 0) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }

    const { id, slug: DocumentSlug, DocumentText, createdAt, fileName } = DocumentInfo[0];

    return NextResponse.json({
      id,
      slug: DocumentSlug,
      DocumentText,
      fileName,
      createdAt,
    });
  } catch (error) {
    console.error('Public Document fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch Document.' }, { status: 500 });
  }
} 