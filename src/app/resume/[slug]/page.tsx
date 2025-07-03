'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ResumeData {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const predefinedQuestions = [
  "What are the candidate's key technical skills?",
  "What is their work experience?",
  "What are their educational qualifications?",
  "What projects have they worked on?",
  "What are their strengths and achievements?",
  "What is their career objective?",
  "What technologies are they proficient in?",
  "What is their current role and responsibilities?"
];

export default function PublicResumePage({ params }: { params: Promise<{ slug: string }> }) {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingResume, setIsLoadingResume] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/resumes/public/${resolvedParams.slug}`);
        if (!response.ok) {
          throw new Error('Resume not found');
        }
        const data = await response.json();
        setResumeData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load resume');
      } finally {
        setIsLoadingResume(false);
      }
    };

    fetchResume();
  }, [params]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || !resumeData) return;

    const userMessage: Message = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: message,
          resumeId: resumeData.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: data.summary };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const downloadResume = async () => {
    if (!resumeData) return;
    
    try {
      // Open the download URL directly in a new window/tab
      // This will trigger the download with the server's Content-Disposition filename
      window.open(`/api/resumes/${resumeData.id}`, '_blank');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download resume');
    }
  };

  if (isLoadingResume) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error || !resumeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Resume Not Found</h1>
          <p className="text-gray-600">{error || 'The resume you are looking for does not exist.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-8">
      <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col min-h-[700px]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-100 rounded-t-2xl">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">AI Resume Assistant</h1>
            <p className="text-sm text-gray-600">Ask questions about {resumeData.title}</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={downloadResume} className="bg-blue-600 hover:bg-blue-700">
              Download Resume
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="border-gray-300 hover:bg-gray-50"
            >
              Close
            </Button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Left Sidebar - Quick Questions */}
          <div className="w-80 border-r border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Questions</h2>
            <div className="space-y-2">
              {predefinedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => sendMessage(question)}
                  disabled={isLoading}
                  className="w-full text-left justify-start h-auto py-3 px-4 text-sm text-gray-900 bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>

          {/* Right Side - Chat Interface */}
          <div className="flex-1 flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto bg-white">
              {messages.length === 0 && (
                <div className="text-center text-gray-600 py-8">
                  <p className="text-lg font-medium">Ask questions about the candidate's resume to get started.</p>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-5 py-3 rounded-2xl shadow-sm text-base font-medium transition-all duration-200 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-gray-900 rounded-bl-none border border-gray-300 shadow-md'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white border border-gray-300 px-4 py-3 rounded-lg shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-gray-700 font-medium">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your question here..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                />
                <Button type="submit" disabled={isLoading || !inputMessage.trim()}>
                  Send
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 