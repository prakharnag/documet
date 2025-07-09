import { NextRequest, NextResponse } from 'next/server';
import { getSignedDownloadUrl, getPublicS3Url } from '@/lib/s3';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('id');
    
    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    // Fetch the actual document from database
    const { db } = await import('@/db');
    const { Documents } = await import('@/db/schema');
    const { eq } = await import('drizzle-orm');
    
    const doc = await db
      .select({
        id: Documents.id,
        s3Url: Documents.s3Url,
        fileName: Documents.fileName,
      })
      .from(Documents)
      .where(eq(Documents.id, documentId))
      .limit(1);

    if (!doc.length) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const testS3Url = doc[0].s3Url;
    if (!testS3Url) {
      return NextResponse.json({ error: 'Document has no S3 URL' }, { status: 404 });
    }
    
    console.log('🔍 Testing S3 key extraction for document:', documentId);
    console.log('📄 Original S3 URL:', testS3Url);
    
    // Extract S3 key
    const urlParts = testS3Url.split('.amazonaws.com/');
    if (urlParts.length !== 2) {
      return NextResponse.json({ error: 'Invalid S3 URL format' }, { status: 500 });
    }
    
    const s3Key = urlParts[1];
    console.log('🔧 Extracted S3 key:', s3Key);
    
    // Test signed URL generation with detailed error handling
    console.log('🎯 Generating signed URL for key:', s3Key);
    try {
      const signedUrl = await getSignedDownloadUrl(s3Key);
      console.log('✅ Generated signed URL successfully');
      
      // Test if the signed URL actually works by making a HEAD request
      const headResponse = await fetch(signedUrl, { method: 'HEAD' });
      console.log('🔍 Signed URL HEAD response status:', headResponse.status);
      
      if (headResponse.ok) {
        console.log('✅ Signed URL is working correctly');
      } else {
        console.log('⚠️ Signed URL returned status:', headResponse.status);
      }
      
      return NextResponse.json({
        success: true,
        documentId,
        originalUrl: testS3Url,
        extractedKey: s3Key,
        signedUrl: signedUrl,
        headResponseStatus: headResponse.status,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        region: process.env.AWS_REGION,
      });
    } catch (signedUrlError) {
      console.error('❌ Signed URL generation failed:', signedUrlError);
      
      // Test if the object exists at all
      const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
      const publicResponse = await fetch(publicUrl, { method: 'HEAD' });
      
      return NextResponse.json({
        success: false,
        error: 'Signed URL generation failed',
        details: signedUrlError instanceof Error ? signedUrlError.message : 'Unknown error',
        documentId,
        extractedKey: s3Key,
        publicUrlStatus: publicResponse.status,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        region: process.env.AWS_REGION,
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ S3 key test error:', error);
    return NextResponse.json({
      error: 'S3 key test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 