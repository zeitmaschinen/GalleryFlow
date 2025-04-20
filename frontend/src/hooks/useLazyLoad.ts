import { useEffect, useRef, useState, useCallback } from 'react';

interface UseLazyLoadOptions {
  rootMargin?: string;
  threshold?: number;
}

export const useLazyLoad = (
  { rootMargin = '50px', threshold = 0.1 }: UseLazyLoadOptions = {}
) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setIsLoaded(false);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !window.IntersectionObserver) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [rootMargin, threshold]);

  return {
    elementRef,
    isVisible,
    isLoaded,
    handleLoad,
    handleError
  };
};