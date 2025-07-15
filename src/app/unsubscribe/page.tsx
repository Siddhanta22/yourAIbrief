"use client";
import { useState } from 'react';

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
      <div className="max-w-lg mx-auto py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">You’ve been unsubscribed</h1>
        <p className="text-neutral-600 mb-8">We’re sorry to see you go. If you change your mind, you’re always welcome back!</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-24">
      <h1 className="text-3xl font-bold mb-6 text-center">Unsubscribe</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-neutral-900 p-8 rounded-xl shadow">
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
        {error && <div className="text-red-600 font-medium">{error}</div>}
        <button
          type="submit"
          className="w-full bg-primary-600 text-white font-bold py-2 rounded hover:bg-primary-700 transition"
        >
          Unsubscribe
        </button>
      </form>
    </div>
  );
} 