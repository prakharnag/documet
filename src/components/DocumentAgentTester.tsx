'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { Button } from '@/components/ui/button';
import { Bot, Send, Share, Mic, MicOff, Volume2, Sparkles, Download, X, FileText, MessageSquare, RotateCcw } from 'lucide-react';
import DocumentPreview from './DocumentPreview';
import ShareModal from './ShareModal';
import VoiceChat from './VoiceChat';
import Logo from '@/components/ui/logo';

interface DocumentAgentTesterProps {
  DocumentId: string;
  DocumentTitle: string;
  defaultOpen?: boolean;
  welcomeMessage?: {
    title: string;
    subtitle: string;
  };
  showInitialSummary?: boolean;
  documentData?: {
    s3Url?: string;
    DocumentText?: string;
  };
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const defaultQuestions = [
  "What is the main topic of this document?",
  "Can you summarize the key points?",
  "What are the important details mentioned?",
  "Are there any specific requirements or guidelines?",
  "What conclusions or recommendations are made?",
  "Who is the target audience for this document?",
  "What actions or next steps are suggested?",
  "Are there any dates or deadlines mentioned?",
  "What are the main sections or categories?",
  "Are there any important warnings or notes?"
];

// Helper functions for sessionStorage caching
const getCachedSummary = (docId: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(`summary_${docId}`);
  } catch (error) {
    console.error('Error reading cached summary:', error);
    return null;
  }
};

const getCachedQuestions = (docId: string): string[] | null => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = sessionStorage.getItem(`topQuestions_${docId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error reading cached questions:', error);
    return null;
  }
};

const getCachedDocumentData = (docId: string): {s3Url?: string; DocumentText?: string} | null => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = sessionStorage.getItem(`documentData_${docId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error reading cached document data:', error);
    return null;
  }
};

const setCachedSummary = (docId: string, summary: string): void => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(`summary_${docId}`, summary);
  } catch (error) {
    console.error('Error caching summary:', error);
  }
};

const setCachedQuestions = (docId: string, questions: string[]): void => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(`topQuestions_${docId}`, JSON.stringify(questions));
  } catch (error) {
    console.error('Error caching questions:', error);
  }
};

const setCachedDocumentData = (docId: string, data: {s3Url?: string; DocumentText?: string}): void => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(`documentData_${docId}`, JSON.stringify(data));
  } catch (error) {
    console.error('Error caching document data:', error);
  }
};

