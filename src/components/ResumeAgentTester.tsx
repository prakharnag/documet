'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, Bot, Sparkles } from 'lucide-react';

interface ResumeAgentTesterProps {
  resumeId: string;
  resumeTitle: string;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const sampleQuestions = [
  "What are your technical skills?",
  "Tell me about your work experience",
  "What projects have you worked on?",
  "What is your educational background?",
  "What are your strengths?",
  "Why should we hire you?",
  "What are your career goals?",
  "Describe a challenging project you worked on",
  "What technologies are you most comfortable with?",
  "Tell me about a time you solved a difficult problem"
];

export default function ResumeAgentTester({ resumeId, resumeTitle }: ResumeAgentTesterProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const addMessage = (type: 'user' | 'ai', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const askQuestion = async (question: string) => {
    if (!question.trim()) return;

    setIsLoading(true);
    addMessage('user', question);

    try {
      const response = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId, question })
      });

      const data = await response.json();

      if (data.error) {
        addMessage('ai', `Error: ${data.error}`);
      } else {
        addMessage('ai', data.summary);
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

  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-50">
      <div className="w-full h-full bg-white rounded-none shadow-none border-none flex flex-col min-h-0">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Resume Assistant</h3>
              <p className="text-sm text-gray-500">{resumeTitle}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="border-gray-300 hover:bg-gray-50"
          >
            ✕
          </Button>
        </div>

        <div className="flex-1 flex min-h-0 h-0">
          {/* Left Sidebar - Sample Questions */}
          <div className="w-80 border-r border-gray-200 bg-gray-50 p-6 hidden sm:block h-full overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Questions</h2>
            <div className="space-y-2">
              {sampleQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleSampleQuestion(question)}
                  disabled={isLoading}
                  className="w-full text-left justify-start h-auto py-3 px-4 text-sm text-gray-900 bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>

          {/* Right Side - Chat Interface */}
          <div className="flex-1 flex flex-col min-h-0 h-full">
            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto bg-white min-h-0 h-0">
              {messages.length === 0 ? (
                <div className="text-center text-gray-600 py-8">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Test Your AI Resume Assistant</p>
                  <p className="text-sm">Ask questions about your resume to see how recruiters will experience it.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-5 py-3 rounded-2xl shadow-sm text-base font-medium transition-all duration-200 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-900 rounded-bl-none border border-gray-300 shadow-md'
                      }`}
                    >
                      {message.content}
                      <div className="text-xs opacity-60 mt-1 text-right">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white border border-gray-300 px-4 py-3 rounded-lg shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-gray-700 font-medium">Let me check your resume and get the best answer for you...</span>
                    </div>
                  </div>
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
                  placeholder="Ask a question about your resume..."
                  className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                  disabled={isLoading}
                />
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
    </div>
  );
} 