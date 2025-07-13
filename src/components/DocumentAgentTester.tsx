'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { Button } from '@/components/ui/button';
import { Bot, Send, Share, Mic, MicOff, Volume2, Sparkles, Download } from 'lucide-react';
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

// Helper functions for localStorage caching
const getCachedSummary = (docId: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(`summary_${docId}`);
  } catch (error) {
    console.error('Error reading cached summary:', error);
    return null;
  }
};

const getCachedQuestions = (docId: string): string[] | null => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(`topQuestions_${docId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error reading cached questions:', error);
    return null;
  }
};

const getCachedDocumentData = (docId: string): {s3Url?: string; DocumentText?: string} | null => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(`documentData_${docId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error reading cached document data:', error);
    return null;
  }
};

const setCachedSummary = (docId: string, summary: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`summary_${docId}`, summary);
  } catch (error) {
    console.error('Error caching summary:', error);
  }
};

const setCachedQuestions = (docId: string, questions: string[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`topQuestions_${docId}`, JSON.stringify(questions));
  } catch (error) {
    console.error('Error caching questions:', error);
  }
};

const setCachedDocumentData = (docId: string, data: {s3Url?: string; DocumentText?: string}): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`documentData_${docId}`, JSON.stringify(data));
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
        className="flex items-center gap-2"
      >
        <Bot className="w-4 h-4" />
        Use Assistant
      </Button>
    );
  }

  // If showInitialSummary is true, use a non-modal layout (for public pages)
  if (showInitialSummary && defaultOpen) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-100">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={resetChat}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Clear Chat
            </Button>
            <VoiceChat DocumentId={DocumentId} DocumentTitle={DocumentTitle} userId={user?.id} />
            <Button
              onClick={() => setShareModalOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Share className="w-4 h-4" />
              Share
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>

        {/* Initial Summary and Top Questions */}
        <div className="flex-1 p-6 overflow-y-auto">
          {summaryLoading ? (
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          ) : initialSummary ? (
            <div className="space-y-6">
              {/* Document Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Document Summary</h3>
                <p className="text-blue-800 text-sm leading-relaxed">{initialSummary}</p>
              </div>

              {/* Top 3 Questions */}
              {topQuestions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Top Questions</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    {topQuestions.map((question, index) => (
                      <li key={index}>
                        <button
                          type="button"
                          onClick={() => handleSampleQuestion(question)}
                          disabled={isLoading}
                          className="text-blue-700 underline hover:text-blue-900 focus:outline-none focus:underline bg-transparent p-0 border-0 text-left cursor-pointer disabled:text-gray-400"
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
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Conversation</h3>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-sm ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
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
                  <div className="bg-gray-100 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-gray-700 text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-600 py-8">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">
                {welcomeMessage?.title || "AI Document Assistant"}
              </p>
              <p className="text-sm">
                {welcomeMessage?.subtitle || "Ask any question you have about this document"}
              </p>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask a question about this document..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isLoading}
            />
            <Button
              type="button"
              onClick={startVoiceInput}
              disabled={isLoading || isListening}
              size="sm"
              className={`px-3 ${isListening ? 'bg-red-500 hover:bg-red-600' : ''}`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            {isSpeaking && (
              <Button
                type="button"
                onClick={stopSpeaking}
                size="sm"
                className="px-3 bg-orange-500 hover:bg-orange-600"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || !inputQuestion.trim()}
              size="sm"
              className="px-4"
            >
              <Send className="w-4 h-4" />
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

  // Original modal layout for dashboard
  return (
    <>
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-50">
      <div className="w-full h-full bg-white rounded-none shadow-none border-none flex">
        {/* Left Side - Document Preview */}
        <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{DocumentTitle}</h1>
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              {currentDocumentData?.s3Url ? (
                <DocumentPreview documentId={DocumentId} fileName={DocumentTitle} s3Url={currentDocumentData.s3Url} />
              ) : currentDocumentData?.DocumentText ? (
                <div className="p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                    {currentDocumentData.DocumentText}
                  </pre>
                </div>
              ) : (
                <div className="p-4">
                  <div className="text-center text-gray-500 py-8">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Document Preview</p>
                    <p className="text-sm">Document content will be displayed here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Chatbot Interface */}
        <div className="w-1/2 bg-white flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-100">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetChat}
                className="border-gray-300 hover:bg-gray-50 text-xs"
              >
                Clear Chat
              </Button>
              <VoiceChat DocumentId={DocumentId} DocumentTitle={DocumentTitle} userId={user?.id} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShareModalOpen(true)}
                className="border-gray-300 hover:bg-gray-50 flex items-center gap-1"
              >
                <Share className="w-3 h-3" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="border-gray-300 hover:bg-gray-50"
              >
                ✕
              </Button>
            </div>
          </div>

          {/* Main Content - Summary and Questions */}
          <div className="flex-1 p-6 overflow-y-auto">
            {summaryLoading ? (
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            ) : initialSummary ? (
              <div className="space-y-6">
                {/* Document Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Document Summary</h3>
                  <p className="text-blue-800 text-sm leading-relaxed">{initialSummary}</p>
                </div>

                {/* Top 3 Questions */}
                {topQuestions.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Top Questions</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      {topQuestions.map((question, index) => (
                        <li key={index}>
                          <button
                            type="button"
                            onClick={() => handleSampleQuestion(question)}
                            disabled={isLoading}
                            className="text-blue-700 underline hover:text-blue-900 focus:outline-none focus:underline bg-transparent p-0 border-0 text-left cursor-pointer disabled:text-gray-400"
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
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Conversation</h3>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-sm ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
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
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-gray-700 text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-600 py-8">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">
                  {welcomeMessage?.title || "Test Your AI Document Assistant"}
                </p>
                <p className="text-sm">
                  {welcomeMessage?.subtitle || "Ask questions about your Document to see how Anyone will experience it."}
                </p>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder="Ask a question about this document..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={isLoading}
              />
              <Button
                type="button"
                onClick={startVoiceInput}
                disabled={isLoading || isListening}
                size="sm"
                className={`px-3 ${isListening ? 'bg-red-500 hover:bg-red-600' : ''}`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              {isSpeaking && (
                <Button
                  type="button"
                  onClick={stopSpeaking}
                  size="sm"
                  className="px-3 bg-orange-500 hover:bg-orange-600"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading || !inputQuestion.trim()}
                size="sm"
                className="px-4"
              >
                <Send className="w-4 h-4" />
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