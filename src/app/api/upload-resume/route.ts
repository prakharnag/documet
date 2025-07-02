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
import { resumes, resumeSections, resumeSubsections } from '@/db/schema';
import { v4 as uuidv4 } from 'uuid';

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

// Example: split section content into entries (subsections) by double newlines or bullet points
function splitSectionEntries(section: string, content: string): { title: string, content: string }[] {
  // For Work Experience, Projects, Education, split by double newlines or bullets
  if (["Experience", "Projects", "Education"].includes(section)) {
    // Try to split by double newlines or lines starting with a dash/bullet
    const entries = content.split(/\n\n|\n[-•*]/).map(e => e.trim()).filter(e => e.length > 30);
    return entries.map((entry, i) => ({ title: `${section} Entry ${i + 1}`, content: entry }));
  }
  // For Skills, split by comma or line
  if (section === "Skills") {
    const skills = content.split(/,|\n/).map(s => s.trim()).filter(s => s.length > 2);
    return [{ title: "Skills", content: skills.join(", ") }];
  }
  // For Summary or other, just one entry
  return [{ title: section, content }];
}

function extractSections(text: string) {
  const sections = [
    { name: 'Summary', patterns: [/summary/i, /highlights/i, /professional summary/i] },
    { name: 'Skills', patterns: [/skills/i, /technical skills/i] },
    { name: 'Experience', patterns: [/experience/i, /work experience/i, /professional experience/i] },
    { name: 'Projects', patterns: [/projects/i, /technical projects/i] },
    { name: 'Education', patterns: [/education/i] },
  ];
  const result: { section: string; content: string }[] = [];
  let lastIndex = 0;
  let lastSection = 'Other';
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    for (const sec of sections) {
      for (const pat of sec.patterns) {
        if (pat.test(lines[i])) {
          if (i > lastIndex) {
            result.push({ section: lastSection, content: lines.slice(lastIndex, i).join('\n').trim() });
          }
          lastSection = sec.name;
          lastIndex = i + 1;
        }
      }
    }
  }
  if (lastIndex < lines.length) {
    result.push({ section: lastSection, content: lines.slice(lastIndex).join('\n').trim() });
  }
  return result.filter(s => s.content.length > 30);
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
    const nodeReq = await nodeRequestFromNextRequest(req);
    const form = formidable({ multiples: false, keepExtensions: true });
    const formData = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(nodeReq, (err: Error | null, fields: formidable.Fields, files: formidable.Files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });
    const file = formData.files.resume;
    console.log("formData: ", formData.fields);
    const userIdRaw = formData.fields.userId as string | string[];
    let userId: string;
    
    // Handle userId as string or array
    if (Array.isArray(userIdRaw)) {
      userId = userIdRaw[0];
    } else {
      userId = userIdRaw;
    }
    
    // If userId is a JSON string, parse and extract
    if (typeof userId === 'string' && userId.startsWith('{')) {
      try {
        const parsed = JSON.parse(userId);
        userId = parsed.userId || userId;
      } catch {
        // fallback to original
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required.' }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }
    const uploadedFile = Array.isArray(file) ? file[0] : file;
    const filePath = uploadedFile.filepath || uploadedFile.path;
    const fileType = uploadedFile.mimetype || uploadedFile.type;

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

    // 1. Create a resume row
    const resumeId = uuidv4();
    await db.insert(resumes).values({
      id: resumeId,
      userId,
      resumeText: text,
      slug: resumeId,
    });

    // 2. Parse into sections
    const sections = extractSections(text);
    const embeddings = new OpenAIEmbeddings({});
    for (const sec of sections) {
      // 2a. Create a section row
      const sectionId = uuidv4();
      await db.insert(resumeSections).values({
        id: sectionId,
        resumeId,
        sectionName: sec.section,
      });
      // 2b. Split section into entries (subsections)
      const entries = splitSectionEntries(sec.section, sec.content);
      for (const entry of entries) {
        const [vector] = await embeddings.embedDocuments([entry.content]);
        await db.insert(resumeSubsections).values({
          id: uuidv4(),
          sectionId,
          title: entry.title,
          content: entry.content,
          embedding: vector,
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Resume processed, sections and subsections embedded and stored!', resumeId });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to process resume.' }, { status: 500 });
  }
} 