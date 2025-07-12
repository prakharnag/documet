import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { Documents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSignedDownloadUrl } from '@/lib/s3';

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
        pdfS3Url: Documents.pdfS3Url,
      })
      .from(Documents)
      .where(eq(Documents.slug, slug))
      .limit(1);

    if (DocumentInfo.length === 0) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }

    const { id, slug: DocumentSlug, DocumentText, createdAt, fileName, s3Url, pdfS3Url } = DocumentInfo[0];

    // Use PDF S3 URL for preview if available
    let previewUrl = pdfS3Url || s3Url;
    let signedUrl = previewUrl;
    if (previewUrl && previewUrl.trim()) {
      try {
        // Handle both full URLs and S3 keys
        let s3Key = previewUrl;
        if (previewUrl.includes('.amazonaws.com/')) {
          s3Key = previewUrl.split('.amazonaws.com/')[1];
        }
        if (s3Key && s3Key.trim()) {
          // Use preview URL for public preview
          const { getSignedPreviewUrl } = await import('@/lib/s3');
          signedUrl = await getSignedPreviewUrl(s3Key.trim());
        }
      } catch (error) {
        console.error('Failed to generate signed URL:', error);
        // Keep original previewUrl if signed URL generation fails
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