'use client';

import { NewsletterArticle } from '@/types';

interface NewsCardProps {
  article: NewsletterArticle;
  className?: string;
}

export function NewsCard({ article, className = '' }: NewsCardProps) {
  return (
    <a
      href={(article as any).url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={`group rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-700 hover:shadow-lg transition-shadow ${className}`}
    >
      {Boolean((article as any).image) && (
        <div className="h-40 bg-neutral-200 dark:bg-neutral-600 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={(article as any).image}
            alt={(article as any).title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
            {(article as any).categoryLabel || (article as any).category || 'AI'}
          </span>
          <span className="text-xs text-neutral-500">
            {new Date(article.publishedAt).toLocaleDateString()}
          </span>
        </div>
        <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2">
          {article.title}
        </h4>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-3">
          {article.summary}
        </p>
      </div>
    </a>
  );
}
