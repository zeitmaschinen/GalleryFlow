import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '../services/logger';

interface UseInfiniteScrollOptions {
  fetchMore: (page: number) => Promise<unknown[]>;
  initialPage?: number;
  pageSize?: number;
  threshold?: number;
}

export const useInfiniteScroll = ({
  fetchMore,
  initialPage = 1,
  pageSize = 20,
  threshold = 200
}: UseInfiniteScrollOptions) => {
  const [items, setItems] = useState<unknown[]>([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  // Provide initial value for useRef
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLElement | null>(null);

  const loadMoreItems = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newItems = await fetchMore(page);
      if (newItems.length < pageSize) {
        setHasMore(false);
      }
      setItems(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
    } catch (error) {
      logger.error('Failed to fetch more items', error as Error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [fetchMore, page, pageSize, loading, hasMore]);

  const resetScroll = useCallback(() => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setLoading(false);
  }, [initialPage]);

  const lastItemRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreItems();
      }
    }, {
      root: null,
      rootMargin: `${threshold}px`
    });

    if (node) {
      observer.current.observe(node);
      lastElementRef.current = node;
    }
  }, [loading, hasMore, loadMoreItems, threshold]);

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return {
    items,
    loading,
    hasMore,
    lastItemRef,
    resetScroll,
    loadMoreItems
  };
};