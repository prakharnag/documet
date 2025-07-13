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

export const extractS3Key = (s3Url: string): string => {
  if (!s3Url || !s3Url.trim()) {
    return '';
  }
  
  // Handle full S3 URLs
  if (s3Url.includes('.amazonaws.com/')) {
    return s3Url.split('.amazonaws.com/')[1];
  }
  
  // If it doesn't contain amazonaws.com, assume it's already a key
  // This handles the case where we store S3 keys directly in the database
  return s3Url;
};

export const getPublicS3Url = (key: string): string => {
  // Generate a public URL (no authentication required)
  // Note: This only works if the bucket/object is publicly readable
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
};

export const getSignedDownloadUrl = async (key: string): Promise<string> => {
  // Validate key before processing
  if (!key || key.trim() === '') {
    console.error('❌ Empty S3 key provided');
    throw new Error('S3 key cannot be empty');
  }

  try {
    // Generate signed URL directly without head check to avoid permission issues
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key.trim(),
    });

    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600 // 1 hour
    });
    
    return signedUrl;
  } catch (error) {
    console.error('❌ Signed URL generation failed:', error);
    // Fallback to public URL only if key is valid
    if (key && key.trim()) {
      return getPublicS3Url(key.trim());
    }
    throw error;
  }
};

export const getSignedPreviewUrl = async (key: string, contentType?: string): Promise<string> => {
  // Validate key before processing
  if (!key || key.trim() === '') {
    console.error('❌ Empty S3 key provided for preview');
    throw new Error('S3 key cannot be empty');
  }

  try {
    // Generate signed URL for preview (inline display)
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key.trim(),
      ResponseContentType: contentType, // Set content type for proper display
      ResponseContentDisposition: 'inline', // Display inline instead of download
    });

    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600 // 1 hour
    });
    
    return signedUrl;
  } catch (error) {
    console.error('❌ Signed preview URL generation failed:', error);
    // Fallback to public URL only if key is valid
    if (key && key.trim()) {
      return getPublicS3Url(key.trim());
    }
    throw error;
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