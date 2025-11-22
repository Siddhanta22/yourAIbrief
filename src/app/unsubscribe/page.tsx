'use client';

import { Suspense } from 'react';
import UnsubscribePage from './unsubscribe-content';

export default function UnsubscribePageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    }>
      <UnsubscribePage />
    </Suspense>
  );
}

