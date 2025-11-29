import React, { Suspense } from 'react';
import SignInClient from './SignInClient';

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to purple-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
          <div className="w-full max-w-md mx-auto bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-8 flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        </div>
      }
    >
      <SignInClient />
    </Suspense>
  );
}