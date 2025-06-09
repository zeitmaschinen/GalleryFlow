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
  visibilityChangeDelay?: number;
}

export const useWindowEvents = ({
  mobileBreakpoint = 768,
  tabletBreakpoint = 1024,
  debounceMs = 100,
  visibilityChangeDelay = 300
}: UseWindowEventsOptions = {}) => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < mobileBreakpoint,
    isTablet: window.innerWidth >= mobileBreakpoint && window.innerWidth < tabletBreakpoint,
    isDesktop: window.innerWidth >= tabletBreakpoint
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const resizeHandler = useRef<(() => void) | null>(null); // allow debounce assignment, no 'any'
  const visibilityTimer = useRef<number | null>(null);

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
    
    // Handle visibility change with a delay to prevent immediate heavy operations
    const handleVisibilityChange = () => {
      const isDocumentVisible = !document.hidden;
      setIsVisible(isDocumentVisible);
      
      // Clear any existing timer
      if (visibilityTimer.current !== null) {
        window.clearTimeout(visibilityTimer.current);
      }
      
      // If becoming visible, delay heavy operations
      if (isDocumentVisible) {
        visibilityTimer.current = window.setTimeout(() => {
          // Trigger a gentle resize to refresh layout calculations
          // This helps prevent the app from freezing when returning to the tab
          updateWindowSize();
          visibilityTimer.current = null;
        }, visibilityChangeDelay);
      }
    };

    resizeHandler.current = debounce(updateWindowSize, debounceMs);
    window.addEventListener('resize', resizeHandler.current!);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', resizeHandler.current!);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (visibilityTimer.current !== null) {
        window.clearTimeout(visibilityTimer.current);
      }
    };
  }, [updateWindowSize, debounceMs, visibilityChangeDelay]);

  const calculateColumns = useCallback((minWidth: number): number => {
    return Math.max(1, Math.floor(windowSize.width / minWidth));
  }, [windowSize.width]);

  return {
    ...windowSize,
    isOnline,
    isVisible,
    calculateColumns
  };
};