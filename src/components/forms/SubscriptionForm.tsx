'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Check } from 'lucide-react';

interface SubscriptionFormProps {
  onSubmit: (
    name: string,
    email: string, 
    interests: string[], 
    deliveryPreferences?: { frequency: string; dayOfWeek?: string; dayOfMonth?: string; timeOfDay: string }
  ) => void;
  isSubmitting?: boolean;
}

const INTEREST_CATEGORIES = [
  { id: 'ai-news', label: 'AI News (General)', icon: '📰' },
  { id: 'startups', label: 'Startups & Funding', icon: '🚀' },
  { id: 'big-tech', label: 'Big Tech & Industry', icon: '🏢' },
  { id: 'crypto', label: 'Crypto & Blockchain', icon: '🪙' },
  { id: 'fintech', label: 'Fintech & Business', icon: '💸' },
  { id: 'edtech', label: 'EdTech & Learning', icon: '🎓' },
  { id: 'autonomous', label: 'Autonomous & Robotics', icon: '🤖' },
  { id: 'healthtech', label: 'HealthTech & BioAI', icon: '🧬' },
  { id: 'tools', label: 'Tools & Productivity', icon: '🛠️' },
  { id: 'policy', label: 'Policy & Ethics', icon: '⚖️' },
  { id: 'research', label: 'Research Breakthroughs', icon: '🔬' },
  { id: 'opinion', label: 'Opinion & Analysis', icon: '💡' },
];

export function SubscriptionForm({ onSubmit, isSubmitting = false }: SubscriptionFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showInterests, setShowInterests] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [frequency, setFrequency] = useState('daily');
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [timeOfDay, setTimeOfDay] = useState('08:00 AM');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    
    try {
      console.log('Checking if email exists:', email);
      const checkResponse = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const checkData = await checkResponse.json();
      console.log('Email check response:', checkData);

      if (checkData.success && checkData.userExists) {
        // User exists - redirect to dashboard immediately
        console.log('User exists, redirecting to dashboard');
        localStorage.setItem('userData', JSON.stringify(checkData.user));
        localStorage.setItem('subscribedEmail', email);
        
        // Show welcome back message and redirect
        alert('Welcome back! Redirecting to your dashboard...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
        return;
      }
      
      // New user - continue to interests selection
      console.log('New user, showing interests');
      setIsNewUser(true);
      setShowInterests(true);
    } catch (error) {
      console.error('Error checking email:', error);
      // On error, assume new user and continue
      setIsNewUser(true);
      setShowInterests(true);
    }
  };

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleInterestsNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInterests.length > 0) {
      setShowPreferences(true);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInterests.length === 0) return;
    if (isNewUser && (!name || name.trim() === '')) return;

    const deliveryPreferences = {
      frequency,
      dayOfWeek,
      dayOfMonth,
      timeOfDay,
    };

    onSubmit(name, email, selectedInterests, deliveryPreferences);
  };

  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = ((h % 12) || 12).toString().padStart(2, '0');
      const minute = m === 0 ? '00' : '30';
      const ampm = h < 12 ? 'AM' : 'PM';
      timeOptions.push(`${hour}:${minute} ${ampm}`);
    }
  }

  return (
    <div className="w-full max-w-md">
      {!showInterests ? (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleEmailSubmit}
          className="space-y-4"
        >
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="input-field pl-10"
              required
            />
          </div>
          <button
            type="submit"
            disabled={!email || !email.includes('@')}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Get Started
          </button>
        </motion.form>
      ) : !showPreferences ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              What interests you most?
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Select 3-5 topics for personalized content
            </p>
          </div>

          {/* Name field for new users only */}
          {isNewUser && (
            <div>
              <label className="block mb-1 font-medium text-neutral-900 dark:text-neutral-100">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="input-field"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {INTEREST_CATEGORIES.map((interest) => (
              <button
                key={interest.id}
                type="button"
                onClick={() => handleInterestToggle(interest.id)}
                className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                  selectedInterests.includes(interest.id)
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{interest.icon}</span>
                    <span className="text-sm font-medium">{interest.label}</span>
                  </div>
                  {selectedInterests.includes(interest.id) && (
                    <Check className="w-4 h-4 text-primary-600" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleInterestsNext} className="space-y-4">
            <button
              type="submit"
              disabled={selectedInterests.length === 0 || isSubmitting}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
            <button
              type="button"
              onClick={() => setShowInterests(false)}
              className="btn-ghost w-full text-sm"
            >
              Back to email
            </button>
          </form>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              When do you want to receive your AI Brief?
            </h3>
          </div>
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Frequency</label>
              <select
                className="input-field"
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            {frequency === 'weekly' && (
              <div>
                <label className="block mb-1 font-medium">Day of the Week</label>
                <select
                  className="input-field"
                  value={dayOfWeek}
                  onChange={e => setDayOfWeek(e.target.value)}
                >
                  {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            )}
            {frequency === 'monthly' && (
              <div>
                <label className="block mb-1 font-medium">Day of the Month</label>
                <select
                  className="input-field"
                  value={dayOfMonth}
                  onChange={e => setDayOfMonth(e.target.value)}
                >
                  {Array.from({length: 28}, (_, i) => (i+1).toString()).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">Preferred Delivery Time</label>
              <select
                className="input-field"
                required
                value={timeOfDay}
                onChange={e => setTimeOfDay(e.target.value)}
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || (isNewUser && (!name || name.trim() === ''))}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Subscribing...
                </span>
              ) : (
                'Finish Subscription'
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowPreferences(false)}
              className="btn-ghost w-full text-sm"
            >
              Back to interests
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
} 