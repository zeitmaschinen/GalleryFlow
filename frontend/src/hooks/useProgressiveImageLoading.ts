import { useState, useEffect, useRef } from 'react';

/**
 * Hook for progressive image loading with intersection observer
 * Loads images only when they're about to enter the viewport
 */
export const useProgressiveImageLoading = (_images: unknown[], rootMargin = '50px') => {
  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const imageId = entry.target.getAttribute('data-image-id');
            if (imageId) {
              setVisibleImages(prev => new Set(prev).add(imageId));
              // Stop observing this image once it's loaded
              observerRef.current?.unobserve(entry.target);
            }
          }
        });
      },
      {
        rootMargin, // Load images slightly before they're visible
        threshold: 0.1
      }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [rootMargin]);

  const registerImageRef = (imageId: string, element: HTMLElement | null) => {
    if (element) {
      imageRefs.current.set(imageId, element);
      observerRef.current?.observe(element);
    } else {
      const existingElement = imageRefs.current.get(imageId);
      if (existingElement) {
        observerRef.current?.unobserve(existingElement);
        imageRefs.current.delete(imageId);
      }
    }
  };

  const isImageVisible = (imageId: string) => visibleImages.has(imageId);

  return {
    registerImageRef,
    isImageVisible,
    visibleImagesCount: visibleImages.size
  };
};

/**
 * Hook for batched image loading to prevent overwhelming the browser
 */
export const useBatchedImageLoading = (images: unknown[], batchSize = 10) => {
  const [loadedBatches, setLoadedBatches] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadNextBatch = () => {
    if (loadedBatches * batchSize < images.length && !isLoading) {
      setIsLoading(true);
      // Simulate batch loading delay
      setTimeout(() => {
        setLoadedBatches(prev => prev + 1);
        setIsLoading(false);
      }, 100);
    }
  };

  const shouldLoadImage = (index: number) => {
    return index < (loadedBatches + 1) * batchSize;
  };

  useEffect(() => {
    // Load first batch immediately
    if (images.length > 0 && loadedBatches === 0) {
      loadNextBatch();
    }
  }, [images.length]);

  return {
    shouldLoadImage,
    loadNextBatch,
    isLoading,
    hasMoreToLoad: loadedBatches * batchSize < images.length
  };
};