"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const REASONS = [
  'Too many emails',
  'Not relevant to me',
  'I get my AI news elsewhere',
  'Taking a break',
  'Other',
];

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Pre-fill email from URL parameters (common in unsubscribe links)
  useEffect(() => {
    const emailParam = searchParams?.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  // Check if email is already unsubscribed
  useEffect(() => {
    const checkUnsubscribeStatus = async () => {
      if (!email || !email.includes('@')) return;
      
      setIsChecking(true);
      try {
        const res = await fetch(`/api/user/exists?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        
        if (data.exists && !data.isActive) {
          setSubmitted(true); // Already unsubscribed
        }
      } catch (err) {
        // Silently fail - user can still try to unsubscribe
        console.error('Error checking unsubscribe status:', err);
      } finally {
        setIsChecking(false);
      }
    };

    if (email) {
      checkUnsubscribeStatus();
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    
    if (!reason) {
      setError('Please select a reason for unsubscribing.');
      return;
    }
    
    if (reason === 'Other' && !otherReason.trim()) {
      setError('Please specify your reason.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const finalReason = reason === 'Other' ? otherReason : reason;
      const res = await fetch('/api/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reason: finalReason }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to unsubscribe' }));
        throw new Error(errorData.message || `Server error: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.success) {
        setSubmitted(true);
        // Clear localStorage if user was logged in
        try {
          const storedEmail = localStorage.getItem('subscribedEmail');
          if (storedEmail === email) {
            localStorage.removeItem('subscribedEmail');
            localStorage.removeItem('userData');
          }
        } catch {}
      } else {
        setError(data.message || 'Failed to unsubscribe. Please try again.');
      }
    } catch (err) {
      console.error('Unsubscribe error:', err);
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-green-500 dark:text-green-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-neutral-100 mb-2">
              You've been unsubscribed
            </h1>
            <p className="text-gray-600 dark:text-neutral-400">
              We're sorry to see you go. You will no longer receive emails from YourAIbrief.
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-neutral-500">
              If you change your mind, you can always resubscribe by visiting our homepage.
            </p>
            <a
              href="/"
              className="inline-block mt-4 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Return to Homepage
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-6">
          <Mail className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-neutral-100 mb-2">
            Unsubscribe
          </h1>
          <p className="text-gray-600 dark:text-neutral-400">
            We're sorry to see you go
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-neutral-300">
              Your Email
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2.5 bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-colors"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              disabled={isSubmitting || isChecking}
            />
            {isChecking && (
              <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400 flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking subscription status...
              </p>
            )}
          </div>
          
          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-neutral-300">
              Why are you unsubscribing?
            </label>
            <select
              className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2.5 bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-colors"
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
              disabled={isSubmitting || isChecking}
            >
              <option value="">Select a reason</option>
              {REASONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {reason === 'Other' && (
              <input
                type="text"
                className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2.5 mt-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-colors"
                placeholder="Please specify your reason"
                value={otherReason}
                onChange={e => setOtherReason(e.target.value)}
                required
                disabled={isSubmitting || isChecking}
              />
            )}
          </div>
          
          {error && (
            <div className="flex items-start text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span className="font-medium text-sm">{error}</span>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting || isChecking}
            className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Unsubscribing...
              </>
            ) : (
              'Unsubscribe'
            )}
          </button>
          
          <div className="text-center">
            <a
              href="/"
              className="text-sm text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300 transition-colors"
            >
              Changed your mind? Return to homepage
            </a>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 