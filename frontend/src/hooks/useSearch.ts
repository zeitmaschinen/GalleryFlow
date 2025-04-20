import { useState, useCallback } from 'react';
import { debounce } from '../utils/debounce';
import { logger } from '../services/logger';

interface UseSearchOptions {
  debounceMs?: number;
  maxHistory?: number;
  onSearch?: (query: string) => void;
}

export const useSearch = ({
  debounceMs = 300,
  maxHistory = 10,
  onSearch
}: UseSearchOptions = {}) => {
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fix debounce: accept unknown, narrow to string inside
  const debouncedSearch = debounce((...args: unknown[]) => {
    const searchQuery = typeof args[0] === 'string' ? args[0] : '';
    if (onSearch) {
      setIsSearching(true);
      try {
        onSearch(searchQuery);
        if (searchQuery) {
          setSearchHistory(prev => {
            const newHistory = [searchQuery, ...prev.filter(q => q !== searchQuery)];
            return newHistory.slice(0, maxHistory);
          });
        }
      } catch (error) {
        logger.error('Search error', error as Error);
      } finally {
        setIsSearching(false);
      }
    }
  }, debounceMs);

  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery);
    debouncedSearch(newQuery);
  }, [debouncedSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    if (onSearch) onSearch('');
  }, [onSearch]);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  return {
    query,
    searchHistory,
    isSearching,
    handleSearch,
    clearSearch,
    clearHistory
  };
};