'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  BarChart3, 
  Mail, 
  BookOpen, 
  Clock, 
  TrendingUp,
  User,
  Bell
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { PreferencesModal } from '@/components/layout/PreferencesModal';

interface DashboardStats {
  totalNewsletters: number;
  openRate: number;
  clickRate: number;
  timeSpent: number;
  interests: string[];
}

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [hasLocalEmail, setHasLocalEmail] = useState(false);
  const [localChecked, setLocalChecked] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalNewsletters: 0,
    openRate: 0,
    clickRate: 0,
    timeSpent: 0,
    interests: [],
  });
  const [preferences, setPreferences] = useState<{ frequency?: string; preferredSendTime?: string; topics?: string[] }>({});
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user stats
  const fetchStats = async () => {
    try {
      const email = localStorage.getItem('subscribedEmail');
      if (email) {
        const res = await fetch(`/api/user/stats?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (data.success) {
          setStats({
            totalNewsletters: data.stats.totalNewsletters,
            openRate: data.stats.openRate,
            clickRate: data.stats.clickRate,
            timeSpent: 3.2, // Placeholder for now
            interests: data.stats.activeTopics || [],
          });
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch user preferences
  const fetchPreferences = async () => {
    try {
      const email = localStorage.getItem('subscribedEmail');
      if (email) {
        const res = await fetch(`/api/user/preferences?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (data.success) {
          setPreferences({
            frequency: data?.preferences?.frequency,
            preferredSendTime: data?.preferredSendTime,
            topics: data?.topics || []
          });
        }
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  useEffect(() => {
    try {
      setHasLocalEmail(!!localStorage.getItem('subscribedEmail'));
    } finally {
      setLocalChecked(true);
    }
  }, []);

  useEffect(() => {
    if (!localChecked) return;
    if (status === 'unauthenticated' && !hasLocalEmail) {
      toast.dismiss();
      toast('Please sign up with your email to access your dashboard.');
      router.replace('/#subscribe');
    }
  }, [status, hasLocalEmail, router, localChecked]);

  // Fetch user preferences
  useEffect(() => {
    if (hasLocalEmail) {
      fetchPreferences();
      fetchStats(); // Fetch stats when preferences are fetched
    }
  }, [hasLocalEmail]);

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    if (!hasLocalEmail) return;
    
    const interval = setInterval(() => {
      fetchStats();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [hasLocalEmail]);

  if (status === 'loading' || !localChecked) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (status === 'unauthenticated' && !hasLocalEmail) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Dashboard
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Manage your newsletter preferences and track your engagement
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <Mail className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Newsletters Received
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {stats.totalNewsletters}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-success-100 dark:bg-success-900/30 rounded-lg">
                <BookOpen className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Open Rate
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {stats.openRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Click Rate
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {stats.clickRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-warning-100 dark:bg-warning-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Avg. Time Spent
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {stats.timeSpent}m
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="border-b border-neutral-200 dark:border-neutral-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'preferences', label: 'Preferences', icon: Settings },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {[
                    { action: 'Opened newsletter', time: '2 hours ago', icon: BookOpen },
                    { action: 'Clicked on article', time: '3 hours ago', icon: TrendingUp },
                    { action: 'Updated preferences', time: '1 day ago', icon: Settings },
                    { action: 'Received newsletter', time: '1 day ago', icon: Mail },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                        <item.icon className="w-4 h-4 text-neutral-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {item.action}
                        </p>
                        <p className="text-xs text-neutral-500">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Your Interests */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Your Interests
                </h3>
                <div className="space-y-3">
                  {stats.interests.map((interest, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 capitalize">
                        {interest}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        <span className="text-xs text-neutral-500">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-4 btn-primary text-sm">
                  Update Interests
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Newsletter Preferences
                </h3>
                <button 
                  onClick={() => setShowPrefs(true)}
                  className="btn-primary text-sm"
                >
                  Update Preferences
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-neutral-500 mr-2" />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Frequency</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {preferences.frequency || 'Not set'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-neutral-500 mr-2" />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Delivery Time</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {preferences.preferredSendTime || 'Not set'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-neutral-500 mr-2" />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Topics</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {preferences.topics && preferences.topics.length > 0 
                      ? `${preferences.topics.length} selected`
                      : 'Not set'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Your Newsletter Stats
                </h3>
                <button 
                  onClick={fetchStats}
                  className="btn-ghost text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600 mb-1">
                    {stats.totalNewsletters}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Newsletters Received
                  </div>
                </div>
                
                <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div className="text-2xl font-bold text-success-600 mb-1">
                    {stats.interests.length}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Active Topics
                  </div>
                </div>
                
                <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div className="text-2xl font-bold text-warning-600 mb-1">
                    {preferences.frequency || 'Daily'}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Delivery Frequency
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <h4 className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                  📊 Analytics Coming Soon
                </h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  We're working on detailed engagement analytics including open rates, click-through rates, and reading patterns. This will help us deliver even better content tailored to your preferences.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      <PreferencesModal
        isOpen={showPrefs}
        onClose={() => setShowPrefs(false)}
        initialName=""
        initialFrequency={(preferences.frequency as any) || 'daily'}
        initialTime={preferences.preferredSendTime || '08:00 AM'}
        initialTopics={preferences.topics || []}
        onSave={async ({ name, frequency, preferredSendTime, topics }) => {
          try {
            const email = localStorage.getItem('subscribedEmail');
            if (email) {
              const res = await fetch('/api/user/preferences', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, name, frequency, preferredSendTime, topics }),
              });
              const data = await res.json();
              if (data.success) {
                setPreferences({ frequency, preferredSendTime, topics });
                // Refresh stats after preferences update
                await fetchStats();
                toast.success('Preferences updated successfully!');
              } else {
                toast.error('Failed to update preferences.');
              }
            }
          } catch (error) {
            console.error('Error updating preferences:', error);
            toast.error('Failed to update preferences.');
          }
        }}
      />
    </div>
  );
} 