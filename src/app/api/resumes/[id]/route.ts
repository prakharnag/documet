import { S3Client, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { resumes, resumeSections, resumeSubsections } from "@/db/schema";
import { eq } from "drizzle-orm";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const resumeId = resolvedParams.id;

    // Get the resume data
    const resumeData = await db
      .select()
      .from(resumes)
      .where(eq(resumes.id, resumeId))
      .limit(1);

    if (!resumeData || resumeData.length === 0) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const resume = resumeData[0];
    
    if (!resume.s3Url) {
      return NextResponse.json({ error: "No original file found for this resume." }, { status: 404 });
    }

    // Extract S3 key from URL
    const s3Key = resume.s3Url.split('.amazonaws.com/')[1];

    // Fetch the file from S3
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: s3Key,
    });
    const s3Response = await s3.send(command);

    // Use the original filename, fallback to a reasonable default
    const downloadFilename = resume.fileName || `resume_${resume.slug}.pdf`;

    // Stream the file to the client
    return new NextResponse(s3Response.Body as any, {
      headers: {
        "Content-Type": s3Response.ContentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${downloadFilename.replace(/[^a-zA-Z0-9.-]/g, '_')}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error('Download resume error:', error);
    return NextResponse.json({ error: "Failed to download resume" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const resumeId = resolvedParams.id;

    // Get the resume data to find S3 key
    const resumeData = await db
      .select()
      .from(resumes)
      .where(eq(resumes.id, resumeId))
      .limit(1);

    if (!resumeData || resumeData.length === 0) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const resume = resumeData[0];

    // Delete from S3 if file exists
    if (resume.s3Url) {
      try {
        const s3Key = resume.s3Url.split('.amazonaws.com/')[1];
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: s3Key,
        });
        await s3.send(deleteCommand);
      } catch (s3Error) {
        console.error('S3 delete error:', s3Error);
        // Continue with database deletion even if S3 deletion fails
      }
    }

    // Delete from database (CASCADE will handle related records)
    await db.delete(resumes).where(eq(resumes.id, resumeId));

    return NextResponse.json({ success: true, message: "Resume deleted successfully" });
  } catch (error) {
    console.error('Delete resume error:', error);
    return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 });
  }
}