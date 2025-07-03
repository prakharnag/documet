'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, MessageSquare, Download, X } from 'lucide-react';

interface QAAnswer {
  summary?: string;
  question?: string;
  relevantSections?: string[];
  candidateName?: string;
  error?: string;
}

interface Resume {
  id: string;
  slug: string;
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

export default function TestPage() {
  const [userId, setUserId] = useState('');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumeId, setResumeId] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<QAAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResumeSelector, setShowResumeSelector] = useState(true);

  const fetchResumes = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/resumes/list?userId=${userId}`);
      const data = await response.json();
      setResumes(data.resumes || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const testQA = async (selectedQuestion?: string) => {
    const questionToAsk = selectedQuestion || question;
    if (!resumeId || !questionToAsk) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId, question: questionToAsk })
      });
      
      const data = await response.json();
      setAnswer(data);
      if (!selectedQuestion) {
        setQuestion('');
      }
    } catch (error) {
      console.error('Error testing Q&A:', error);
      setAnswer({ error: 'Failed to get answer' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    testQA();
  };

  if (showResumeSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-8">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-100 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Test Your AI Resume Assistant</h1>
                <p className="text-sm text-gray-600">Select a resume to test the Q&A functionality</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Get Resume ID</h2>
              <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Enter your user ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                />
                <Button onClick={fetchResumes}>Fetch Resumes</Button>
              </div>
            </div>
            
            {resumes.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Your Resumes:</h3>
                {resumes.map((resume: Resume) => (
                  <div key={resume.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">ID: {resume.id}</p>
                        <p className="text-sm text-gray-600">Slug: {resume.slug}</p>
                        <p className="text-sm text-gray-600">Created: {new Date(resume.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Button 
                        onClick={() => {
                          setResumeId(resume.id);
                          setShowResumeSelector(false);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Test This Resume
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-8">
      <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col min-h-[700px]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-100 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI Resume Assistant Tester</h1>
              <p className="text-sm text-gray-600">Test your AI assistant with different questions</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowResumeSelector(true)}
              className="border-gray-300 hover:bg-gray-50"
            >
              Change Resume
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="border-gray-300 hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
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
                  onClick={() => testQA(question)}
                  disabled={loading}
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
              {!answer && (
                <div className="text-center text-gray-600 py-8">
                  <p className="text-lg font-medium">Select a question from the left or type your own to test the AI assistant.</p>
                </div>
              )}
              
              {answer && (
                <div className="space-y-4">
                  {answer.error ? (
                    <div className="flex justify-start mb-4">
                      <div className="bg-red-50 border border-red-200 px-5 py-3 rounded-2xl shadow-sm text-base font-medium text-red-800">
                        Error: {answer.error}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-end mb-4">
                        <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-sm text-base font-medium rounded-br-none max-w-xs lg:max-w-md">
                          {answer.question}
                        </div>
                      </div>
                      
                      <div className="flex justify-start mb-4">
                        <div className="bg-white border border-gray-300 px-5 py-3 rounded-2xl shadow-sm text-base font-medium text-gray-900 rounded-bl-none max-w-xs lg:max-w-md">
                          {answer.summary}
                        </div>
                      </div>
                      
                      {answer.relevantSections && answer.relevantSections.length > 0 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h3 className="font-medium text-gray-900 mb-2">Relevant Sections:</h3>
                          <ul className="list-disc list-inside text-gray-700 text-sm">
                            {answer.relevantSections.map((section: string, index: number) => (
                              <li key={index}>{section}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              
              {loading && (
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
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your question here..."
                  disabled={loading}
                  className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                />
                <Button type="submit" disabled={loading || !question.trim()}>
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