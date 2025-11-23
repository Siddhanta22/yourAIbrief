'use client';

import { useState, useEffect, useRef } from 'react';
import { NewsletterArticle } from '@/types';
import { NewsCard } from './NewsCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NewsGridProps {
  title?: string;
  subtitle?: string;
  maxCards?: number;
  showTitle?: boolean;
  className?: string;
  enablePagination?: boolean;
}

export function NewsGrid({ 
  title = "See What You'll Get", 
  subtitle = "A preview of our curated AI newsletter format",
  maxCards = 6,
  showTitle = true,
  className = '',
  enablePagination = true
}: NewsGridProps) {
  const [articles, setArticles] = useState<NewsletterArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const CARDS_PER_PAGE = 6;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use pagination if enabled, otherwise fetch all
        const url = enablePagination 
          ? `/api/news/preview?page=${currentPage}&limit=${CARDS_PER_PAGE}`
          : '/api/news/preview';
        
        const response = await fetch(url, { 
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if API returned an error
        if (!data.success) {
          throw new Error(data.message || data.error || 'Failed to fetch news');
        }
        
        const received: NewsletterArticle[] = data?.articles || [];
        
        if (!received || received.length === 0) {
          throw new Error(data.message || 'No articles in response');
        }
        
        // Normalize dates (handle both Date objects and ISO strings)
        const normalizedArticles = received.map(article => ({
          ...article,
          publishedAt: typeof article.publishedAt === 'string' 
            ? new Date(article.publishedAt) 
            : article.publishedAt
        }));
        
        if (enablePagination) {
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
        } else {
          // Limit to maxCards if pagination is disabled
          setArticles(normalizedArticles.slice(0, maxCards));
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching news preview:', err);
        const errorMessage = err?.message || 'Failed to fetch news. Please check that NEWS_API_KEY is configured correctly in Vercel.';
        setError(errorMessage);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [currentPage, maxCards, enablePagination]);
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to the section instead of top of page
      setTimeout(() => {
        if (sectionRef.current) {
          const offset = 100; // Offset for fixed navigation
          const elementPosition = sectionRef.current.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100); // Small delay to ensure DOM is updated
    }
  };

  return (
    <section ref={sectionRef} className={`py-20 bg-neutral-50 dark:bg-neutral-800 ${className}`}>
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
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                  Failed to Load News
                </h3>
                <p className="text-red-700 dark:text-red-300 mb-4">
                  {error}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Please ensure NEWS_API_KEY is properly configured in Vercel environment variables. 
                  See NEWS_API_SETUP.md for instructions.
                </p>
              </div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center text-neutral-600 dark:text-neutral-400 py-12">
              <p>No articles available right now. Please check back later.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
              
              {/* Pagination Controls */}
              {enablePagination && totalPages > 1 && (
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
