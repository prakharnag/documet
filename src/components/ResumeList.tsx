'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Copy, ExternalLink, Trash2 } from 'lucide-react';
import ResumeAgentTester from './ResumeAgentTester';
import ShareModal from './ShareModal';

interface ResumeListProps {
  userId: string;
  refreshKey?: number;
  onResumeChange?: () => void;
}

interface Resume {
  id: string;
  slug: string;
  createdAt: string;
  fileName?: string;
}

export default function ResumeList({ userId, refreshKey, onResumeChange }: ResumeListProps) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [deletingResume, setDeletingResume] = useState<string | null>(null);

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
  }, [userId, refreshKey]);

  const copyResumeId = (resumeId: string) => {
    navigator.clipboard.writeText(resumeId);
    // You could add a toast notification here
  };

  const handleShare = (resume: Resume) => {
    setSelectedResume(resume);
    setShareModalOpen(true);
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }

    setDeletingResume(resumeId);
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setResumes(prev => prev.filter(resume => resume.id !== resumeId));
        if (onResumeChange) onResumeChange();
      } else {
        alert('Failed to delete resume. Please try again.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete resume. Please try again.');
    } finally {
      setDeletingResume(null);
    }
  };

  if (loading) return <div className="text-center py-8">Loading resumes...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;
  if (resumes.length === 0) return (
    <div className="text-center py-8 text-gray-500">
      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <p>No resumes uploaded yet.</p>
      <p className="text-sm">Upload your first resume to get started!</p>
    </div>
  );

  return (
    <div className="mt-6 w-full">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
        <FileText className="w-5 h-5" />
        Your Uploads
      </h3>
      <div className="divide-y divide-gray-100">
        {resumes.map((resume, idx) => (
          <div key={resume.id} className={`py-5 px-4 md:px-6 bg-white ${idx !== 0 ? 'mt-2' : ''} rounded-xl shadow-sm flex flex-col gap-4 w-full`}>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-2 mb-1">
                <h4 className="font-medium text-gray-900 break-words whitespace-normal">{resume.fileName ? resume.fileName : 'Resume Assistant'}</h4>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Uploaded {new Date(resume.createdAt).toLocaleDateString('en-US', {
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
              <ResumeAgentTester 
                resumeId={resume.id} 
                resumeTitle={resume.fileName ? resume.fileName : 'Resume Assistant'}
              />
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => handleShare(resume)}
              >
                <ExternalLink className="w-4 h-4" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                onClick={() => handleDelete(resume.id)}
                disabled={deletingResume === resume.id}
              >
                <Trash2 className="w-4 h-4" />
                {deletingResume === resume.id ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        ))}
      </div>
      {/* Share Modal */}
      {selectedResume && (
        <ShareModal
          resumeId={selectedResume.id}
          resumeTitle={`(${selectedResume.fileName ? selectedResume.fileName : 'Resume Assistant'})`}
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setSelectedResume(null);
          }}
        />
      )}
    </div>
  );
} 