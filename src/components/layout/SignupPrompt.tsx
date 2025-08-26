'use client';

import { Mail, UserPlus, X } from 'lucide-react';

interface SignupPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

export function SignupPrompt({ isOpen, onClose, onStart }: SignupPromptProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-2xl">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <UserPlus className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Create your account</h3>
            </div>
            <button onClick={onClose} className="btn-ghost p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            Start with your email to personalize your AI Brief. No social login required.
          </p>

          <div className="mt-6 space-y-3">
            <button onClick={onStart} className="btn-primary w-full flex items-center justify-center">
              <Mail className="w-4 h-4 mr-2" />
              Start with email
            </button>
            <button onClick={onClose} className="btn-ghost w-full text-sm">Maybe later</button>
          </div>
        </div>
      </div>
    </div>
  );
}


