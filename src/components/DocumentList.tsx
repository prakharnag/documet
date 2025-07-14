'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, ExternalLink, Trash2 } from 'lucide-react';
import DocumentAgentTester from './DocumentAgentTester';
import ShareModal from './ShareModal';

interface DocumentListProps {
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  loading: boolean;
}

interface Document {
  id: string;
  slug: string;
  createdAt: string;
  fileName?: string;
  s3Url?: string;
  DocumentText?: string;
}

export default function DocumentList({ documents, setDocuments, loading }: DocumentListProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<string | null>(null);



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

  if (loading) return (
    <div className="space-y-3 sm:space-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
  if (documents.length === 0) return (
    <div className="text-center py-6 sm:py-8 text-stone-500">
      <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-orange-300" />
      <p className="text-sm sm:text-base">No Documents uploaded yet.</p>
      <p className="text-xs sm:text-sm">Upload your first Document to get started!</p>
    </div>
  );

  return (
    <div className="w-full">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-stone-800">
        <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
        Your Uploads
      </h3>
      <div className="space-y-3 sm:space-y-4">
        {documents.map((Document, idx) => (
          <div key={Document.id} className="py-4 sm:py-5 px-3 sm:px-4 md:px-6 bg-white rounded-xl shadow-sm border border-orange-100 flex flex-col gap-3 sm:gap-4 w-full">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-1 sm:gap-2 mb-1">
                <h4 className="font-medium text-stone-800 break-words whitespace-normal text-sm sm:text-base">{Document.fileName ? Document.fileName : 'Document Assistant'}</h4>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-xs text-stone-500 flex-wrap mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs">Uploaded {new Date(Document.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
            </div>
                          <div className="flex flex-col sm:flex-row gap-2">
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
                  className="flex items-center gap-2 text-xs sm:text-sm"
                  onClick={() => handleShare(Document)}
                >
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 text-xs sm:text-sm"
                  onClick={() => handleDelete(Document.id)}
                  disabled={deletingDocument === Document.id}
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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