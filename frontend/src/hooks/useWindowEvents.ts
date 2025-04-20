import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from '../utils/debounce';

interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

interface UseWindowEventsOptions {
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
  debounceMs?: number;
}

export const useWindowEvents = ({
  mobileBreakpoint = 768,
  tabletBreakpoint = 1024,
  debounceMs = 100
}: UseWindowEventsOptions = {}) => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < mobileBreakpoint,
    isTablet: window.innerWidth >= mobileBreakpoint && window.innerWidth < tabletBreakpoint,
    isDesktop: window.innerWidth >= tabletBreakpoint
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const resizeHandler = useRef<() => void | null>(null);

  const updateWindowSize = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    setWindowSize({
      width,
      height,
      isMobile: width < mobileBreakpoint,
      isTablet: width >= mobileBreakpoint && width < tabletBreakpoint,
      isDesktop: width >= tabletBreakpoint
    });
  }, [mobileBreakpoint, tabletBreakpoint]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    resizeHandler.current = debounce(updateWindowSize, debounceMs);
    window.addEventListener('resize', resizeHandler.current!);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('resize', resizeHandler.current!);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateWindowSize, debounceMs]);

  const calculateColumns = useCallback((minWidth: number): number => {
    return Math.max(1, Math.floor(windowSize.width / minWidth));
  }, [windowSize.width]);

  return {
    ...windowSize,
    isOnline,
    calculateColumns
  };
};