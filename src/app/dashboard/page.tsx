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

interface DashboardStats {
  totalNewsletters: number;
  openRate: number;
  clickRate: number;
  timeSpent: number;
  interests: string[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalNewsletters: 12,
    openRate: 94.2,
    clickRate: 8.7,
    timeSpent: 3.2,
    interests: ['research', 'industry', 'tools'],
  });

  const [activeTab, setActiveTab] = useState('overview');

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
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
                Newsletter Preferences
              </h3>
              
              <div className="space-y-6">
                {/* Delivery Frequency */}
                <div>
                  <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    Delivery Frequency
                  </label>
                  <select className="input-field">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                  </select>
                </div>

                {/* Delivery Time */}
                <div>
                  <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    Preferred Delivery Time
                  </label>
                  <select className="input-field">
                    <option value="morning">Morning (8:00 AM)</option>
                    <option value="afternoon">Afternoon (12:00 PM)</option>
                    <option value="evening">Evening (6:00 PM)</option>
                  </select>
                </div>

                {/* Content Density */}
                <div>
                  <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    Content Density
                  </label>
                  <select className="input-field">
                    <option value="brief">Brief Overview</option>
                    <option value="detailed">Detailed</option>
                    <option value="comprehensive">Comprehensive</option>
                  </select>
                </div>

                <button className="btn-primary">
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
                Engagement Analytics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                    Open Rate Trend
                  </h4>
                  <div className="h-32 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
                    <p className="text-neutral-500">Chart placeholder</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                    Click Rate Trend
                  </h4>
                  <div className="h-32 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
                    <p className="text-neutral-500">Chart placeholder</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 