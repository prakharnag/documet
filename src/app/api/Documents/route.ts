import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { db } from "@/db";
import { Documents } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import AWS from 'aws-sdk';
import { EmbeddingService } from '@/lib/embeddings';
import { getSignedDownloadUrl } from '@/lib/s3';

export async function GET(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }
    const userDocuments = await db
      .select({ 
        id: Documents.id, 
        slug: Documents.slug, 
        createdAt: Documents.createdAt, 
        fileName: Documents.fileName,
        s3Url: Documents.s3Url,
        DocumentText: Documents.DocumentText
      })
      .from(Documents)
      .where(eq(Documents.userId, user.id))
      .orderBy(desc(Documents.createdAt));

    // Generate signed URLs for each document
    const documentsWithSignedUrls = await Promise.all(
      userDocuments.map(async (doc) => {
        if (doc.s3Url) {
          try {
            const s3Key = doc.s3Url.split('.amazonaws.com/')[1];
            const signedUrl = await getSignedDownloadUrl(s3Key);
            return { ...doc, s3Url: signedUrl };
          } catch (error) {
            console.error('Failed to generate signed URL for document:', doc.id, error);
            return doc;
          }
        }
        return doc;
      })
    );

    return NextResponse.json({ Documents: documentsWithSignedUrls });
  } catch (error) {
    console.error('List Documents error:', error);
    return NextResponse.json({ error: 'Failed to list Documents.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }
    const { DocumentText, slug } = await req.json();
    const newDocument = await db.insert(Documents).values({
      userId: user.id,
      DocumentText,
      slug,
    }).returning();
    return NextResponse.json({ success: true, Document: newDocument[0] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create Document" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }
    
    const { documentId } = await req.json();
    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required.' }, { status: 400 });
    }

    // Get document info first to get S3 URL
    const document = await db
      .select({ s3Url: Documents.s3Url })
      .from(Documents)
      .where(and(eq(Documents.id, documentId), eq(Documents.userId, user.id)))
      .limit(1);

    if (document.length === 0) {
      return NextResponse.json({ error: 'Document not found or access denied.' }, { status: 404 });
    }

    // Delete from S3 if URL exists
    if (document[0].s3Url) {
      try {
        const s3 = new AWS.S3({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION,
        });
        
        // Extract S3 key from URL
        const s3Key = document[0].s3Url.split('.amazonaws.com/')[1];
        
        await s3.deleteObject({
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: s3Key,
        }).promise();
      } catch (s3Error) {
        console.error('S3 deletion error:', s3Error);
        // Continue with database deletion even if S3 fails
      }
    }

    // Delete vectors from Pinecone
    try {
      const namespace = `user_${user.id}`;
      const deleteResult = await EmbeddingService.deleteVectorsByDocument(documentId, namespace);
      
      if (deleteResult.success) {
        console.log(`Deleted ${deleteResult.vectorsDeleted} vectors from Pinecone for document ${documentId}`);
      } else {
        console.error('Failed to delete vectors from Pinecone:', deleteResult.error);
      }
    } catch (pineconeError) {
      console.error('Pinecone deletion error:', pineconeError);
      // Continue with database deletion even if Pinecone fails
    }

    // Delete document from database (cascades to sections and subsections)
    const deleted = await db.delete(Documents)
      .where(and(eq(Documents.id, documentId), eq(Documents.userId, user.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Document not found or access denied.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Document deleted successfully.' });
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json({ error: 'Failed to delete document.' }, { status: 500 });
  }
}