export default function DocumentAgentTester({ DocumentId, DocumentTitle, defaultOpen = false, welcomeMessage, showInitialSummary, documentData }: DocumentAgentTesterProps) {
  const user = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [initialSummary, setInitialSummary] = useState<string>('');
  const [topQuestions, setTopQuestions] = useState<string[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [fetchedDocumentData, setFetchedDocumentData] = useState<{s3Url?: string; DocumentText?: string} | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);

  const resetChat = () => {
    setMessages([]);
    setInputQuestion('');
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputQuestion(transcript);
      askQuestion(transcript);
    };
    
    recognition.onerror = () => {
      setIsListening(false);
      alert('Voice recognition error');
    };
    
    recognition.start();
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const addMessage = (type: 'user' | 'ai', content: string) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const askQuestion = async (question: string) => {
    if (!question.trim()) return;
    
    // Validate DocumentId before making the request
    if (!DocumentId || DocumentId.trim() === '') {
      addMessage('ai', 'Error: Document ID is missing. Please try again.');
      return;
    }

    setIsLoading(true);
    addMessage('user', question);

    try {
      const response = await fetch('/api/Documents/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ DocumentId: DocumentId.trim(), question })
      });

      const data = await response.json();

      if (data.error) {
        addMessage('ai', `Error: ${data.error}`);
      } else {
        addMessage('ai', data.summary);
        // No voice response for text input
      }
    } catch (error) {
      console.error('Error asking question:', error);
      addMessage('ai', 'Sorry, I encountered an error while processing your question.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && inputQuestion.trim()) {
      askQuestion(inputQuestion);
      setInputQuestion('');
    }
  };

  const handleSampleQuestion = (question: string) => {
    setInputQuestion(question);
    askQuestion(question);
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(`/api/Documents/download/${DocumentId}`);
      const data = await res.json();
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      } else {
        alert(data.error || 'Failed to get download link');
      }
    } catch (err) {
      alert('Failed to download document');
    }
  };

  const fetchQuestions = async () => {
    // Validate DocumentId before making the request
    if (!DocumentId || DocumentId.trim() === '') {
      console.warn('DocumentId is empty, skipping questions fetch');
      return;
    }

    // Check cache first
    const cachedQuestions = getCachedQuestions(DocumentId);
    if (cachedQuestions && cachedQuestions.length > 0) {
      setTopQuestions(cachedQuestions);
      return;
    }

    try {
      const response = await fetch('/api/Documents/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ DocumentId: DocumentId.trim() })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Questions API error:', errorData.error);
        return;
      }
      
      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setTopQuestions(data.questions);
        setCachedQuestions(DocumentId, data.questions);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      // Keep default questions if AI generation fails
    }
  };

  const fetchDocumentData = async () => {
    const cachedData = getCachedDocumentData(DocumentId);
    if (cachedData) {
      setFetchedDocumentData(cachedData);
      return;
    }

    try {
      // Fetch document details directly using the DocumentId
      const detailResponse = await fetch(`/api/Documents/public/${DocumentId}`);
      const detailData = await detailResponse.json();
      if (detailData) {
        setFetchedDocumentData({
          s3Url: detailData.s3Url,
          DocumentText: detailData.DocumentText
        });
        setCachedDocumentData(DocumentId, detailData);
      }
    } catch (error) {
      console.error('Error fetching document data:', error);
    }
  };

  const generateInitialSummary = async () => {
    // Validate DocumentId before making the request
    if (!DocumentId || DocumentId.trim() === '') {
      console.warn('DocumentId is empty, skipping summary generation');
      setSummaryLoading(false);
      return;
    }

    setSummaryLoading(true);
    try {
      const response = await fetch('/api/Documents/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ DocumentId: DocumentId.trim() })
      });
      
      const data = await response.json();
      if (data.summary) {
        setInitialSummary(data.summary);
        setCachedSummary(DocumentId, data.summary);
      }
      if (data.questions && data.questions.length > 0) {
        setTopQuestions(data.questions);
        setCachedQuestions(DocumentId, data.questions);
      } else {
        // Fallback to default questions if API doesn't return any
        const fallbackQuestions = defaultQuestions.slice(0, 3);
        setTopQuestions(fallbackQuestions);
        setCachedQuestions(DocumentId, fallbackQuestions);
      }
    } catch (error) {
      console.error('Error generating initial summary:', error);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      resetChat(); // Clear previous messages when opening
      
      // Always fetch the latest document data from the API when opening
      fetchDocumentData();
      
      fetchQuestions();
      if (showInitialSummary) {
        // Try to load from cache first
        const cachedSummary = getCachedSummary(DocumentId);
        if (cachedSummary) {
          setInitialSummary(cachedSummary);
        }
        // Only fetch from API if we don't have cached data
        if (!cachedSummary) {
          generateInitialSummary();
        }
      }
    }
  }, [isOpen, showInitialSummary, documentData]);

  // Always prefer the latest documentData prop (from parent/dashboard) if present
  const currentDocumentData = documentData && (documentData.s3Url || documentData.DocumentText)
    ? documentData
    : fetchedDocumentData;

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 text-xs sm:text-sm"
      >
        <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
        Use Assistant
      </Button>
    );
  }

  // If showInitialSummary is true, use a non-modal layout (for public pages)
  if (showInitialSummary && defaultOpen) {
    return (
      <div className="h-full flex flex-col bg-orange-50/20">
        {/* Header */}
        <div className="flex justify-between items-center px-3 sm:px-6 py-3 sm:py-4 border-b border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center gap-2 sm:gap-3">
            <Logo size="sm" />
          </div>
          <div className="flex gap-1 sm:gap-2">
            <Button
              onClick={resetChat}
              variant="outline"
              size="sm"
              className="text-xs px-2 sm:px-3"
            >
              Clear
            </Button>
            <VoiceChat DocumentId={DocumentId} DocumentTitle={DocumentTitle} userId={user?.id} />
            <Button
              onClick={() => setShareModalOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 px-2 sm:px-3"
            >
              <Share className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 px-2 sm:px-3"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
        </div>

        {/* Initial Summary and Top Questions */}
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
          {summaryLoading ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="h-3 sm:h-4 bg-orange-200 rounded animate-pulse"></div>
              <div className="h-3 sm:h-4 bg-orange-200 rounded animate-pulse w-3/4"></div>
              <div className="h-3 sm:h-4 bg-orange-200 rounded animate-pulse w-1/2"></div>
            </div>
          ) : initialSummary ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Document Summary */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-orange-900 mb-2 text-sm sm:text-base">Document Summary</h3>
                <p className="text-orange-800 text-xs sm:text-sm leading-relaxed">{initialSummary}</p>
              </div>

              {/* Top 3 Questions */}
              {topQuestions.length > 0 && (
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="font-semibold text-stone-800 text-sm sm:text-base">Top Questions</h3>
                  <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                    {topQuestions.slice(0, 3).map((question, index) => (
                      <li key={index}>
                        <button
                          type="button"
                          onClick={() => handleSampleQuestion(question)}
                          disabled={isLoading}
                          className="text-orange-700 underline hover:text-orange-900 focus:outline-none focus:underline bg-transparent p-0 border-0 text-left cursor-pointer disabled:text-stone-400 text-xs sm:text-sm"
                        >
                          {question}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Chat Messages */}
              {messages.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-semibold text-stone-800 text-sm sm:text-base">Conversation</h3>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm ${
                          message.type === 'user'
                            ? 'bg-orange-600 text-white'
                            : 'bg-orange-50 text-stone-800'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-orange-50 px-3 sm:px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-orange-600"></div>
                      <span className="text-stone-700 text-xs sm:text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-stone-600 py-6 sm:py-8">
              <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-orange-300" />
              <p className="text-base sm:text-lg font-medium mb-2">
                {welcomeMessage?.title || "AI Document Assistant"}
              </p>
              <p className="text-xs sm:text-sm">
                {welcomeMessage?.subtitle || "Ask any question you have about this document"}
              </p>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-orange-200 bg-orange-50/30">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask a question about this document..."
              className="flex-1 px-2 sm:px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs sm:text-sm"
              disabled={isLoading}
            />
            <Button
              type="button"
              onClick={startVoiceInput}
              disabled={isLoading || isListening}
              size="sm"
              className={`px-2 sm:px-3 ${isListening ? 'bg-red-500 hover:bg-red-600' : ''}`}
            >
              {isListening ? <MicOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Mic className="w-3 h-3 sm:w-4 sm:h-4" />}
            </Button>
            {isSpeaking && (
              <Button
                type="button"
                onClick={stopSpeaking}
                size="sm"
                className="px-2 sm:px-3 bg-orange-500 hover:bg-orange-600"
              >
                <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || !inputQuestion.trim()}
              size="sm"
              className="px-3 sm:px-4"
            >
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </form>
        
        {/* Share Modal */}
        <ShareModal
          DocumentId={DocumentId}
          DocumentTitle={DocumentTitle}
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
        />
      </div>
    );
  }

  // Original modal layout for dashboard - Mobile responsive
  return (
    <>
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-50">
      <div className="w-full h-full bg-white rounded-none shadow-none border-none flex flex-col lg:flex-row">
        {/* Mobile Header - Only show on mobile */}
        <div className="lg:hidden flex justify-between items-center px-4 py-3 border-b border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Logo size="sm" />
            <h1 className="text-sm font-semibold text-stone-800 truncate flex-1">{DocumentTitle}</h1>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDocumentPreview(!showDocumentPreview)}
              className="border-orange-300 hover:bg-orange-50 text-xs px-2 w-8 h-8"
              title={showDocumentPreview ? "Show Chat" : "Show Document"}
            >
              {showDocumentPreview ? <MessageSquare className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
            </Button>
            <VoiceChat DocumentId={DocumentId} DocumentTitle={DocumentTitle} userId={user?.id} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareModalOpen(true)}
              className="border-orange-300 hover:bg-orange-50 text-xs px-2 w-8 h-8"
              title="Share"
            >
              <Share className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetChat}
              className="border-orange-300 hover:bg-orange-50 text-xs px-2 w-8 h-8"
              title="Clear Chat"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="border-orange-300 hover:bg-orange-50 px-2 w-8 h-8"
              title="Close"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Mobile Document Preview - Toggle on mobile */}
        {showDocumentPreview && (
          <div className="lg:hidden bg-orange-50/20 border-b border-orange-200 overflow-y-auto" style={{ height: '40vh' }}>
            <div className="p-3 sm:p-4">
              <h2 className="text-sm sm:text-base font-semibold text-stone-800 mb-2 sm:mb-3">Document Preview</h2>
              <div className="bg-white rounded-lg border border-orange-200 overflow-hidden">
                {currentDocumentData?.s3Url ? (
                  <DocumentPreview documentId={DocumentId} fileName={DocumentTitle} s3Url={currentDocumentData.s3Url} />
                ) : currentDocumentData?.DocumentText ? (
                  <div className="p-2 sm:p-3 max-h-32 sm:max-h-40 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-xs sm:text-sm text-stone-700 font-mono leading-relaxed">
                      {currentDocumentData.DocumentText}
                    </pre>
                  </div>
                ) : (
                  <div className="p-3 sm:p-4">
                    <div className="text-center text-stone-500 py-4 sm:py-6">
                      <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 text-orange-300" />
                      <p className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">Document Preview</p>
                      <p className="text-xs">Document content will be displayed here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Left Side - Document Preview (Desktop) */}
        <div className="hidden lg:block lg:w-1/2 bg-orange-50/20 border-r border-orange-200 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-800 mb-3 sm:mb-4">{DocumentTitle}</h1>
            <div className="bg-white rounded-lg border border-orange-200 overflow-hidden">
              {currentDocumentData?.s3Url ? (
                <DocumentPreview documentId={DocumentId} fileName={DocumentTitle} s3Url={currentDocumentData.s3Url} />
              ) : currentDocumentData?.DocumentText ? (
                <div className="p-3 sm:p-4">
                  <pre className="whitespace-pre-wrap text-xs sm:text-sm text-stone-700 font-mono leading-relaxed">
                    {currentDocumentData.DocumentText}
                  </pre>
                </div>
              ) : (
                <div className="p-3 sm:p-4">
                  <div className="text-center text-stone-500 py-6 sm:py-8">
                    <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-orange-300" />
                    <p className="text-sm sm:text-lg font-medium mb-2">Document Preview</p>
                    <p className="text-xs sm:text-sm">Document content will be displayed here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Chatbot Interface */}
        <div className="flex-1 lg:w-1/2 bg-orange-50/20 flex flex-col">
          {/* Desktop Header - Only show on desktop */}
          <div className="hidden lg:flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="flex items-center gap-2 sm:gap-3">
              <Logo size="sm" />
            </div>
            <div className="flex gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetChat}
                className="border-orange-300 hover:bg-orange-50 text-xs px-2 sm:px-3"
              >
                Clear Chat
              </Button>
              <VoiceChat DocumentId={DocumentId} DocumentTitle={DocumentTitle} userId={user?.id} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShareModalOpen(true)}
                className="border-orange-300 hover:bg-orange-50 flex items-center gap-1 px-2 sm:px-3"
              >
                <Share className="w-3 h-3 sm:w-4 sm:h-4" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="border-orange-300 hover:bg-orange-50 px-2 sm:px-3"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>

          {/* Main Content - Summary and Questions */}
          <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto">
            {summaryLoading ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="h-3 sm:h-4 bg-orange-200 rounded animate-pulse"></div>
                <div className="h-3 sm:h-4 bg-orange-200 rounded animate-pulse w-3/4"></div>
                <div className="h-3 sm:h-4 bg-orange-200 rounded animate-pulse w-1/2"></div>
              </div>
            ) : initialSummary ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Document Summary */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
                  <h3 className="font-semibold text-orange-900 mb-2 text-sm sm:text-base">Document Summary</h3>
                  <p className="text-orange-800 text-xs sm:text-sm leading-relaxed">{initialSummary}</p>
                </div>

                {/* Top 3 Questions */}
                {topQuestions.length > 0 && (
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="font-semibold text-stone-800 text-sm sm:text-base">Top Questions</h3>
                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                      {topQuestions.slice(0, 3).map((question, index) => (
                        <li key={index}>
                          <button
                            type="button"
                            onClick={() => handleSampleQuestion(question)}
                            disabled={isLoading}
                            className="text-orange-700 underline hover:text-orange-900 focus:outline-none focus:underline bg-transparent p-0 border-0 text-left cursor-pointer disabled:text-stone-400 text-xs sm:text-sm"
                          >
                            {question}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Chat Messages */}
                {messages.length > 0 && (
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="font-semibold text-stone-800 text-sm sm:text-base">Conversation</h3>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm ${
                            message.type === 'user'
                              ? 'bg-orange-600 text-white'
                              : 'bg-orange-50 text-stone-800'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-orange-50 px-3 sm:px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-orange-600"></div>
                        <span className="text-stone-700 text-xs sm:text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-stone-600 py-6 sm:py-8">
                <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-orange-300" />
                <p className="text-base sm:text-lg font-medium mb-2">
                  {welcomeMessage?.title || "AI Document Assistant"}
                </p>
                <p className="text-xs sm:text-sm">
                  {welcomeMessage?.subtitle || "Ask any question you have about this document"}
                </p>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-orange-200 bg-orange-50/30">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder="Ask a question about this document..."
                className="flex-1 px-2 sm:px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs sm:text-sm"
                disabled={isLoading}
              />
              <Button
                type="button"
                onClick={startVoiceInput}
                disabled={isLoading || isListening}
                size="sm"
                className={`px-2 sm:px-3 ${isListening ? 'bg-red-500 hover:bg-red-600' : ''}`}
              >
                {isListening ? <MicOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Mic className="w-3 h-3 sm:w-4 sm:h-4" />}
              </Button>
              {isSpeaking && (
                <Button
                  type="button"
                  onClick={stopSpeaking}
                  size="sm"
                  className="px-2 sm:px-3 bg-orange-500 hover:bg-orange-600"
                >
                  <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading || !inputQuestion.trim()}
                size="sm"
                className="px-3 sm:px-4"
              >
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    {/* Share Modal */}
    <ShareModal
      DocumentId={DocumentId}
      DocumentTitle={DocumentTitle}
      isOpen={shareModalOpen}
      onClose={() => setShareModalOpen(false)}
    />
    </>
  );
}