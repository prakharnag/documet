'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import ResumeForm from '@/components/ResumeForm';
import ResumeList from '@/components/ResumeList';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Upload, MessageSquare, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserDetails } from '@/lib/neon-auth';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId');
  const [refreshKey, setRefreshKey] = useState(0);
  const [userName, setUserName] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUser() {
      if (userId) {
        try {
          const user = await getUserDetails(userId);
          setUserName(user?.name || null);
        } catch {
          setUserName(null);
        }
      }
    }
    fetchUser();
  }, [userId]);

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

  if (!userId) {
    return <div className="text-red-600">User ID is required. Please register or log in.</div>;
  }

  // When a resume is uploaded or deleted, refresh the list and upload form
  function handleResumeChange() {
    setRefreshKey(k => k + 1);
  }

  const handleLogout = () => {
    // Clear any stored user data and redirect to landing page
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Ressumate</h1>
                <p className="text-sm text-gray-500">Make your resume an intelligent, shareable assistant</p>
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={menuRef}>
              <Button
                variant="outline"
                className="flex items-center gap-2 text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {userName === null ? 'Loading...' : `Welcome, ${userName || 'User'}`}
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
              <ResetPasswordForm userId={userId!} onClose={() => setSettingsOpen(false)} />
              {/* Delete Account */}
              <DeleteAccountForm userId={userId!} onDelete={() => { setSettingsOpen(false); handleLogout(); }} />
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
            <ResumeForm userId={userId} onUploadSuccess={handleResumeChange} refreshKey={refreshKey} />
          </div>
          {/* Steps/Features List */}
          <div className="bg-gradient-to-r from-blue-50/60 to-purple-50/60 rounded-2xl border border-gray-100 p-6 md:p-8 w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How Ressumate Works</h3>
            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">1</span>
                <div>
                  <div className="font-medium text-gray-900">Upload Your Resume</div>
                  <div className="text-sm text-gray-600">PDF or Word format. We parse and analyze it for you.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600">2</span>
                <div>
                  <div className="font-medium text-gray-900">Test Your AI Assistant</div>
                  <div className="text-sm text-gray-600">Ask questions and see how recruiters will interact with your resume.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600">3</span>
                <div>
                  <div className="font-medium text-gray-900">Share Public Link</div>
                  <div className="text-sm text-gray-600">Send a unique link to recruiters and track engagement.</div>
                </div>
              </li>
            </ol>
          </div>
        </div>
        {/* Right Column: Recent Uploads */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 w-full">
          <ResumeList userId={userId} refreshKey={refreshKey} onResumeChange={handleResumeChange} />
        </div>
      </div>
    </div>
  );
}

function ResetPasswordForm({ userId, onClose }: { userId: string, onClose: () => void }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Password updated successfully.');
        setNewPassword('');
        setConfirm('');
        setTimeout(onClose, 1500);
      } else {
        setError(data.error || 'Failed to reset password.');
      }
    } catch {
      setError('Failed to reset password.');
    } finally {
      setLoading(false);
    }
  }, [userId, newPassword, confirm, onClose]);

  return (
    <form onSubmit={handleReset} className="space-y-3">
      <h3 className="font-medium text-gray-900 mb-1">Reset Password</h3>
      <input
        type="password"
        className="w-full border rounded px-3 py-2 text-gray-900"
        placeholder="New password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        minLength={6}
        required
      />
      <input
        type="password"
        className="w-full border rounded px-3 py-2 text-gray-900"
        placeholder="Confirm new password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        minLength={6}
        required
      />
      <Button type="submit" variant="outline" className="w-full" disabled={loading}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </Button>
      {message && <div className="text-green-600 text-sm mt-1">{message}</div>}
      {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
    </form>
  );
}

function DeleteAccountForm({ userId, onDelete }: { userId: string, onDelete: () => void }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDelete = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(onDelete, 1500);
      } else {
        setError(data.error || 'Failed to delete account.');
      }
    } catch {
      setError('Failed to delete account.');
    } finally {
      setLoading(false);
    }
  }, [userId, password, onDelete]);

  if (success) {
    return <div className="text-green-600 text-center">Account deleted. Logging out...</div>;
  }

  return (
    <form onSubmit={handleDelete} className="space-y-3">
      <h3 className="font-medium text-red-700 mb-1">Delete Account</h3>
      {!confirm ? (
        <Button type="button" variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-50" onClick={() => setConfirm(true)}>
          Delete Account
        </Button>
      ) : (
        <>
          <input
            type="password"
            className="w-full border rounded px-3 py-2 text-gray-900"
            placeholder="Enter your password to confirm"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-50" disabled={loading}>
            {loading ? 'Deleting...' : 'Confirm Delete'}
          </Button>
        </>
      )}
      {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
    </form>
  );
} 