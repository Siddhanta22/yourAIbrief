'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  BarChart3, 
  Mail, 
  Clock, 
  Settings,
  User,
  Bell,
  Star
} from 'lucide-react';
import { NewsGrid } from '@/components/ui/NewsGrid';

interface UserData {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  isActive: boolean;
  preferences: any;
  preferredSendTime: string;
}

export function DashboardSection() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('Dashboard: User data loaded:', parsedUser);
      } catch (error) {
        console.error('Dashboard: Error parsing user data:', error);
        router.push('/?show=signup');
      }
    } else {
      console.log('Dashboard: No user data found, redirecting to signup');
      router.push('/?show=signup');
    }
    setLoading(false);
  }, [router]);


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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-neutral-50 dark:bg-neutral-900">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-bg" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6"
          >
            <Star className="w-4 h-4 mr-2" />
            AI-Powered Content Curation
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6"
          >
            Welcome back, {user.name || user.email?.split('@')[0] || 'User'}! 👋
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Here's your AI intelligence summary and personalized dashboard.
          </motion.p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="card glass-effect p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Newsletters Received</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">12</p>
              </div>
            </div>
          </div>
          
          <div className="card glass-effect p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Open Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">85%</p>
              </div>
            </div>
          </div>
          
          <div className="card glass-effect p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Engagement</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">92%</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* User Info and Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
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

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
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
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-primary flex items-center justify-center"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            View Full Dashboard
          </button>
          
        </motion.div>

        {/* News Grid */}
        <NewsGrid 
          title="Your Personalized AI News"
          subtitle="Latest AI developments curated for you"
          maxCards={6}
          showTitle={true}
        />
      </div>
    </section>
  );
}
