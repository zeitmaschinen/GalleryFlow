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
  visibilityChangeDelay = 800 // Increased delay to give browser more time to stabilize
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
  const [isTabActive, setIsTabActive] = useState(true); // Track if tab is fully active and ready
  const resizeHandler = useRef<(() => void) | null>(null); // allow debounce assignment, no 'any'
  const visibilityTimer = useRef<number | null>(null);
  const tabActiveTimer = useRef<number | null>(null);

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
      
      // Clear any existing timers
      if (visibilityTimer.current !== null) {
        window.clearTimeout(visibilityTimer.current);
      }
      
      if (tabActiveTimer.current !== null) {
        window.clearTimeout(tabActiveTimer.current);
      }
      
      // If becoming visible, implement a two-phase recovery
      if (isDocumentVisible) {
        // Phase 1: Immediately mark tab as not fully active (UI will respond to this)
        setIsTabActive(false);
        
        // Phase 2: Delay heavy operations
        visibilityTimer.current = window.setTimeout(() => {
          // Trigger a gentle resize to refresh layout calculations
          updateWindowSize();
          visibilityTimer.current = null;
          
          // Phase 3: Mark tab as fully active after all operations complete
          tabActiveTimer.current = window.setTimeout(() => {
            setIsTabActive(true);
            tabActiveTimer.current = null;
          }, 500); // Additional delay after initial operations
        }, visibilityChangeDelay);
      } else {
        // Tab is hidden
        setIsTabActive(false);
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
    isTabActive, // Expose the tab active state
    calculateColumns
  };
};