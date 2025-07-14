'use client';

import { useState, useRef } from 'react';

interface DocumentFormProps {
  onUploadSuccess?: (document: any) => void;
  documentCount?: number;
}

export default function DocumentForm({ onUploadSuccess, documentCount = 0 }: DocumentFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const MAX_DocumentS = 5;

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  async function uploadFile(file: File) {
    if (documentCount >= MAX_DocumentS) {
      setMessage('You can only upload up to 5 Documents. Please delete an existing one to upload more.');
      setFileName(null);
      return;
    }
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      setMessage('Please upload a PDF or Word document (.pdf, .doc, .docx).');
      setFileName(null);
      return;
    }
    setIsUploading(true);
    setFileName(file.name);
    const formData = new FormData();
    formData.append('Document', file);
    try {
      const res = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setMessage('Document uploaded and processed successfully!');
        
        const newDocument = {
          id: data.DocumentId,
          slug: data.DocumentId,
          createdAt: new Date().toISOString(),
          fileName: file.name,
          s3Url: '',
          DocumentText: ''
        };
        
        if (onUploadSuccess) onUploadSuccess(newDocument);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to process Document.');
      }
    } catch (err) {
      setMessage('An error occurred while uploading.');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
      setFileName(null);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm border border-orange-200 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4 text-center text-stone-800">Upload your Document</h2>
      <div className="text-sm text-stone-700 mb-2 text-center">
        {`You have uploaded ${documentCount} of ${MAX_DocumentS} Documents.`}
      </div>
      {documentCount >= MAX_DocumentS && (
        <div className="text-red-600 text-center mb-4">You have reached the maximum of 5 Documents. Delete one to upload more.</div>
      )}
      <div
        className={`w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors duration-200 cursor-pointer ${dragActive ? 'border-orange-500 bg-orange-50' : 'border-orange-300 bg-orange-50'}`}
        onDragEnter={documentCount < MAX_DocumentS ? handleDrag : undefined}
        onDragOver={documentCount < MAX_DocumentS ? handleDrag : undefined}
        onDragLeave={documentCount < MAX_DocumentS ? handleDrag : undefined}
        onDrop={documentCount < MAX_DocumentS ? handleDrop : undefined}
        onClick={() => {
          if (documentCount < MAX_DocumentS) {
            inputRef.current?.click();
          }
        }}
        style={{ minHeight: 140, opacity: documentCount >= MAX_DocumentS ? 0.5 : 1, pointerEvents: documentCount >= MAX_DocumentS ? 'none' : 'auto' }}
      >
        <svg className="w-10 h-10 mb-2 text-orange-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0-3 3m3-3 3 3m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-stone-700 mb-1">Drag & drop your PDF</p>
        <p className="text-xs text-stone-500">or click to select a file (Only PDF)</p>
        <input
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={documentCount < MAX_DocumentS ? handleFileChange : undefined}
          disabled={isUploading || documentCount >= MAX_DocumentS}
          ref={inputRef}
          className="hidden"
        />
      </div>
      {fileName && <p className="mt-2 text-sm text-orange-600">Selected: {fileName}</p>}
      {isUploading && <p className="mt-2 text-sm text-stone-600">Uploading and processing...</p>}
      {message && <p className={`mt-2 text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
    </div>
  );
} 