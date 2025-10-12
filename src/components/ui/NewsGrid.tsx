'use client';

import { useState, useEffect } from 'react';
import { NewsletterArticle } from '@/types';
import { NewsCard } from './NewsCard';

interface NewsGridProps {
  title?: string;
  subtitle?: string;
  maxCards?: number;
  showTitle?: boolean;
  className?: string;
}

export function NewsGrid({ 
  title = "See What You'll Get", 
  subtitle = "A preview of our curated AI newsletter format",
  maxCards = 6,
  showTitle = true,
  className = ''
}: NewsGridProps) {
  const [articles, setArticles] = useState<NewsletterArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/news/preview', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const received: NewsletterArticle[] = data?.articles || [];
        
        if (!received || received.length === 0) {
          throw new Error('No articles in response');
        }
        
        // Limit to maxCards
        setArticles(received.slice(0, maxCards));
      } catch (err) {
        console.error('Error fetching news preview:', err);
        setError('Failed to load news preview');
        
        // Fallback to static content
        const fallbackArticles: NewsletterArticle[] = [
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
          },
          {
            id: '3',
            title: 'AI-Powered Drug Discovery Accelerates by 10x',
            summary: 'New machine learning algorithms are reducing drug discovery timelines from years to months.',
            url: '#',
            source: 'Nature',
            publishedAt: new Date(),
            tags: ['healthtech', 'drug-discovery', 'ml'],
            relevance: 0.7,
            category: 'healthtech'
          },
          {
            id: '4',
            title: 'Quantum Computing Breakthrough for AI Training',
            summary: 'Quantum algorithms could dramatically speed up AI model training and inference.',
            url: '#',
            source: 'Science',
            publishedAt: new Date(),
            tags: ['quantum', 'ai-training', 'breakthrough'],
            relevance: 0.6,
            category: 'research'
          },
          {
            id: '5',
            title: 'Enterprise AI Adoption Reaches 85% in Fortune 500',
            summary: 'Latest survey shows dramatic increase in AI implementation across major corporations.',
            url: '#',
            source: 'TechCrunch',
            publishedAt: new Date(),
            tags: ['enterprise', 'adoption', 'survey'],
            relevance: 0.8,
            category: 'industry'
          },
          {
            id: '6',
            title: 'Neural Networks Achieve Human-Level Reasoning',
            summary: 'New research demonstrates AI systems matching human performance in complex reasoning tasks.',
            url: '#',
            source: 'Nature',
            publishedAt: new Date(),
            tags: ['reasoning', 'human-level', 'neural-networks'],
            relevance: 0.9,
            category: 'research'
          }
        ];
        
        setArticles(fallbackArticles.slice(0, maxCards));
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [maxCards]);

  return (
    <section className={`py-20 bg-neutral-50 dark:bg-neutral-800 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showTitle && (
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              {title}
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400">
              {subtitle}
            </p>
          </div>
        )}
        
        <div className="card max-w-6xl mx-auto p-6 sm:p-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(maxCards)].map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-700 animate-pulse">
                  <div className="h-36 bg-neutral-200 dark:bg-neutral-600" />
                  <div className="p-4">
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-600 rounded mb-2"></div>
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-600 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center text-neutral-600 dark:text-neutral-400">
              <p>No preview articles available right now. Please check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
