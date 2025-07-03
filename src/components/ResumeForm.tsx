'use client';

import { useState, useRef, useEffect } from 'react';

interface ResumeFormProps {
  userId: string;
  onUploadSuccess?: () => void;
  refreshKey?: number;
}

export default function ResumeForm({ userId, onUploadSuccess, refreshKey }: ResumeFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [resumeCount, setResumeCount] = useState<number>(0);
  const MAX_RESUMES = 5;

  useEffect(() => {
    async function fetchResumeCount() {
      try {
        const res = await fetch(`/api/resumes?userId=${userId}`);
        const data = await res.json();
        if (res.ok && Array.isArray(data.resumes)) {
          setResumeCount(data.resumes.length);
        }
      } catch {}
    }
    fetchResumeCount();
  }, [userId, onUploadSuccess, refreshKey]);

  function handleDrag(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  }

  async function uploadFile(file: File) {
    if (resumeCount >= MAX_RESUMES) {
      setMessage('You can only upload up to 5 resumes. Please delete an existing one to upload more.');
      setFileName(null);
      return;
    }
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      setMessage('Please upload a PDF or Word document (.pdf, .doc, .docx).');
      setFileName(null);
      return;
    }
    setIsUploading(true);
    setMessage(null);
    setFileName(file.name);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('userId', userId);
    try {
      const res = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setMessage('Resume uploaded and processed successfully!');
        if (onUploadSuccess) onUploadSuccess();
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to process resume.');
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
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">Upload your Resume</h2>
      <div className="text-sm text-gray-700 mb-2 text-center">
        {`You have uploaded ${resumeCount} of ${MAX_RESUMES} resumes.`}
      </div>
      {resumeCount >= MAX_RESUMES && (
        <div className="text-red-600 text-center mb-4">You have reached the maximum of 5 resumes. Delete one to upload more.</div>
      )}
      <div
        className={`w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors duration-200 cursor-pointer ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
        onDragEnter={resumeCount < MAX_RESUMES ? handleDrag : undefined}
        onDragOver={resumeCount < MAX_RESUMES ? handleDrag : undefined}
        onDragLeave={resumeCount < MAX_RESUMES ? handleDrag : undefined}
        onDrop={resumeCount < MAX_RESUMES ? handleDrop : undefined}
        onClick={() => resumeCount < MAX_RESUMES && inputRef.current?.click()}
        style={{ minHeight: 140, opacity: resumeCount >= MAX_RESUMES ? 0.5 : 1, pointerEvents: resumeCount >= MAX_RESUMES ? 'none' : 'auto' }}
      >
        <svg className="w-10 h-10 mb-2 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0-3 3m3-3 3 3m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-700 mb-1">Drag & drop your PDF or Word doc here</p>
        <p className="text-xs text-gray-500">or click to select a file (.pdf, .doc, .docx)</p>
        <input
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={resumeCount < MAX_RESUMES ? handleFileChange : undefined}
          disabled={isUploading || resumeCount >= MAX_RESUMES}
          ref={inputRef}
          className="hidden"
        />
      </div>
      {fileName && <p className="mt-2 text-sm text-blue-600">Selected: {fileName}</p>}
      {isUploading && <p className="mt-2 text-sm text-gray-600">Uploading and processing...</p>}
      {message && <p className={`mt-2 text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
    </div>
  );
} 