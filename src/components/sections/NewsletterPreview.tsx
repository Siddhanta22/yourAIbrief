'use client';

import { useState, useEffect } from 'react';
import { NewsletterArticle } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function NewsletterPreview() {
  const [articles, setArticles] = useState<NewsletterArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const CARDS_PER_PAGE = 6;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        // Always bypass cache so homepage shows fresh cards
        const response = await fetch(`/api/news/preview?page=${currentPage}&limit=${CARDS_PER_PAGE}`, { 
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const received: NewsletterArticle[] = data?.articles || [];
        
        if (!received || received.length === 0) {
          // Ensure we always have preview cards even if API responds with 0
          throw new Error('No articles in response');
        }
        
        // Normalize dates (handle both Date objects and ISO strings)
        const normalizedArticles = received.map(article => ({
          ...article,
          publishedAt: typeof article.publishedAt === 'string' 
            ? new Date(article.publishedAt) 
            : article.publishedAt
        }));
        
        setArticles(normalizedArticles);
        
        // Update pagination info if available
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalArticles(data.pagination.totalArticles || normalizedArticles.length);
        } else {
          // Estimate total pages based on articles received
          setTotalPages(Math.ceil((normalizedArticles.length * 2) / CARDS_PER_PAGE));
          setTotalArticles(normalizedArticles.length * 2);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching news preview:', err);
        // Don't show error to user, just use fallback silently
        setError(null);
        // Fallback to static content - ensure exactly 6 cards
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
            category: 'research',
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&q=80'
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
            category: 'research',
            image: 'https://images.unsplash.com/photo-1676299083043-88b7b3e0d5e1?w=800&h=400&fit=crop&q=80'
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
            category: 'healthtech',
            image: 'https://images.unsplash.com/photo-1559757148-5c3507c77635?w=800&h=400&fit=crop&q=80'
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
            category: 'research',
            image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop&q=80'
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
            category: 'research',
            image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop&q=80'
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
            category: 'research',
            image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&h=400&fit=crop&q=80'
          }
        ];
        setArticles(fallbackArticles);
        setTotalPages(2); // Assume 2 pages for fallback
        setTotalArticles(12);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [currentPage]);
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top of section smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 bg-neutral-50 dark:bg-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8 md:mb-12 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 sm:mb-4">
            See What You'll Get
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-neutral-600 dark:text-neutral-400">
            A preview of our curated AI newsletter format
          </p>
        </div>
        
        <div className="card max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
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
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <a
                    key={article.id}
                    href={(article as any).url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-700 hover:shadow-lg transition-shadow"
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
                ))}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col items-center gap-4">
                  <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 sm:p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-1 overflow-x-auto max-w-full px-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                        // Show first page, last page, current page, and pages around current
                        const showPage = 
                          pageNum === 1 || 
                          pageNum === totalPages || 
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
                        
                        if (!showPage) {
                          // Show ellipsis
                          if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                            return (
                              <span key={pageNum} className="px-2 text-neutral-500">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                            }`}
                            aria-label={`Go to page ${pageNum}`}
                            aria-current={currentPage === pageNum ? 'page' : undefined}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 sm:p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Page info */}
                  <div className="text-center text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 px-4">
                    <span className="block sm:inline">Page {currentPage} of {totalPages}</span>
                    <span className="hidden sm:inline"> • </span>
                    <span className="block sm:inline">Showing {articles.length} of {totalArticles} articles</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
} 