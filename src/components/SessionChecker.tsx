'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export function SessionChecker() {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log('SessionChecker: Status:', status, 'Session:', session);
    
    // Clear any stale localStorage data if not authenticated
    if (status === 'unauthenticated') {
      try {
        localStorage.removeItem('subscribedEmail');
        console.log('SessionChecker: Cleared localStorage for unauthenticated user');
      } catch (error) {
        console.error('SessionChecker: Error clearing localStorage:', error);
      }
    }
  }, [status, session]);

  return null; // This component doesn't render anything
}
