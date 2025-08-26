'use client';

import { useState, useEffect } from 'react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';
const PAGE_SIZE = 12;

export default function LiveHeadlinesSection({ news: propNews }: { news?: any[] }) {
  const [news, setNews] = useState<any[]>(propNews || []);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/news?page=${page}&pageSize=${PAGE_SIZE}`)
      .then(res => res.json())
      .then(data => {
        setNews(data.articles || []);
        setTotalResults(data.totalResults || 0);
        setLoading(false);
      });
  }, [page]);

  // Use the server-filtered list as-is to keep page sizes consistent
  const hasNews = (news || []).length > 0;
  const totalPages = Math.ceil(totalResults / PAGE_SIZE);

  return (
    <div className="w-full px-0 sm:px-0 py-12 max-w-none">
      <h2 className="text-3xl font-bold text-primary-700 dark:text-primary-300 text-center mb-10 tracking-tight">What’s Popping in AI?</h2>
      {loading ? (
        <div className="text-center text-neutral-400 py-24">Loading...</div>
      ) : hasNews ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-12 w-full px-4 sm:px-8 max-w-screen-2xl mx-auto">
            {(news || []).map((article, idx) => (
              <a
                key={article.url + idx}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-200 overflow-hidden group flex flex-col cursor-pointer focus:outline-none border border-neutral-100 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-600"
                tabIndex={0}
                style={{ minHeight: 520, padding: '2.5rem' }}
              >
                <div className="relative h-64 w-full overflow-hidden mb-6">
                  <img
                    src={article.image || FALLBACK_IMAGE}
                    alt={article.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex items-center justify-between">
                    <span className="text-base text-white font-semibold uppercase tracking-wide opacity-90">
                      {article.source}
                    </span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="font-bold text-2xl text-neutral-900 dark:text-neutral-100 mb-3 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
                    {article.title}
                  </div>
                  <div className="text-neutral-600 dark:text-neutral-300 text-lg mb-4 line-clamp-3">
                    {article.summary}
                  </div>
                  <div className="mt-auto flex items-center justify-between text-base text-neutral-400 dark:text-neutral-500">
                    <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}</span>
                    <span className="ml-2 px-3 py-1 rounded bg-primary-100 text-primary-700 text-base tracking-wide">
                      {article.categoryLabel || 'Other'}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12 gap-2">
              <button
                className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >First</button>
              <button
                className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >Back</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 2), Math.min(totalPages, page + 1)).map(p => (
                <button
                  key={p}
                  className={`px-3 py-1 rounded border text-sm ${p === page ? 'bg-primary-600 text-white' : ''}`}
                  onClick={() => setPage(p)}
                  disabled={p === page}
                >{p}</button>
              ))}
              <button
                className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >Next</button>
              <button
                className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
              >Last</button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-neutral-500 dark:text-neutral-400 text-lg py-24">
          No news found. Please check back soon!
        </div>
      )}
    </div>
  );
} 