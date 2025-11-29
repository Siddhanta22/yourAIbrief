'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Menu, 
  X, 
  Mail, 
  BarChart3, 
  Settings, 
  User,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { SignupPrompt } from './SignupPrompt';
import { PreferencesModal } from './PreferencesModal';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefData, setPrefData] = useState<{ frequency?: string; preferredSendTime?: string; topics?: string[] }>({});
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  
  // Remove localStorage-based auth - use NextAuth session instead
  // localStorage can still be used for UX convenience (like pre-filling email), but not for auth

  // Click outside handler for account menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setOpenAccount(false);
      }
    }

    if (openAccount) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openAccount]);

  const handleLogout = async () => {
    console.log('Logout clicked');
    setOpenAccount(false);
    
    try {
      // Call logout API to clean up server-side session
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // NextAuth logout (this handles client-side session cleanup)
      await signOut({ redirect: true, callbackUrl: '/' });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, still sign out from NextAuth
      await signOut({ redirect: true, callbackUrl: '/' });
    }
  };

  // Check if user is logged in via NextAuth session only
  const isLoggedIn = status === 'authenticated' && !!session?.user;

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ] as const;

  return (
    <nav className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-16">
          {/* Logo - Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <Link href="/" className="flex items-center space-x-1 sm:space-x-2">
              <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
              <span className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100">
                YourAIbrief
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center justify-center space-x-8">
            {navigation.map((item) => {
              const isHome = item.name === 'Home';
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    if (isHome && typeof window !== 'undefined' && window.location.pathname === '/') {
                      // Force a full reload + scroll to top to reset any in-progress subscription step
                      e.preventDefault();
                      window.location.href = '/';
                    }
                  }}
                  className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors duration-200"
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right side - Theme + Profile */}
          <div className="flex items-center justify-end space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              ) : (
                <Moon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              )}
            </button>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-2">
              {status === 'loading' ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              ) : isLoggedIn ? (
                <div className="relative" ref={accountMenuRef}>
                  <button
                    onClick={() => setOpenAccount(v => !v)}
                    className="btn-ghost relative"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  {openAccount && (
                    <div className="absolute right-0 mt-2 w-60 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg p-2 z-50">
                      <div className="px-2 py-2 text-xs text-neutral-500 truncate">
                        {session?.user?.email ?? 'Account'}
                      </div>
                      <button
                        onClick={async () => {
                          // Use session email instead of localStorage
                          if (!session?.user?.email) {
                            toast.error('Please sign in to update preferences');
                            return;
                          }
                          
                          try {
                            const res = await fetch('/api/user/preferences');
                            if (!res.ok) {
                              console.error('Failed to fetch preferences:', res.status);
                              toast.error('Failed to load preferences');
                              return;
                            }
                            const data = await res.json();
                            if (data.success) {
                              setPrefData({ frequency: data?.preferences?.frequency, preferredSendTime: data?.preferredSendTime, topics: data?.topics || [] });
                            } else {
                              console.error('Preferences fetch error:', data.message);
                              toast.error(data.message || 'Failed to load preferences');
                            }
                          } catch (error) {
                            console.error('Error fetching preferences:', error);
                            toast.error('Failed to load preferences');
                          }
                          setOpenAccount(false);
                          setShowPrefs(true);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >Update Preferences</button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >Logout</button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowSignup(true)}
                  className="btn-ghost"
                >
                  <User className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200"
            >
              {isOpen ? (
                <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              ) : (
                <Menu className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-neutral-200 dark:border-neutral-700">
              {navigation.map((item) => {
                const isHome = item.name === 'Home';
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      setIsOpen(false);
                      if (isHome && typeof window !== 'undefined' && window.location.pathname === '/') {
                        // Force full reload + scroll to top when already on home
                        e.preventDefault();
                        window.location.href = '/';
                      }
                    }}
                    className="block px-3 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                {status === 'loading' ? (
                  <div className="flex items-center justify-center py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  </div>
                ) : isLoggedIn ? (
                  <>
                    <button
                      onClick={() => { setIsOpen(false); handleLogout(); }}
                      className="mt-2 flex items-center w-full px-3 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setIsOpen(false); setShowSignup(true); }}
                    className="flex items-center w-full px-3 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors duration-200"
                  >
                    <User className="w-5 h-5 mr-2" />
                    Sign up / Login
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
        {/* Modals */}
        <SignupPrompt
          isOpen={showSignup}
          onClose={() => setShowSignup(false)}
          onStart={() => { setShowSignup(false); router.push('/#subscribe'); toast.dismiss(); toast.success('Start with your email below.'); }}
        />
        <PreferencesModal
          isOpen={showPrefs}
          onClose={() => setShowPrefs(false)}
          initialFrequency={(prefData.frequency as any) || 'daily'}
          initialTime={prefData.preferredSendTime || '08:00 AM'}
          initialTopics={prefData.topics || []}
          onSave={async ({ frequency, preferredSendTime, topics }) => {
            // Use session-based auth - no need to pass email
            if (!session?.user?.email) {
              toast.error('Please sign in to update preferences');
              return;
            }
            
            try {
              const res = await fetch('/api/user/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ frequency, preferredSendTime, topics }),
              });
              
              if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Failed to update preferences' }));
                toast.error(errorData.message || 'Failed to update preferences');
                return;
              }
              
              const data = await res.json();
              if (data.success) {
                toast.success('Preferences updated successfully!');
                // Session will be updated automatically on next page load
              } else {
                toast.error(data.message || 'Failed to update preferences');
              }
            } catch (error) {
              console.error('Error updating preferences:', error);
              toast.error('Failed to update preferences. Please try again.');
            }
          }}
        />
      </div>
    </nav>
  );
} 