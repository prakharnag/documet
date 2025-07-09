import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadToS3 = async (
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  // Return just the S3 key for easier signed URL generation
  return key;
};

export const getS3Url = (key: string): string => {
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
};

export const getPublicS3Url = (key: string): string => {
  // Generate a public URL (no authentication required)
  // Note: This only works if the bucket/object is publicly readable
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
};

export const getSignedDownloadUrl = async (key: string): Promise<string> => {
  try {
    // Generate signed URL directly without head check to avoid permission issues
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600 // 1 hour
    });
    
    return signedUrl;
  } catch (error) {
    console.error('❌ Signed URL generation failed:', error);
    // Fallback to public URL
    return getPublicS3Url(key);
  }
};

export const testS3Connection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Testing S3 connection...');
    console.log('Bucket:', process.env.AWS_S3_BUCKET_NAME);
    console.log('Region:', process.env.AWS_REGION);
    console.log('Access Key ID:', process.env.AWS_ACCESS_KEY_ID?.substring(0, 8) + '...');
    
    // Try to list objects in the bucket (this tests permissions)
    const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      MaxKeys: 1, // Just get one object to test
    });
    
    await s3Client.send(listCommand);
    console.log('S3 connection test successful');
    return { success: true };
  } catch (error) {
    console.error('S3 connection test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export { s3Client };