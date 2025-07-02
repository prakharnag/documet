'use client';

import { useEffect, useState } from 'react';

interface ResumeListProps {
  userId: string;
}

interface Resume {
  id: string;
  slug: string;
  createdAt: string;
}

export default function ResumeList({ userId }: ResumeListProps) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResumes() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/resumes?userId=${userId}`);
        const data = await res.json();
        if (res.ok) {
          setResumes(data.resumes);
        } else {
          setError(data.error || 'Failed to fetch resumes.');
        }
      } catch (err) {
        setError('Failed to fetch resumes.');
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchResumes();
  }, [userId]);

  if (loading) return <div>Loading resumes...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (resumes.length === 0) return <div>No resumes uploaded yet.</div>;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Your Uploaded Resumes</h3>
      <ul className="space-y-2">
        {resumes.map((resume) => (
          <li key={resume.id} className="p-3 border rounded bg-white dark:bg-neutral-900 flex flex-col md:flex-row md:items-center md:justify-between">
            <span className="font-mono text-sm">{resume.slug}</span>
            <span className="text-xs text-gray-500 mt-1 md:mt-0">{new Date(resume.createdAt).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
} 