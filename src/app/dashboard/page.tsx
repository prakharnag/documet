'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import DocumentForm from '@/components/DocumentForm';
import DocumentList, { DocumentListRef } from '@/components/DocumentList';
import { Bot, Upload, MessageSquare, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from "@stackframe/stack";
import Logo from '@/components/ui/logo';

export default function DashboardPage() {
  const user = useUser({ or: 'redirect'});

  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [documents, setDocuments] = useState<any[]>([]);

  // Use displayName, fallback to 'User'
  const userName = user.displayName || 'User';
  
  const handleUploadSuccess = (newDocument: any) => {
    setDocuments(prev => [newDocument, ...prev]);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

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
            {/* Brand */}
            <Logo size="lg" />

            {/* Profile Dropdown */}
            <div className="relative" ref={menuRef}>
              <Button
                variant="outline"
                className="flex items-center gap-2 text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {`Welcome, ${userName}`}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <button
                    className="w-full flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 text-left"
                    onClick={() => { setSettingsOpen(true); setMenuOpen(false); }}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 text-left"
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
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 border border-gray-200 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => setSettingsOpen(false)}
            >
              ×
            </button>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" /> Settings
            </h2>
            <div className="space-y-8">
              {/* Reset Password */}
              {/* You may need to update these forms to use Neon Auth if you want passwordless or OAuth only */}
              {/* <ResetPasswordForm userId={user.id} onClose={() => setSettingsOpen(false)} /> */}
              {/* <DeleteAccountForm userId={user.id} onDelete={() => { setSettingsOpen(false); handleLogout(); }} /> */}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-8 md:py-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        {/* Left Column: Upload + Steps */}
        <div className="space-y-8 w-full">
          {/* Upload Box */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 w-full">
            <DocumentForm
              onUploadSuccess={handleUploadSuccess}
              // User context is handled via Neon Auth session
            />
          </div>
          {/* Steps/Features List */}
          <div className="bg-gradient-to-r from-blue-50/60 to-purple-50/60 rounded-2xl border border-gray-100 p-6 md:p-8 w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How Documet Works</h3>
            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">1</span>
                <div>
                  <div className="font-medium text-gray-900">Upload Your Document</div>
                  <div className="text-sm text-gray-600">PDF or Word format. We parse and analyze it for you.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600">2</span>
                <div>
                  <div className="font-medium text-gray-900">Test Your AI Assistant</div>
                  <div className="text-sm text-gray-600">Ask questions and see how Anyone will interact with your Document.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600">3</span>
                <div>
                  <div className="font-medium text-gray-900">Share Public Link</div>
                  <div className="text-sm text-gray-600">Send a unique link to Anyone and track engagement.</div>
                </div>
              </li>
            </ol>
          </div>
        </div>
        {/* Right Column: Recent Uploads */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 w-full">
          <DocumentList 
            documents={documents}
            setDocuments={setDocuments}
            /* User context is handled via Neon Auth session */ 
          />
        </div>
      </div>
    </div>
  );
} 