'use client';

import React, { useState, useEffect } from 'react';

interface DocumentPreviewProps {
  documentId: string;
  fileName?: string | null;
  s3Url?: string | null;
}

export default function DocumentPreview({ documentId, fileName, s3Url }: DocumentPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (s3Url) {
      setPreviewUrl(s3Url);
      setLoading(false);
    } else {
      fetchPreviewUrl();
    }
  }, [documentId, s3Url]);

  const fetchPreviewUrl = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/Documents/preview/${documentId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.previewUrl) {
        setPreviewUrl(data.previewUrl);
      } else {
        throw new Error(data.error || 'No preview URL received');
      }
    } catch (err) {
      console.error('Preview fetch error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load preview';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <div className="text-stone-500 text-sm">Loading preview...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4">
        <div className="text-red-500 text-center">
          <div className="text-lg font-medium mb-2">Preview Unavailable</div>
          <div className="text-sm">{error}</div>
        </div>
        {fileName && (
          <div className="text-stone-600 text-sm">
            Document: {fileName}
          </div>
        )}
      </div>
    );
  }

  if (previewUrl) {
    return (
      <iframe
        src={previewUrl}
        className="w-full h-[calc(100vh-200px)] border-0"
        title={fileName || 'Document Preview'}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4">
      <div className="text-stone-700 text-center">
        <div className="text-lg font-medium mb-2">Preview Not Available</div>
        <div className="text-sm">
          Please download to view the document.
        </div>
      </div>
      {fileName && (
        <div className="text-stone-600 text-sm">
          Document: {fileName}
        </div>
      )}
    </div>
  );
}