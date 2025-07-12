'use client';

import { useEffect, useState } from 'react';
import { useUser } from "@stackframe/stack";
import DocumentForm from '@/components/DocumentForm';
import DocumentList from '@/components/DocumentList';

export default function DashboardPage() {
  const user = useUser({ or: 'redirect'});

  const [documents, setDocuments] = useState<any[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  const handleUploadSuccess = (newDocument: any) => {
    setDocuments(prev => [newDocument, ...prev]);
  };

  const fetchDocuments = async () => {
    setDocumentsLoading(true);
    try {
      const res = await fetch(`/api/Documents`);
      const data = await res.json();
      if (res.ok) {
        setDocuments(data.Documents || []);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setDocumentsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">Loading dashboard...</div>;
  }

  const handleLogout = () => {
    window.location.href = '/handler/sign-out';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Documet</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.displayName || user.id}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <DocumentForm onUploadSuccess={handleUploadSuccess} />
          </div>
          
          {/* Documents List */}
          <div>
            <DocumentList 
              documents={documents}
              setDocuments={setDocuments}
              loading={documentsLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 