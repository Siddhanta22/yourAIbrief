'use client';

import { useEffect, useMemo, useState } from 'react';
import { X, Clock, Calendar } from 'lucide-react';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName?: string;
  initialFrequency?: 'daily' | 'weekly' | 'monthly';
  initialTime?: string; // e.g., "08:00 AM"
  initialTopics?: string[];
  onSave: (values: { name?: string; frequency: 'daily' | 'weekly' | 'monthly'; preferredSendTime: string; topics: string[] }) => Promise<void> | void;
}

export function PreferencesModal({ isOpen, onClose, initialName = '', initialFrequency = 'daily', initialTime = '08:00 AM', initialTopics = [], onSave }: PreferencesModalProps) {
  const [name, setName] = useState<string>(initialName);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>(initialFrequency);
  const [timeOfDay, setTimeOfDay] = useState<string>(initialTime);
  const [saving, setSaving] = useState(false);
  const [topics, setTopics] = useState<string[]>(initialTopics);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setFrequency(initialFrequency);
      setTimeOfDay(initialTime);
      setTopics(initialTopics);
    }
  }, [isOpen, initialName, initialFrequency, initialTime, initialTopics]);

  const timeOptions = useMemo(() => {
    const options: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = ((h % 12) || 12).toString().padStart(2, '0');
        const minute = m === 0 ? '00' : '30';
        const ampm = h < 12 ? 'AM' : 'PM';
        options.push(`${hour}:${minute} ${ampm}`);
      }
    }
    return options;
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-2xl">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Update Preferences</h3>
            <button onClick={onClose} className="btn-ghost p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">Name</label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">Frequency</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <select className="input-field pl-9" value={frequency} onChange={e => setFrequency(e.target.value as any)}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">Preferred Delivery Time</label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <select className="input-field pl-9" value={timeOfDay} onChange={e => setTimeOfDay(e.target.value)}>
                  {timeOptions.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">Topics</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto">
                {['ai-news','startups','big-tech','crypto','fintech','edtech','autonomous','healthtech','tools','policy','research','opinion'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setTopics(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                    className={`p-2 rounded-lg border text-left capitalize ${topics.includes(cat) ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600'}`}
                  >
                    {cat.replace('-', ' ')}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-neutral-500">Select a few topics you care about.</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end space-x-2">
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button
              className="btn-primary"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await onSave({ name, frequency, preferredSendTime: timeOfDay, topics });
                  onClose();
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


