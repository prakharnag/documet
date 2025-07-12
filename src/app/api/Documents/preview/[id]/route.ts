import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { Documents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { stackServerApp } from '@/stack';
import { getSignedPreviewUrl } from '@/lib/s3';
import mime from 'mime-types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required.' }, 
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: 'Document not found.' }, 
        { status: 404 }
      );
    }

    const { s3Url, fileName, userId } = doc[0];

    // Check if user has access to this document
    if (isAuthenticated && user && user.id !== userId) {
      return NextResponse.json(
        { error: 'Access denied.' }, 
        { status: 403 }
      );
    }

    if (!s3Url || !s3Url.trim()) {
      return NextResponse.json(
        { error: 'Document file not found.' }, 
        { status: 404 }
      );
    }

    // Infer content type from fileName
    let contentType: string | undefined = undefined;
    if (fileName) {
      const lookup = mime.lookup(fileName);
      contentType = typeof lookup === 'string' ? lookup : undefined;
    }

    try {
      // Handle both full URLs and S3 keys
      let s3Key = s3Url;
      if (s3Url.includes('.amazonaws.com/')) {
        s3Key = s3Url.split('.amazonaws.com/')[1];
      }
      
      if (!s3Key || !s3Key.trim()) {
        return NextResponse.json(
          { error: 'Invalid document file reference.' }, 
          { status: 404 }
        );
      }

      // Generate a signed URL for the S3 object (inline preview)
      const previewUrl = await getSignedPreviewUrl(s3Key.trim(), contentType);
      
      return NextResponse.json({
        previewUrl,
        fileName: fileName || 'document'
      });
    } catch (s3Error) {
      console.error('S3 signed preview URL generation error:', s3Error);
      return NextResponse.json(
        { error: 'Failed to generate preview link.' }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Preview error:', error);
    return NextResponse.json(
      { error: 'Failed to process preview request.' }, 
      { status: 500 }
    );
  }
} 