'use client';

import { useEffect, useState } from 'react';
import { useUser } from "@stackframe/stack";
import DocumentForm from '@/components/DocumentForm';
import DocumentList from '@/components/DocumentList';
import SettingsModal from '@/components/SettingsModal';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/logo';

export default function DashboardPage() {
  const user = useUser({ or: 'redirect'});

  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [localDisplayName, setLocalDisplayName] = useState<string>('');

  // Use local display name if available, otherwise fallback to Stack's displayName or 'User'
  const userName = localDisplayName || user.displayName || 'User';

  // Load display name from localStorage on component mount
  useEffect(() => {
    if (user?.id) {
      const savedDisplayName = localStorage.getItem(`displayName_${user.id}`);
      if (savedDisplayName) {
        setLocalDisplayName(savedDisplayName);
      }
    }
  }, [user?.id]);
  
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
    return <div className="min-h-screen flex items-center justify-center text-stone-600 text-lg">Loading dashboard...</div>;
  }

  const handleLogout = () => {
    window.location.href = '/handler/sign-out';
  };

  const handleDisplayNameUpdate = (newDisplayName: string) => {
    setLocalDisplayName(newDisplayName);
    // Save to localStorage for persistence
    if (user?.id) {
      localStorage.setItem(`displayName_${user.id}`, newDisplayName);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand */}
            <Logo size="lg" />

            {/* Profile Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                className="flex items-center gap-2 text-stone-700 border-orange-300 hover:bg-orange-50 hover:border-orange-400"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {`Welcome, ${userName}`}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-orange-200 rounded-lg shadow-lg z-50">
                  <button
                    className="w-full flex items-center gap-2 px-4 py-3 text-stone-700 hover:bg-orange-50 text-left"
                    onClick={() => { setSettingsOpen(true); setMenuOpen(false); }}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-3 text-stone-700 hover:bg-orange-50 text-left"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <SettingsModal
          user={user}
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onLogout={handleLogout}
          onDisplayNameUpdate={handleDisplayNameUpdate}
        />
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-8 md:py-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        {/* Left Column: Upload + Steps */}
        <div className="space-y-8 w-full">
          {/* Upload Box */}
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-8 md:p-10 w-full">
            <DocumentForm
              onUploadSuccess={handleUploadSuccess}
              documentCount={documents.length}
            />
          </div>
          {/* Steps/Features List */}
          <div className="bg-gradient-to-r from-orange-50/60 to-amber-50/60 rounded-2xl border border-orange-100 p-6 md:p-8 w-full">
            <h3 className="text-lg font-semibold text-stone-800 mb-4">How Documet Works</h3>
            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600">1</span>
                <div>
                  <div className="font-medium text-stone-800">Upload Your Document</div>
                  <div className="text-sm text-stone-600">We parse and analyze it for you.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-600">2</span>
                <div>
                  <div className="font-medium text-stone-800">Test Your AI Assistant</div>
                  <div className="text-sm text-stone-600">Ask questions either by chat or voice with your document.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center font-bold text-orange-700">3</span>
                <div>
                  <div className="font-medium text-stone-800">Share Public Link</div>
                  <div className="text-sm text-stone-600">Send a unique link to others to collaborate and track engagement.</div>
                </div>
              </li>
            </ol>
          </div>
        </div>
        {/* Right Column: Recent Uploads */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 md:p-8 w-full">
          <DocumentList 
            documents={documents}
            setDocuments={setDocuments}
            loading={documentsLoading}
          />
        </div>
      </div>
    </div>
  );
} 