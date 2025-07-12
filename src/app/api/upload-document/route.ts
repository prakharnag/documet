import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import formidable from 'formidable';
import fs from 'fs';
import mammoth from 'mammoth';
import { promisify } from 'util';
import { Readable } from 'stream';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { db } from '@/db';
import { Documents, DocumentSections, DocumentSubsections } from '@/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { uploadToS3 } from '@/lib/s3';
import { stackServerApp } from '@/stack';
import { EmbeddingService } from '@/lib/embeddings';
import mime from 'mime-types';
import { execFile } from 'child_process';
import path from 'path';
import util from 'util';
const execFileAsync = util.promisify(execFile);

// Use the full path to soffice for macOS, configurable via env
const libreOfficePath = process.env.LIBREOFFICE_PATH || '/Applications/LibreOffice.app/Contents/MacOS/soffice';

export const config = {
  api: {
    bodyParser: false,
  },
};

const readFile = promisify(fs.readFile);

function createChunks(text: string, maxChunkSize: number = 1500, overlap: number = 200) {
  // Clean the text but preserve all content
  const cleanText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  if (cleanText.length <= maxChunkSize) {
    return [cleanText];
  }
  
  const chunks: string[] = [];
  let start = 0;
  
  while (start < cleanText.length) {
    let end = start + maxChunkSize;
    
    // If we're not at the end of the text, try to break at a sentence or paragraph
    if (end < cleanText.length) {
      // Look for paragraph break first
      const paragraphBreak = cleanText.lastIndexOf('\n\n', end);
      if (paragraphBreak > start + maxChunkSize * 0.5) {
        end = paragraphBreak + 2;
      } else {
        // Look for sentence break
        const sentenceBreak = cleanText.lastIndexOf('. ', end);
        if (sentenceBreak > start + maxChunkSize * 0.5) {
          end = sentenceBreak + 2;
        } else {
          // Look for any whitespace
          const spaceBreak = cleanText.lastIndexOf(' ', end);
          if (spaceBreak > start + maxChunkSize * 0.5) {
            end = spaceBreak + 1;
          }
        }
      }
    }
    
    const chunk = cleanText.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    
    // Move start position with overlap
    start = end - overlap;
    if (start >= cleanText.length) break;
  }
  
  return chunks.filter(chunk => chunk.length > 50); // Only filter very short chunks
}

function nodeRequestFromNextRequest(req: NextRequest) {
  return (async () => {
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);
    // @ts-ignore
    stream.headers = Object.fromEntries(req.headers.entries());
    // @ts-ignore
    stream.method = req.method;
    // @ts-ignore
    stream.url = req.url;
    return stream;
  })();
}

export async function POST(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }
    const userId = user.id;

    const nodeReq = await nodeRequestFromNextRequest(req);
    const form = formidable({ multiples: false, keepExtensions: true });
    const formData = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(nodeReq, (err: Error | null, fields: formidable.Fields, files: formidable.Files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });
    const file = formData.files.Document;
    console.log("formData: ", formData.fields);
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }
    const uploadedFile = Array.isArray(file) ? file[0] : file;
    const filePath = uploadedFile.filepath || uploadedFile.path;
    const fileType = uploadedFile.mimetype || uploadedFile.type;
    const fileName = uploadedFile.originalFilename || uploadedFile.name || 'Document.pdf';

    // Infer content type from fileName using mime-types
    let contentType = fileType;
    if (fileName) {
      const inferredType = mime.lookup(fileName);
      if (inferredType) {
        contentType = inferredType;
      }
    }

    // Upload to S3
    const fileBuffer = await readFile(filePath);
    const DocumentId = uuidv4();
    const s3Key = `Documents/${userId}/${DocumentId}/${fileName}`;
    const s3Url = await uploadToS3(fileBuffer, s3Key, contentType);

    let pdfS3Url = null;
    let text = '';
    if (fileType === 'application/pdf') {
      const loader = new PDFLoader(filePath);
      const docs = await loader.load();
      text = docs.map((doc: any) => doc.pageContent).join('\n');
    } else if (
      fileType === 'application/msword' ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      // Convert DOCX/DOC to PDF using LibreOffice (soffice)
      const outputDir = path.dirname(filePath);
      await execFileAsync(libreOfficePath, [
        '--headless',
        '--convert-to', 'pdf',
        '--outdir', outputDir,
        filePath,
      ]);
      // Find the actual PDF file generated
      const files = fs.readdirSync(outputDir);
      console.log('Files in outputDir after conversion:', files);
      const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));
      if (pdfFiles.length === 0) {
        throw new Error('PDF conversion failed: No PDF file found in output directory');
      }
      const pdfPath = path.join(outputDir, pdfFiles[0]);
      const pdfBuffer = await readFile(pdfPath);
      const pdfS3Key = `Documents/${userId}/${DocumentId}/${pdfFiles[0]}`;
      pdfS3Url = await uploadToS3(pdfBuffer, pdfS3Key, 'application/pdf');
      // Extract text from original docx/doc for embeddings
      text = await mammoth.extractRawText({ path: filePath }).then(res => res.value);
    } else {
      return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
    }

    // 1. Create a Document row with S3 URL and PDF S3 URL
    await db.insert(Documents).values({
      id: DocumentId,
      userId,
      DocumentText: text,
      slug: DocumentId,
      s3Url,
      fileName,
      pdfS3Url, // Store PDF S3 URL for preview
    });

    // 2. Process document with improved chunking
    console.log('Processing document with smart chunking...');
    console.log(`Original text length: ${text.length} characters`);
    
    // Create chunks with overlap for better context preservation
    const chunks = createChunks(text, 1500, 200);
    console.log(`Created ${chunks.length} chunks for embedding`);
    
    // Log chunk sizes for debugging
    chunks.forEach((chunk, i) => {
      console.log(`Chunk ${i + 1}: ${chunk.length} characters`);
    });
    
    // Prepare chunks for Pinecone storage
    const pineconeChunks = chunks.map((chunk, index) => ({
      id: `${DocumentId}_chunk_${index}`,
      text: chunk,
      metadata: {
        filename: fileName,
        user_id: userId,
        chunk_id: `${DocumentId}_chunk_${index}`,
        document_id: DocumentId,
        chunk_index: index,
        total_chunks: chunks.length,
      }
    }));
    
    // Store embeddings in Pinecone
    const namespace = `user_${userId}`;
    const embeddingResult = await EmbeddingService.storeEmbeddingsWithText(pineconeChunks, namespace);
    
    if (!embeddingResult.success) {
      throw new Error(`Failed to store embeddings: ${embeddingResult.error}`);
    }
    
    // All chunks and embeddings are stored in Pinecone only
    console.log(`Successfully stored ${chunks.length} chunks in Pinecone namespace: ${namespace}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Document processed and stored successfully!', 
      DocumentId,
      chunksProcessed: chunks.length,
      vectorsStored: embeddingResult.vectorsStored,
      namespace
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to process Document.' }, { status: 500 });
  }
} 