'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, User, CheckCircle, AlertCircle } from 'lucide-react';

interface WaitlistFormProps {
  className?: string;
  showName?: boolean;
  buttonText?: string;
  placeholder?: string;
}

export default function WaitlistForm({ 
  className = '', 
  showName = false, 
  buttonText = 'Join Waitlist',
  placeholder = 'Enter your email'
}: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState('');
  const [userTypeOther, setUserTypeOther] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }
    if (!userType) {
      setStatus('error');
      setMessage('Please select what type of user you are');
      return;
    }
    if (userType === 'other' && !userTypeOther.trim()) {
      setStatus('error');
      setMessage('Please specify your user type');
      return;
    }

    setIsLoading(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          source: 'landing_page',
          userType,
          userTypeOther: userType === 'other' ? userTypeOther.trim() : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Successfully joined the waitlist!');
        setEmail('');
        setName('');
        setUserType('');
        setUserTypeOther('');
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 3000);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-xl border border-orange-200 p-6 sm:p-8 ${className}`}> 
      <form onSubmit={handleSubmit} className="space-y-5">
        {showName && (
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5" />
            <input
              name="name"
              id="waitlist-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full pl-10 pr-4 py-3 border border-orange-200 rounded-xl bg-white/80 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all text-stone-800"
              disabled={isLoading}
            />
          </div>
        )}
        
        {/* User Type Select */}
        <div>
          <label htmlFor="userType" className="block text-sm font-medium text-orange-700 mb-1">I am a...</label>
          <select
            name="userType"
            id="userType"
            value={userType}
            onChange={e => setUserType(e.target.value)}
            className="w-full px-3 py-3 border border-orange-200 rounded-xl bg-white/80 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all text-stone-800"
            disabled={isLoading}
            required
          >
            <option value="">Select...</option>
            <option value="student">Student / Researcher</option>
            <option value="developer">Developer</option>
            <option value="other">Other</option>
          </select>
        </div>
        {userType === 'other' && (
          <div>
            <input
              name="userTypeOther"
              id="userTypeOther"
              type="text"
              value={userTypeOther}
              onChange={e => setUserTypeOther(e.target.value)}
              placeholder="Please specify your category"
              className="w-full px-3 py-3 border border-orange-200 rounded-xl bg-white/80 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all text-stone-800"
              disabled={isLoading}
              required
            />
          </div>
        )}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5" />
          <input
            name="email"
            id="waitlist-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-3 border border-orange-200 rounded-xl bg-white/80 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all text-stone-800"
            disabled={isLoading}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-6 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-semibold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-base"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Joining...
            </div>
          ) : (
            buttonText
          )}
        </Button>

        {/* Status Messages */}
        {status === 'success' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 text-sm">{message}</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 text-sm">{message}</span>
          </div>
        )}
      </form>
    </div>
  );
} 