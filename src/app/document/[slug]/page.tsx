import { notFound } from 'next/navigation';
import { db } from '@/db';
import { Documents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import DocumentAgentTester from '@/components/DocumentAgentTester';
import DocumentPreview from '@/components/DocumentPreview';

export default async function DocumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await db
    .select()
    .from(Documents)
    .where(eq(Documents.slug, slug))
    .limit(1);

  if (!doc.length) {
    notFound();
  }

  const document = doc[0];

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="flex h-screen">
        {/* Left Side - Document Preview */}
        <div className="w-1/2 bg-orange-50/20 border-r border-orange-200 overflow-y-auto">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-stone-800 mb-4">{document.fileName || 'Document'}</h1>
            <div className="bg-white rounded-lg border border-orange-200 overflow-hidden">
              {document.s3Url ? (
                <DocumentPreview documentId={document.id} fileName={document.fileName} />
              ) : (
                <div className="p-4">
                  <pre className="whitespace-pre-wrap text-sm text-stone-700 font-mono leading-relaxed">
                    {document.DocumentText}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Chatbot */}
        <div className="w-1/2 bg-orange-50/20">
          <DocumentAgentTester 
            DocumentId={document.id} 
            DocumentTitle={document.fileName || 'Document'} 
            defaultOpen={true}
            welcomeMessage={{
              title: "AI Document Assistant",
              subtitle: "Ask any question you have about this document"
            }}
            showInitialSummary={true}
          />
        </div>
      </div>
    </div>
  );
} 