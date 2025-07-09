import { NextRequest, NextResponse } from 'next/server';
import { testS3Connection, getSignedDownloadUrl } from '@/lib/s3';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Testing S3 connection...');
    
    // Test 1: Basic connection
    const connectionTest = await testS3Connection();
    console.log('Connection test result:', connectionTest);
    
    if (!connectionTest.success) {
      return NextResponse.json({
        error: 'S3 connection failed',
        details: connectionTest.error,
        env: {
          bucket: process.env.AWS_S3_BUCKET_NAME,
          region: process.env.AWS_REGION,
          hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
          hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
        }
      }, { status: 500 });
    }
    
    // Test 2: Try to generate a signed URL for a test file
    try {
      const testKey = 'test-file.txt';
      const signedUrl = await getSignedDownloadUrl(testKey);
      console.log('Signed URL generated successfully');
      
      return NextResponse.json({
        success: true,
        message: 'S3 connection and signed URL generation working',
        testSignedUrl: signedUrl,
        env: {
          bucket: process.env.AWS_S3_BUCKET_NAME,
          region: process.env.AWS_REGION,
        }
      });
    } catch (signedUrlError) {
      console.error('Signed URL generation failed:', signedUrlError);
      return NextResponse.json({
        error: 'Signed URL generation failed',
        details: signedUrlError instanceof Error ? signedUrlError.message : 'Unknown error',
        connectionTest: connectionTest.success,
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('S3 test error:', error);
    return NextResponse.json({
      error: 'S3 test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 