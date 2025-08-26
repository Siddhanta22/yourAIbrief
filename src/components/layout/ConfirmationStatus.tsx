'use client';

import { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ConfirmationStatusProps {
  email: string;
}

export function ConfirmationStatus({ email }: ConfirmationStatusProps) {
  const [status, setStatus] = useState<'loading' | 'verified' | 'unverified' | 'error'>('loading');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/user/exists?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        
        if (data.exists) {
          setStatus(data.emailVerified ? 'verified' : 'unverified');
        } else {
          setStatus('error');
        }
      } catch (error) {
        setStatus('error');
      }
    };

    if (email) {
      checkStatus();
    }
  }, [email]);

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
        <Clock className="w-4 h-4 animate-spin" />
        Checking status...
      </div>
    );
  }

  if (status === 'verified') {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <CheckCircle className="w-4 h-4" />
        Email verified ✓
      </div>
    );
  }

  if (status === 'unverified') {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
        <AlertCircle className="w-4 h-4" />
        Please check your email to confirm subscription
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
      <AlertCircle className="w-4 h-4" />
      Error checking status
    </div>
  );
}

