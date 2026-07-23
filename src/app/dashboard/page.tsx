'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { User, Clock, Settings, CalendarDays, Send } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

type SessionUserWithId = {
  id?: string;
  email?: string | null;
  name?: string | null;
};

interface UserData {
  email: string;
  name: string;
  isActive: boolean;
  preferredSendTime: string;
  frequency: string;
  topics: string[];
  stats: {
    newslettersReceived: number;
    memberSince: string;
    lastDelivery: string | null;
  };
}

function formatDate(value: string | null): string {
  if (!value) return 'Not yet sent';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for session to load
    if (status === 'loading') {
      return;
    }

    // Redirect if not authenticated or session/user is missing
    if (status !== 'authenticated' || !session?.user) {
      router.push('/');
      setLoading(false);
      return;
    }

    // At this point, we know session and session.user are defined
    const sessionUser = session.user as SessionUserWithId;

    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/preferences');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUser({
              email: sessionUser.email ?? '',
              name: data.name ?? '',
              isActive: true,
              preferredSendTime: data.preferredSendTime ?? '08:00',
              frequency: data.preferences?.frequency ?? 'daily',
              topics: data.topics ?? [],
              stats: {
                newslettersReceived: data.stats?.newslettersReceived ?? 0,
                memberSince: data.stats?.memberSince ?? new Date().toISOString(),
                lastDelivery: data.stats?.lastDelivery ?? null,
              },
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [status, session, router]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-primary-400"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-neutral-900 dark:to-neutral-800">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-900 shadow-sm border-b dark:border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16">
            <div className="flex items-center">
              <Logo className="w-8 h-8 mr-3" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-neutral-100">YourAIbrief Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-neutral-100 mb-2">
            Welcome back, {user.name || user.email?.split('@')[0] || 'User'}! 👋
          </h2>
          <p className="text-gray-600 dark:text-neutral-400">
            Here's your AI intelligence summary and preferences.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Send className="w-8 h-8 text-blue-600 dark:text-primary-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Newsletters Received</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-neutral-100">{user.stats.newslettersReceived}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <CalendarDays className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Member Since</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-neutral-100">{formatDate(user.stats.memberSince)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-purple-600 dark:text-secondary-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Last Delivery</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-neutral-100">{formatDate(user.stats.lastDelivery)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Account Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-neutral-400">Email</label>
                <p className="text-gray-900 dark:text-neutral-100">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-neutral-400">Name</label>
                <p className="text-gray-900 dark:text-neutral-100">{user.name || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-neutral-400">Status</label>
                <p className={`text-sm ${user.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Newsletter Preferences
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-neutral-400">Delivery Time</label>
                <p className="text-gray-900 dark:text-neutral-100 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {user.preferredSendTime || '08:00'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-neutral-400">Frequency</label>
                <p className="text-gray-900 dark:text-neutral-100 capitalize">
                  {user.frequency}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-neutral-400">Interests</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {user.topics.length > 0 ? (
                    user.topics.map((interest) => (
                      <span
                        key={interest}
                        className="px-2 py-1 bg-blue-100 dark:bg-primary-900/30 text-blue-800 dark:text-primary-300 text-xs rounded-full"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-neutral-500">No topics selected</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
