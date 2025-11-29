'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { User, Mail, Clock, Settings, TrendingUp, Users, BarChart3 } from 'lucide-react';

type SessionUserWithId = {
  id?: string;
  email?: string | null;
  name?: string | null;
};

interface UserData {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  isActive: boolean;
  preferences: any;
  preferredSendTime: string;
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

    // TypeScript now knows session.user exists
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/preferences');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Construct user object from API response and session
            // session.user is guaranteed to exist at this point
            setUser({
              // We don't currently need the user ID on the client; keep it empty
              // to avoid relying on NextAuth's extended user typing here.
              id: '',
              email: sessionUser.email ?? '',
              name: data.name ?? '',
              emailVerified: false,
              isActive: true,
              preferences: data.preferences ?? {},
              preferredSendTime: data.preferredSendTime ?? '08:00',
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16">
            <div className="flex items-center">
              <Mail className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">YourAIbrief Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name || user.email?.split('@')[0] || 'User'}! 👋
          </h2>
          <p className="text-gray-600">
            Here's your AI intelligence summary and preferences.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Newsletters Received</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold text-gray-900">85%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement</p>
                <p className="text-2xl font-bold text-gray-900">92%</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Account Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-900">{user.name || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className={`text-sm ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Newsletter Preferences
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Delivery Time</label>
                <p className="text-gray-900 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {user.preferredSendTime || '08:00'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Frequency</label>
                <p className="text-gray-900">
                  {user.preferences?.frequency || 'Daily'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Interests</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(user.preferences?.interests || []).map((interest: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}