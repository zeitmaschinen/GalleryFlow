import { useState, useCallback, useEffect, useRef } from 'react';
import { debounce } from '../utils/debounce';

interface VirtualScrollOptions {
  itemHeight: number;
  overscan?: number;
  debounceMs?: number;
}

export const useVirtualScroll = <T>(
  items: T[],
  containerRef: React.RefObject<HTMLElement>,
  { itemHeight, overscan = 3, debounceMs = 100 }: VirtualScrollOptions
) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const scrollTop = useRef(0);

  const calculateRange = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const currentScrollTop = container.scrollTop;
    scrollTop.current = currentScrollTop;

    const containerHeight = container.clientHeight;
    const startIndex = Math.max(0, Math.floor(currentScrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length,
      Math.ceil((currentScrollTop + containerHeight) / itemHeight) + overscan
    );

    setVisibleRange({ start: startIndex, end: endIndex });
  }, [containerRef, itemHeight, items.length, overscan]);

  const debouncedCalculateRange = useCallback(
    () => debounce(calculateRange, debounceMs),
    [calculateRange, debounceMs]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    calculateRange();
    container.addEventListener('scroll', debouncedCalculateRange);
    window.addEventListener('resize', debouncedCalculateRange);

    return () => {
      container.removeEventListener('scroll', debouncedCalculateRange);
      window.removeEventListener('resize', debouncedCalculateRange);
    };
  }, [containerRef, debouncedCalculateRange, calculateRange]);

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    start: visibleRange.start,
    end: visibleRange.end
  };
};