"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

const REASONS = [
  'Too many emails',
  'Not relevant to me',
  'I get my AI news elsewhere',
  'Taking a break',
  'Other',
];

export default function UnsubscribePage() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    const finalReason = reason === 'Other' ? otherReason : reason;
    const res = await fetch('/api/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, reason: finalReason }),
    });
    const data = await res.json();
    if (data.success) {
      setSubmitted(true);
    } else {
      setError(data.message || 'Failed to unsubscribe.');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">You've been unsubscribed</h1>
            <p className="text-gray-600">
              We're sorry to see you go. You will no longer receive emails from YourAIbrief.
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              If you change your mind, you can always resubscribe by visiting our homepage.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-6">
          <Mail className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Unsubscribe</h1>
          <p className="text-gray-600">We're sorry to see you go</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium">Your Email</label>
          <input
            type="email"
            className="w-full border rounded px-4 py-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Why are you unsubscribing?</label>
          <select
            className="w-full border rounded px-4 py-2"
            value={reason}
            onChange={e => setReason(e.target.value)}
            required
          >
            <option value="">Select a reason</option>
            {REASONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {reason === 'Other' && (
            <input
              type="text"
              className="w-full border rounded px-4 py-2 mt-2"
              placeholder="Please specify"
              value={otherReason}
              onChange={e => setOtherReason(e.target.value)}
              required
            />
          )}
        </div>
        {error && (
          <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">{error}</span>
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors"
        >
          Unsubscribe
        </button>
        </form>
      </motion.div>
    </div>
  );
} 