import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { Documents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSignedDownloadUrl, extractS3Key } from '@/lib/s3';

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
        s3Url: Documents.s3Url,
      })
      .from(Documents)
      .where(eq(Documents.slug, slug))
      .limit(1);

    if (DocumentInfo.length === 0) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }

    const { id, slug: DocumentSlug, DocumentText, createdAt, fileName, s3Url } = DocumentInfo[0];

    // Generate signed URL if s3Url exists
    let signedUrl = s3Url;
    if (s3Url) {
      try {
        const s3Key = extractS3Key(s3Url);
        if (s3Key && s3Key.trim()) {
          signedUrl = await getSignedDownloadUrl(s3Key);
        }
      } catch (error) {
        console.error('Failed to generate signed URL:', error);
      }
    }

    return NextResponse.json({
      id,
      slug: DocumentSlug,
      DocumentText,
      fileName,
      createdAt,
      s3Url: signedUrl,
    });
  } catch (error) {
    console.error('Public Document fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch Document.' }, { status: 500 });
  }
} 