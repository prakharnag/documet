'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check, MessageSquare, Link } from 'lucide-react';

interface ShareModalProps {
  DocumentId: string;
  DocumentTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ShareData {
  shareableLink: string;
  personalizedMessage: string;
  candidateName: string;
  candidateEmail: string;
}

export default function ShareModal({ DocumentId, DocumentTitle, isOpen, onClose }: ShareModalProps) {
  const [customMessage, setCustomMessage] = useState('');
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);

  const generateShareLink = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/Documents/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          DocumentId, 
          customMessage: customMessage.trim() || undefined 
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setShareData(data);
      } else {
        alert(data.error || 'Failed to generate share link');
      }
    } catch (error) {
      console.error('Error generating share link:', error);
      alert('Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'link' | 'message') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setMessageCopied(true);
      setTimeout(() => setMessageCopied(false), 2000);
    }
  };

  const copyFullMessage = () => {
    if (!shareData) return;
    
    // Only copy the personalized message, not the link
    copyToClipboard(shareData.personalizedMessage, 'message');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[100vh] overflow-y-auto border border-orange-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orange-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-800">Share Your AI Document</h3>
              <p className="text-sm text-stone-500">{DocumentTitle}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-stone-500 hover:text-stone-700 hover:bg-orange-100"
          >
            ✕
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Public Access Warning */}
          <div className="mb-4 p-4 bg-amber-100 border-l-4 border-amber-400 text-amber-800 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-amber-900 mb-1">Public Access Warning</h4>
                <p className="text-sm text-amber-800">
                  This link will be publicly accessible. Anyone with the link can access the AI assistant for this document. Please share responsibly and only with intended recipients.
                </p>
              </div>
            </div>
          </div>

          {!shareData ? (
            /* Generate Link Section */
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-stone-800 mb-2">
                  Personalize Your Message (Optional)
                </h4>
                <p className="text-sm text-stone-600 mb-3">
                  Add a custom message that will be included with your shareable link. 
                  If left empty, we'll use a default friendly message.
                </p>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Hi! I'd love to share my AI-powered Document with you. You can ask me any questions from the document, and I'll respond just like we're having a real conversation. Feel free to explore!"
                  className="w-full p-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-stone-900 resize-none"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-stone-500 mt-1">
                  {customMessage.length}/500 characters
                </p>
              </div>

              <Button
                onClick={generateShareLink}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Link...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Generate Shareable Link
                  </div>
                )}
              </Button>
            </div>
          ) : (
            /* Share Results Section */
            <div className="space-y-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-5 h-5 text-orange-600" />
                  <h4 className="font-medium text-orange-900">
                    Shareable Link Generated!
                  </h4>
                </div>
                <p className="text-sm text-orange-700">
                  Your AI Document assistant is now ready to share with Anyone.
                </p>
              </div>

              {/* Shareable Link */}
              <div>
                <h4 className="font-medium text-stone-800 mb-2 flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Shareable Link
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareData.shareableLink}
                    readOnly
                    className="flex-1 p-3 border border-orange-300 rounded-lg bg-orange-50 text-stone-900 text-sm"
                  />
                  <Button
                    onClick={() => copyToClipboard(shareData.shareableLink, 'link')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-orange-300 hover:bg-orange-50"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>

              {/* Personalized Message */}
              <div>
                <h4 className="font-medium text-stone-800 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Personalized Message
                </h4>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <p className="text-sm text-stone-700 mb-3">
                    {shareData.personalizedMessage}
                  </p>
                  <Button
                    onClick={copyFullMessage}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-orange-300 hover:bg-orange-50"
                  >
                    {messageCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {messageCopied ? 'Copied!' : 'Copy Message'}
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-900 mb-2">
                  How to Share
                </h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Copy the link and send it directly to Anyone</li>
                  <li>• Or copy the full message + link for a complete introduction</li>
                  <li>• Anyone can ask questions and download your Document</li>
                  <li>• Your AI assistant will respond conversationally as you</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShareData(null);
                    setCustomMessage('');
                  }}
                  variant="outline"
                  className="flex-1 border-orange-300 hover:bg-orange-50"
                >
                  Generate Another Link
                </Button>
                <Button
                  onClick={onClose}
                  className="flex-1"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 