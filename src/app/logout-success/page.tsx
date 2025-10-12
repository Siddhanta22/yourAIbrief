'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function LogoutSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect to home after 3 seconds with signup parameter
    const timer = setTimeout(() => {
      router.push('/?show=signup');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Successfully Logged Out
          </h1>
          <p className="text-gray-600">
            You have been logged out successfully. You will be redirected to the home page shortly.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => router.push('/?show=signup')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Go to Home Page
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
          
          <p className="text-sm text-gray-500">
            Redirecting automatically in 3 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
