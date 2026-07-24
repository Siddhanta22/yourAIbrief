'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft } from 'lucide-react';
import { NewsCard } from '@/components/ui/NewsCard';

interface NewsletterSection {
  id: string;
  title: string;
  description?: string;
  articles: any[];
}

interface NewsletterDetail {
  id: string;
  title: string;
  summary: string | null;
  publishedAt: string;
  sections: NewsletterSection[];
}

export default function NewsletterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const [newsletter, setNewsletter] = useState<NewsletterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }
    if (status !== 'authenticated') return;

    const fetchNewsletter = async () => {
      try {
        const res = await fetch(`/api/newsletter/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setNewsletter(data.newsletter);
        } else {
          setError(data.message || 'Newsletter not found');
        }
      } catch (e) {
        setError('Failed to load newsletter');
      } finally {
        setLoading(false);
      }
    };
    fetchNewsletter();
  }, [status, params.id, router]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-primary-400" />
      </div>
    );
  }

  if (error || !newsletter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            {error || 'Newsletter not found'}
          </h1>
          <button onClick={() => router.push('/dashboard')} className="btn-primary mt-4">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
            {new Date(newsletter.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
            {newsletter.title}
          </h1>
          {newsletter.summary && (
            <p className="text-neutral-600 dark:text-neutral-400">{newsletter.summary}</p>
          )}
        </div>

        <div className="space-y-10">
          {newsletter.sections?.map((section) => (
            <div key={section.id}>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                {section.title}
              </h2>
              {section.description && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">{section.description}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {section.articles?.map((article: any) => (
                  <NewsCard key={article.id || article.url} article={article} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
