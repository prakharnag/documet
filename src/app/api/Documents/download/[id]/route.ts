import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { Documents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { stackServerApp } from '@/stack';
import { getSignedDownloadUrl } from '@/lib/s3';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Document ID is required.' }, { status: 400 });
    }

    // Try to get authenticated user (optional for public access)
    const user = await stackServerApp.getUser();
    let isAuthenticated = !!user;

    // Fetch the document and check access
    const doc = await db
      .select({
        id: Documents.id,
        s3Url: Documents.s3Url,
        fileName: Documents.fileName,
        userId: Documents.userId,
      })
      .from(Documents)
      .where(eq(Documents.id, id))
      .limit(1);

    if (!doc.length) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }

    const { s3Url, fileName, userId } = doc[0];

    // Check if user has access to this document
    // Allow access if: user is authenticated and owns the document, OR document is shared (public)
    if (isAuthenticated && user && user.id !== userId) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    if (!s3Url) {
      return NextResponse.json({ error: 'Document file not found.' }, { status: 404 });
    }

    try {
      // Extract S3 key from URL
      const s3Key = s3Url.split('.amazonaws.com/')[1];
      
      // Generate a signed URL for the S3 object
      const downloadUrl = await getSignedDownloadUrl(s3Key);
      
      return NextResponse.json({
        downloadUrl,
        fileName: fileName || 'document'
      });
    } catch (s3Error) {
      console.error('S3 signed URL generation error:', s3Error);
      return NextResponse.json({ error: 'Failed to generate download link.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Failed to process download request.' }, { status: 500 });
  }
} 