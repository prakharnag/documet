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

    const doc = await db
      .select({
        s3Url: Documents.s3Url,
        fileName: Documents.fileName,
      })
      .from(Documents)
      .where(eq(Documents.slug, slug))
      .limit(1);

    if (!doc.length) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const { s3Url } = doc[0];
    
    let s3Key = '';
    if (s3Url?.includes('amazonaws.com/')) {
      s3Key = s3Url.split('amazonaws.com/')[1];
    } else if (s3Url?.includes('/')) {
      s3Key = s3Url.split('/').pop() || '';
    } else {
      s3Key = s3Url || '';
    }

    return NextResponse.json({
      rawS3Url: s3Url,
      extractedKey: s3Key,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      region: process.env.AWS_REGION,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 });
  }
}