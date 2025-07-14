'use client';

import { useState, useEffect } from 'react';
import { User, Lock, Trash2, Save, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SettingsModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onDisplayNameUpdate?: (displayName: string) => void;
}

export default function SettingsModal({ user, isOpen, onClose, onLogout, onDisplayNameUpdate }: SettingsModalProps) {
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [displayName, setDisplayName] = useState('');

  // Initialize display name from localStorage or Stack user
  useEffect(() => {
    if (user?.id) {
      const savedDisplayName = localStorage.getItem(`displayName_${user.id}`);
      setDisplayName(savedDisplayName || user?.displayName || '');
    } else {
      setDisplayName(user?.displayName || '');
    }
  }, [user?.id, user?.displayName]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateProfile', displayName }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        // Update the local display name in the dashboard
        if (onDisplayNameUpdate) {
          onDisplayNameUpdate(displayName.trim());
        }
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setPasswordLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updatePassword', password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setPassword('');
        setConfirmPassword('');
        // Redirect to Stack sign-in for password change
        if (data.redirectTo) {
          setTimeout(() => {
            window.location.href = data.redirectTo;
          }, 2000);
        }
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update password' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings', { method: 'DELETE' });
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        // Redirect to sign-out after deleting documents
        if (data.redirectTo) {
          setTimeout(() => {
            window.location.href = data.redirectTo;
          }, 2000);
        } else {
          setTimeout(() => onLogout(), 1500);
        }
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete account' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-orange-100 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-stone-800">Account Settings</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-orange-300 hover:bg-orange-50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Profile Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-stone-800">
              <User className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold">Profile Information</h3>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.primaryEmail || ''}
                  disabled
                  className="w-full px-3 py-2 border border-orange-300 rounded-lg bg-orange-50 text-stone-500 cursor-not-allowed"
                />
                <p className="text-xs text-stone-500 mt-1">Email cannot be changed</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs text-orange-800">
                  Display name will be saved locally and shown on your dashboard.
                </p>
              </div>
              <Button
                type="submit"
                disabled={profileLoading}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {profileLoading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </div>

          {/* Password Section */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-2 text-stone-800">
              <Lock className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold">Change Password</h3>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-orange-800">
                Password changes are handled through Stack authentication. You'll be redirected to the secure sign-in page.
              </p>
            </div>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  minLength={6}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={passwordLoading}
                className="w-full"
              >
                <Lock className="w-4 h-4 mr-2" />
                {passwordLoading ? 'Redirecting...' : 'Change Password'}
              </Button>
            </form>
          </div>

          {/* Delete Account Section */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              <h3 className="font-semibold">Delete Account</h3>
            </div>
            <p className="text-sm text-stone-600">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            
            {!showDeleteConfirm ? (
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
                  <p className="text-sm font-medium">Are you sure?</p>
                  <p className="text-sm">This action cannot be undone.</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    className="flex-1 border-orange-300 hover:bg-orange-50"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 