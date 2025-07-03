import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { resumes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSignedDownloadUrl } from '@/lib/s3';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resumeId = params.id;

    // Get resume info from database
    const resume = await db
      .select({
        s3Url: resumes.s3Url,
        fileName: resumes.fileName,
      })
      .from(resumes)
      .where(eq(resumes.id, resumeId))
      .limit(1);

    if (resume.length === 0 || !resume[0].s3Url) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Extract S3 key from URL
    const s3Key = resume[0].s3Url.split('.amazonaws.com/')[1];
    
    // Generate signed URL for download
    const downloadUrl = await getSignedDownloadUrl(s3Key);

    return NextResponse.json({
      downloadUrl,
      fileName: resume[0].fileName,
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
  }
}