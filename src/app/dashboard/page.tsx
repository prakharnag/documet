'use client';

import { useSearchParams } from 'next/navigation';
import ResumeForm from '@/components/ResumeForm';
import ResumeList from '@/components/ResumeList';
import { useState } from 'react';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const [refreshKey, setRefreshKey] = useState(0);

  if (!userId) {
    return <div className="text-red-600">User ID is required. Please register or log in.</div>;
  }

  // When a resume is uploaded, refresh the list
  function handleUploadSuccess() {
    setRefreshKey(k => k + 1);
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Dashboard</h1>
      <ResumeForm userId={userId} onUploadSuccess={handleUploadSuccess} />
      <ResumeList userId={userId} key={refreshKey} />
    </div>
  );
} 