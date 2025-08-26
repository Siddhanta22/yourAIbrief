"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { NewsletterPreview } from "@/components/sections/NewsletterPreview";
import { useEffect, useState } from "react";
import { PreferencesModal } from "@/components/layout/PreferencesModal";
import { Mail, Clock, BookOpen, Settings, TrendingUp, Calendar, User } from "lucide-react";

interface NewsletterHistory {
  id: string;
  title: string;
  sentAt: string;
  opened: boolean;
  clicked: boolean;
  url: string;
}

export default function MemberPage() {
  const session = useSession();
  const router = useRouter();
  const [localEmail, setLocalEmail] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalNewsletters: 0, openRate: 94.2, clickRate: 8.7, lastRead: null as string | null });
  const [preferences, setPreferences] = useState<{ frequency?: string; preferredSendTime?: string; topics?: string[] }>({});
  const [showPrefs, setShowPrefs] = useState(false);
  const [newsletterHistory, setNewsletterHistory] = useState<NewsletterHistory[]>([]);
  const [testSent, setTestSent] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const isAuthed = (session?.status === "authenticated") || !!localEmail;

  useEffect(() => {
    try {
      setLocalEmail(localStorage.getItem('subscribedEmail'));
    } catch {}
  }, []);

  useEffect(() => {
    if (session?.status === "unauthenticated" && !localEmail) {
      router.replace("/#subscribe");
    }
  }, [session?.status, localEmail, router]);

  useEffect(() => {
    (async () => {
      try {
        const email = session?.data?.user?.email || localEmail;
        if (email) {
          // Fetch user data
          const res = await fetch(`/api/user/preferences?email=${encodeURIComponent(email)}`);
          const data = await res.json();
          if (data.success) {
            setPreferences({
              frequency: data?.preferences?.frequency,
              preferredSendTime: data?.preferredSendTime,
              topics: data?.topics || []
            });
            setUserName(data?.user?.name);
          }
          
          // Fetch stats
          await fetchStats();
          
          // Fetch newsletter history
          const historyRes = await fetch(`/api/newsletter/history?email=${encodeURIComponent(email)}`);
          const historyData = await historyRes.json();
          if (historyData.success) {
            setNewsletterHistory(historyData.newsletters);
            if (historyData.newsletters.length > 0) {
              setStats(s => ({ ...s, totalNewsletters: Math.max(s.totalNewsletters, historyData.newsletters.length), lastRead: historyData.newsletters[0].sentAt }));
            }
          }
        }
      } catch {}
    })();
  }, [session?.data?.user?.email, localEmail]);

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    const email = session?.data?.user?.email || localEmail;
    if (!email) return;
    
    const interval = setInterval(() => {
      fetchStats();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [session?.data?.user?.email, localEmail]);

  // Fetch user stats
  const fetchStats = async () => {
    try {
      const email = session?.data?.user?.email || localEmail;
      if (email) {
        const res = await fetch(`/api/user/stats?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (data.success) {
          setStats({
            totalNewsletters: data.stats.totalNewsletters,
            openRate: data.stats.openRate,
            clickRate: data.stats.clickRate,
            lastRead: data.stats.lastNewsletter
          });
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (session?.status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            {userName ? `Welcome back, ${userName}! 👋` : 'Welcome back! 👋'}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Your personalized AI intelligence hub
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <Mail className="w-6 h-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Newsletters Received</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.totalNewsletters}</p>
                </div>
              </div>
              <button 
                onClick={fetchStats}
                className="btn-ghost p-1 text-neutral-400 hover:text-neutral-600"
                title="Refresh stats"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-success-100 dark:bg-success-900/30 rounded-lg">
                <BookOpen className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Open Rate</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.openRate}%</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Click Rate</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.clickRate}%</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-warning-100 dark:bg-warning-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Last Read</p>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {stats.lastRead ? new Date(stats.lastRead).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Newsletters */}
          <section className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Recent Newsletters</h2>
              <div className="flex items-center gap-3">
                <button className="text-sm text-primary-600 hover:text-primary-700">View All</button>
                {!testSent && (
                <button
                  className="text-sm px-3 py-1 rounded border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white"
                  onClick={async () => {
                    const email = session?.data?.user?.email || localEmail;
                    if (!email) return;
                    const res = await fetch('/api/newsletter/test', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email }),
                    });
                    const data = await res.json();
                    if (data.ok) setTestSent(true);
                    alert(data.message || (data.ok ? 'Sent!' : 'Failed'));
                  }}
                >
                  Send Test
                </button>
                )}
                <button
                  className="text-sm px-3 py-1 rounded border border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                  onClick={async () => {
                    const email = session?.data?.user?.email || localEmail;
                    if (!email) return;
                    const res = await fetch('/api/newsletter/send-now', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email }),
                    });
                    const data = await res.json();
                    alert(data.message || (data.success ? 'Newsletter sent!' : 'Failed to send'));
                  }}
                >
                  Send Now
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {newsletterHistory.map((newsletter, i) => (
                <div key={newsletter.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                      {newsletter.title}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {new Date(newsletter.sentAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {newsletter.opened && (
                      <span className="w-2 h-2 bg-green-500 rounded-full" title="Opened"></span>
                    )}
                    {newsletter.clicked && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full" title="Clicked"></span>
                    )}
                    <button
                      className="text-xs text-primary-600 hover:text-primary-700"
                      onClick={() => {
                        const newHistory = [...newsletterHistory];
                        newHistory[i] = { ...newHistory[i], opened: true, clicked: true };
                        setNewsletterHistory(newHistory);
                        if (newsletter.url) {
                          window.open(newsletter.url, '_blank', 'noopener,noreferrer');
                        }
                      }}
                    >
                      Read
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Preferences Section */}
          <section className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Your Preferences</h2>
              <button 
                onClick={() => setShowPrefs(true)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Edit
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-neutral-500 mr-2" />
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
          </section>
        </div>

        {/* Live News Section */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">Latest AI News</h2>
          <div className="card p-6">
            <NewsletterPreview />
          </div>
        </section>

        {/* Account Management Section */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">Account Management</h2>
          <div className="card p-6">
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Settings className="w-4 h-4 text-neutral-500 mr-2" />
                    <span>Account Settings</span>
                  </div>
                  <span className="text-xs text-neutral-500">Coming soon</span>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-neutral-500 mr-2" />
                    <span>Email Preferences</span>
                  </div>
                  <span className="text-xs text-neutral-500">Coming soon</span>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <div className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  <span>Unsubscribe from all emails</span>
                </div>
              </button>
            </div>
          </div>
        </section>

        <PreferencesModal
          isOpen={showPrefs}
          onClose={() => setShowPrefs(false)}
          initialName={userName || ''}
          initialFrequency={(preferences.frequency as any) || 'daily'}
          initialTime={preferences.preferredSendTime || '08:00 AM'}
          initialTopics={preferences.topics || []}
          onSave={async ({ name, frequency, preferredSendTime, topics }) => {
            const email = session?.data?.user?.email || localEmail;
            if (!email) return;
            const res = await fetch('/api/user/preferences', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, name, frequency, preferredSendTime, topics }),
            });
            const data = await res.json();
            if (data?.success) {
              setPreferences({ frequency, preferredSendTime, topics });
              if (name) setUserName(name);
              // Refresh stats after preferences are updated
              await fetchStats();
            }
          }}
        />
      </div>
    </div>
  );
}