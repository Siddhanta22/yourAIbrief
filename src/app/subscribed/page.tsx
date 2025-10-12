'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Mail, ArrowRight } from 'lucide-react';

export default function SubscribedPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect to home after 5 seconds
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Successfully Subscribed! 🎉
          </h1>
          <p className="text-gray-600">
            Welcome to YourAIbrief! You'll receive your first newsletter tomorrow at 8:00 AM.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center text-blue-600 mb-4">
            <Mail className="w-5 h-5 mr-2" />
            <span className="text-sm">Check your email for a welcome message</span>
          </div>
          
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Continue to Homepage
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
          
          <p className="text-sm text-gray-500">
            Redirecting automatically in 5 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}