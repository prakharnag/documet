'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const workflowSteps = [
  'Upload your resume',
  'AI creates your interactive assistant',
  'Share with recruiters instantly',
];

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const router = useRouter();

  // Typing animation for workflow steps
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let charIndex = 0;
    setTypedText('');
    function typeChar() {
      if (charIndex < workflowSteps[stepIndex].length) {
        setTypedText((prev) => prev + workflowSteps[stepIndex][charIndex]);
        charIndex++;
        timeout = setTimeout(typeChar, 65);
      } else {
        timeout = setTimeout(() => {
          setStepIndex((prev) => (prev + 1) % workflowSteps.length);
        }, 1800);
      }
    }
    typeChar();
    return () => clearTimeout(timeout);
  }, [stepIndex]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.userId) {
        router.push(`/dashboard?userId=${data.userId}`);
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 bg-white">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center text-gray-900">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div>
              <label htmlFor="email" className="block mb-1 font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                disabled={loading}
                placeholder="Enter your email"
              />
            </div>
            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold text-lg disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>
      </div>
      {/* Right: Animated Workflow */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/40 via-blue-200/20 to-transparent" />
        <div className="z-10 max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">How Ressumate Works</h2>
          <div className="text-lg font-mono min-h-[2.5em] max-w-xs sm:max-w-md mx-auto">
            <span className="border-r-2 border-white pr-1 animate-pulse">{typedText}</span>
          </div>
          <div className="mt-8 flex flex-col gap-4 text-left text-base text-white/80">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>AI-powered resume parsing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span>Instant recruiter Q&A</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              <span>Shareable links for easy access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 