import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import formidable from 'formidable';
import fs from 'fs';
import { OpenAIEmbeddings } from '@langchain/openai';
import mammoth from 'mammoth';
import { promisify } from 'util';
import { Readable } from 'stream';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { db } from '@/db';
import { Documents, DocumentSections, DocumentSubsections } from '@/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { splitSectionIntoSubsections, formatEmbedding } from '@/lib/text-processing';
import { uploadToS3 } from '@/lib/s3';
import { stackServerApp } from '@/stack';
import { nlpProcessor } from '@/lib/nlp-processor';

// // Try/catch PDFLoader import to avoid runtime error if module is missing
// let PDFLoader: any;
// try {
//   // @ts-ignore
//   PDFLoader = require("@langchain/community/document_loaders/fs/pdf").PDFLoader;
// } catch (e) {
//   PDFLoader = null;
// }

export const config = {
  api: {
    bodyParser: false,
  },
};

const readFile = promisify(fs.readFile);

function extractSections(text: string) {
  // Split text into paragraphs for better analysis
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 20);
  
  // If document is short, treat as single section
  if (paragraphs.length <= 3) {
    return [{ section: 'Main Content', content: text.trim() }];
  }
  
  // Dynamic section detection based on content patterns
  const sections: { section: string; content: string }[] = [];
  let currentSection = 'Introduction';
  let currentContent: string[] = [];
  
  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    
    // Detect section headers (short lines, often capitalized)
    if (trimmed.length < 50 && /^[A-Z][A-Za-z\s]{2,}$/.test(trimmed)) {
      // Save previous section
      if (currentContent.length > 0) {
        sections.push({ 
          section: currentSection, 
          content: currentContent.join('\n\n').trim() 
        });
      }
      currentSection = trimmed;
      currentContent = [];
    } else {
      currentContent.push(trimmed);
    }
  }
  
  // Add final section
  if (currentContent.length > 0) {
    sections.push({ 
      section: currentSection, 
      content: currentContent.join('\n\n').trim() 
    });
  }
  
  return sections.filter(s => s.content.length > 30);
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

    // Upload to S3
    const fileBuffer = await readFile(filePath);
    const DocumentId = uuidv4();
    const s3Key = `Documents/${userId}/${DocumentId}/${fileName}`;
    const s3Url = await uploadToS3(fileBuffer, s3Key, fileType);

    let text = '';
    if (fileType === 'application/pdf') {
      const loader = new PDFLoader(filePath);
      const docs = await loader.load();
      text = docs.map((doc: any) => doc.pageContent).join('\n');
    } else if (
      fileType === 'application/msword' ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      text = await mammoth.extractRawText({ path: filePath }).then(res => res.value);
    } else {
      return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
    }

    // 1. Create a Document row with S3 URL
    await db.insert(Documents).values({
      id: DocumentId,
      userId,
      DocumentText: text,
      slug: DocumentId,
      s3Url,
      fileName,
    });

    // 2. Process document with fast extraction (NLP optional)
    console.log('Processing document sections...');
    let processedSections;
    
    try {
      // Try fast processing first
      processedSections = extractSections(text).map(sec => ({
        title: sec.section,
        content: sec.content,
        summary: sec.content.substring(0, 200) + '...',
        keywords: sec.content.toLowerCase().match(/\b\w{4,}\b/g)?.slice(0, 5) || [],
        importance: 1
      }));
    } catch (error) {
      console.error('Fast processing failed, using basic extraction:', error);
      processedSections = [{
        title: 'Document Content',
        content: text,
        summary: text.substring(0, 300) + '...',
        keywords: [],
        importance: 1
      }];
    }
    
    const embeddings = new OpenAIEmbeddings({});
    
    for (const section of processedSections) {
      try {
        // 2a. Create a section row with enhanced data
        const sectionId = uuidv4();
        await db.insert(DocumentSections).values({
          id: sectionId,
          DocumentId,
          sectionName: section.title,
        });
        
        // 2b. Create simplified subsections for faster processing
        const subsections = [
          {
            title: section.title,
            content: section.content,
            type: 'main'
          }
        ];
        
        for (const subsection of subsections) {
          try {
            // Chunk content if too long (max ~6000 chars for embeddings)
            const maxChunkSize = 6000;
            const chunks = [];
            
            if (subsection.content.length <= maxChunkSize) {
              chunks.push(subsection.content);
            } else {
              // Split into chunks
              for (let i = 0; i < subsection.content.length; i += maxChunkSize) {
                chunks.push(subsection.content.substring(i, i + maxChunkSize));
              }
            }
            
            // Process each chunk
            for (let i = 0; i < chunks.length; i++) {
              const chunk = chunks[i];
              const chunkTitle = chunks.length > 1 ? `${subsection.title} - Part ${i + 1}` : subsection.title;
              
              const [vector] = await embeddings.embedDocuments([chunk]);
              const formattedEmbedding = formatEmbedding(vector);
              
              await db.insert(DocumentSubsections).values({
                id: uuidv4(),
                sectionId,
                title: chunkTitle,
                content: chunk,
                embedding: formattedEmbedding,
              });
            }
          } catch (error) {
            console.error(`Error processing subsection "${subsection.title}":`, error);
          }
        }
      } catch (error) {
        console.error(`Error processing section "${section.title}":`, error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Document processed and stored successfully!', 
      DocumentId,
      sectionsProcessed: processedSections.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to process Document.' }, { status: 500 });
  }
} 