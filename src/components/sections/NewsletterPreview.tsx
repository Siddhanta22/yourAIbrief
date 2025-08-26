'use client';

import { useState, useEffect } from 'react';
import { NewsletterArticle } from '@/types';

export function NewsletterPreview() {
  const [articles, setArticles] = useState<NewsletterArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/news/preview');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error('Error fetching news preview:', err);
        setError('Failed to load news preview');
        // Fallback to static content
        setArticles([
          {
            id: '1',
            title: 'New Transformer Architecture Shows 40% Performance Improvement',
            summary: 'Researchers at Stanford introduce a novel attention mechanism that significantly reduces computational complexity while improving accuracy across multiple benchmarks.',
            url: '#',
            source: 'arXiv',
            publishedAt: new Date(),
            tags: ['research', 'transformer', 'performance'],
            relevance: 0.9,
            category: 'research'
          },
          {
            id: '2',
            title: 'Breakthrough in Multimodal AI Understanding',
            summary: 'OpenAI\'s latest model demonstrates unprecedented ability to understand and reason across text, images, and audio simultaneously.',
            url: '#',
            source: 'OpenAI Blog',
            publishedAt: new Date(),
            tags: ['multimodal', 'openai', 'understanding'],
            relevance: 0.8,
            category: 'ai-news'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <section className="py-20 bg-neutral-50 dark:bg-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            See What You'll Get
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">
            A preview of our curated AI newsletter format
          </p>
        </div>
        
        <div className="card max-w-4xl mx-auto p-8">
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                AI Breakthroughs & Research
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Latest papers, discoveries, and scientific advances in artificial intelligence.
              </p>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg animate-pulse">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-600 rounded mb-2"></div>
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-600 rounded mb-2"></div>
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-600 rounded w-2/3"></div>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg animate-pulse">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-600 rounded mb-2"></div>
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-600 rounded mb-2"></div>
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-600 rounded w-2/3"></div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center text-neutral-600 dark:text-neutral-400">
                <p>{error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
                  <div key={article.id} className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                      {article.title}
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      {article.summary}
                    </p>
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>Source: {article.source}</span>
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
} 