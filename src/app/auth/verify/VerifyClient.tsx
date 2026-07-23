'use client';

import React, { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'error'>('verifying');

  useEffect(() => {
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email || !token) {
      setStatus('error');
      return;
    }

    signIn('email', { email, token, redirect: false })
      .then((result) => {
        if (result?.ok) {
          router.push('/dashboard');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      <div className="w-full max-w-md mx-auto bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-8 flex flex-col items-center text-center">
        {status === 'verifying' ? (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">Signing you in...</p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Link expired or invalid
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              This sign-in link is no longer valid - it may have already been used or expired. Please request a new one.
            </p>
            <a href="/" className="text-primary-600 hover:underline">
              ← Back to Home
            </a>
          </>
        )}
      </div>
    </div>
  );
}
