import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { Documents } from '@/db/schema';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Debugging documents in database...');
    
    // Fetch all documents with their S3 URLs
    const docs = await db
      .select({
        id: Documents.id,
        fileName: Documents.fileName,
        s3Url: Documents.s3Url,
        userId: Documents.userId,
        createdAt: Documents.createdAt,
      })
      .from(Documents)
      .limit(10); // Limit to first 10 for debugging

    console.log('📋 Found documents:', docs.length);
    
    const documentsWithInfo = docs.map(doc => ({
      id: doc.id,
      fileName: doc.fileName,
      s3Url: doc.s3Url,
      userId: doc.userId,
      createdAt: doc.createdAt,
      s3Key: doc.s3Url?.includes('.amazonaws.com/') 
        ? doc.s3Url.split('.amazonaws.com/')[1] 
        : doc.s3Url,
      hasS3Url: !!doc.s3Url,
    }));

    return NextResponse.json({
      success: true,
      documentCount: docs.length,
      documents: documentsWithInfo,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      region: process.env.AWS_REGION,
    });
    
  } catch (error) {
    console.error('❌ Debug documents error:', error);
    return NextResponse.json({
      error: 'Failed to fetch documents',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 