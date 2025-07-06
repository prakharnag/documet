'use client';

import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Copy, ExternalLink, Trash2 } from 'lucide-react';
import DocumentAgentTester from './DocumentAgentTester';
import ShareModal from './ShareModal';

interface DocumentListProps {
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
}

interface Document {
  id: string;
  slug: string;
  createdAt: string;
  fileName?: string;
  s3Url?: string;
  DocumentText?: string;
}

export default function DocumentList({ documents, setDocuments }: DocumentListProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocuments() {
      setLoading(true);
      setError(null);
      try {
        // User context is handled via Neon Auth session on the backend
        const res = await fetch(`/api/Documents`);
        const data = await res.json();
        if (res.ok) {
          setDocuments(data.Documents || []);
        } else {
          setError(data.error || 'Failed to fetch Documents.');
        }
      } catch (err) {
        setError('Failed to fetch Documents.');
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, []); // Only load once on mount

  const copyDocumentId = (DocumentId: string) => {
    navigator.clipboard.writeText(DocumentId);
    // You could add a toast notification here
  };

  const handleShare = (Document: Document) => {
    setSelectedDocument(Document);
    setShareModalOpen(true);
  };

  const handleDelete = async (DocumentId: string) => {
    if (!confirm('Are you sure you want to delete this Document? This action cannot be undone.')) {
      return;
    }

    setDeletingDocument(DocumentId);
    try {
      const response = await fetch('/api/Documents', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId: DocumentId }),
      });

      if (response.ok) {
        setDocuments(prev => prev.filter(Document => Document.id !== DocumentId));
      } else {
        alert('Failed to delete Document. Please try again.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete Document. Please try again.');
    } finally {
      setDeletingDocument(null);
    }
  };

  if (loading) return <div className="text-center py-8">Loading Documents...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;
  if (documents.length === 0) return (
    <div className="text-center py-8 text-gray-500">
      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <p>No Documents uploaded yet.</p>
      <p className="text-sm">Upload your first Document to get started!</p>
    </div>
  );

  return (
    <div className="mt-6 w-full">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
        <FileText className="w-5 h-5" />
        Your Uploads
      </h3>
      <div className="divide-y divide-gray-100">
        {documents.map((Document, idx) => (
          <div key={Document.id} className={`py-5 px-4 md:px-6 bg-white ${idx !== 0 ? 'mt-2' : ''} rounded-xl shadow-sm flex flex-col gap-4 w-full`}>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-2 mb-1">
                <h4 className="font-medium text-gray-900 break-words whitespace-normal">{Document.fileName ? Document.fileName : 'Document Assistant'}</h4>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Uploaded {new Date(Document.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <DocumentAgentTester 
                DocumentId={Document.id} 
                DocumentTitle={Document.fileName ? Document.fileName : 'Document Assistant'}
                showInitialSummary={true}
                documentData={{
                  s3Url: Document.s3Url,
                  DocumentText: Document.DocumentText
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => handleShare(Document)}
              >
                <ExternalLink className="w-4 h-4" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                onClick={() => handleDelete(Document.id)}
                disabled={deletingDocument === Document.id}
              >
                <Trash2 className="w-4 h-4" />
                {deletingDocument === Document.id ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        ))}
      </div>
      {/* Share Modal */}
      {selectedDocument && (
        <ShareModal
          DocumentId={selectedDocument.id}
          DocumentTitle={`(${selectedDocument.fileName ? selectedDocument.fileName : 'Document Assistant'})`}
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setSelectedDocument(null);
          }}
        />
      )}
    </div>
  );
}