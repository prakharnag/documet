'use client';

import { useState, useEffect } from 'react';

interface DocumentPreviewProps {
  documentId: string;
  fileName?: string | null;
}

export default function DocumentPreview({ documentId, fileName }: DocumentPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreviewUrl = async () => {
      try {
        console.log('Fetching preview URL for document:', documentId);
        const response = await fetch(`/api/Documents/download/${documentId}`);
        const data = await response.json();
        console.log('Preview response:', data);
        
        if (response.ok) {
          setPreviewUrl(data.downloadUrl);
          console.log('Preview URL set:', data.downloadUrl);
        } else {
          console.error('Preview error:', data.error);
          setError(data.error || 'Failed to load preview');
        }
      } catch (err) {
        console.error('Preview fetch error:', err);
        setError('Failed to load preview');
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewUrl();
  }, [documentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-gray-500">Loading preview...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <iframe
      src={previewUrl || ''}
      className="w-full h-[calc(100vh-200px)] border-0"
      title={fileName || 'Document Preview'}
    />
  );
}