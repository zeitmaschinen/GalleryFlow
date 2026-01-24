import { useState, useCallback, useRef } from 'react';
import * as api from '../services/api';

export function useImages(IMAGES_PER_PAGE: number) {
  const [images, setImages] = useState<api.Image[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [errorImages, setErrorImages] = useState<string | null>(null);
  const [thumbnailSize, setThumbnailSize] = useState<number>(150);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const [sortBy, setSortBy] = useState<'filename' | 'date' | 'folder'>('folder');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchIdRef = useRef<number>(0);
  const previousValidImageCountRef = useRef<number>(0); // === Track last valid image count ===

  const fetchImages = useCallback(async (
    folderId: number,
    page: number,
    currentSortBy: 'filename' | 'date' | 'folder',
    currentSortDir: 'asc' | 'desc',
    fileTypes?: string[]
  ) => {
    // === DEBUG CUSTOMIZATION: Set to false to reduce console noise ===
    const DEBUG_ENABLED = true;

    const currentFetchId = ++fetchIdRef.current;
    const fetchStartTime = performance.now();

    if (DEBUG_ENABLED) {
      console.log(
        `%c[useImages] FETCH START #${currentFetchId}`,
        'color: #4CAF50; font-weight: bold;',
        {
          folderId,
          page,
          sortBy: currentSortBy,
          sortDir: currentSortDir,
          fileTypes: fileTypes?.length ? fileTypes : 'none',
          timestamp: new Date().toISOString()
        }
      );
    }

    if (abortControllerRef.current) {
      if (DEBUG_ENABLED) {
        console.log(
          `%c[useImages] Aborting FETCH #${currentFetchId - 1}`,
          'color: #FF9800;',
          { reason: 'New fetch started' }
        );
      }
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    if (DEBUG_ENABLED) {
      console.log(
        `%c[useImages] Created new AbortController for FETCH #${currentFetchId}`,
        'color: #FF9800;'
      );
    }

    setIsLoadingImages(true);
    setErrorImages(null);
    // === CHANGE: Don't immediately clear images, keep showing old ones while loading ===
    // setImages([]); 

    if (DEBUG_ENABLED) {
      console.log(
        `%c[useImages] Loading... (keeping previous images visible)`,
        'color: #FFC107; font-style: italic;'
      );
    }

    try {
      if (signal.aborted) {
        if (DEBUG_ENABLED) {
          console.warn(
            `%c[useImages] FETCH #${currentFetchId} was aborted before starting!`,
            'color: #F44336;'
          );
        }
        setIsLoadingImages(false);
        return;
      }

      const allImages: api.Image[] = [];
      let pageNumber = 1;
      let totalCount = 0;
      let hasMorePages = true;
      let completedPages = 0;
      let zeroImageAttempts = 0; // === Track if we get 0 images ===

      while (hasMorePages) {
        if (signal.aborted) {
          if (DEBUG_ENABLED) {
            console.warn(
              `%c[useImages] FETCH #${currentFetchId} ABORTED during page ${pageNumber}`,
              'color: #F44336;',
              { completedPages, imagesLoaded: allImages.length }
            );
          }
          setIsLoadingImages(false);
          return;
        }

        try {
          if (DEBUG_ENABLED) {
            console.log(
              `%c[useImages] FETCH #${currentFetchId} - Fetching page ${pageNumber}...`,
              'color: #2196F3;'
            );
          }

          const pageStartTime = performance.now();
          const response = await api.getImages(
            folderId,
            pageNumber,
            IMAGES_PER_PAGE,
            currentSortBy,
            currentSortDir,
            fileTypes
          );

          if (!response || typeof response.total_count !== 'number') {
            throw new Error(
              `Invalid API response on page ${pageNumber}: ${JSON.stringify(response)}`
            );
          }

          totalCount = response.total_count;
          const imagesInThisPage = response.images?.length ?? 0;
          allImages.push(...(response.images ?? []));
          completedPages++;
          const pageTime = (performance.now() - pageStartTime).toFixed(2);

          // === NEW: Track if we get 0 images on page 1 ===
          if (pageNumber === 1 && imagesInThisPage === 0 && totalCount === 0) {
            zeroImageAttempts++;
            if (DEBUG_ENABLED) {
              console.warn(
                `%c[useImages] FETCH #${currentFetchId} - Page 1 returned 0 images (attempt ${zeroImageAttempts}/5)`,
                'color: #FF9800;',
                { backend_might_be_scanning: true }
              );
            }

            // === FIXED: Always retry when page 1 returns 0, not just when we have previous images ===
            // Increased to 5 attempts with 1000ms wait (was 3 attempts with 500ms)
            // This gives backend more time to complete folder scan
            if (zeroImageAttempts < 5) {
              if (DEBUG_ENABLED) {
                console.log(
                  `%c[useImages] FETCH #${currentFetchId} - Retrying in 1000ms (attempt ${zeroImageAttempts + 1}/5)...`,
                  'color: #FF9800;'
                );
              }
              await new Promise(resolve => setTimeout(resolve, 1000)); // === Increased from 500ms to 1000ms ===
              // Reset page to retry from page 1
              pageNumber = 1;
              allImages.length = 0;
              totalCount = 0;
              continue;
            }
          }

          if (DEBUG_ENABLED) {
            console.log(
              `%c[useImages] FETCH #${currentFetchId} - Page ${pageNumber} complete in ${pageTime}ms`,
              'color: #2196F3;',
              {
                imagesInPage: imagesInThisPage,
                totalLoadedSoFar: allImages.length,
                totalInFolder: totalCount,
                percentComplete: `${totalCount > 0 ? Math.round((allImages.length / totalCount) * 100) : 'NaN'}%`,
                estimatedRemaining: Math.max(0, totalCount - allImages.length)
              }
            );
          }

          if (allImages.length >= totalCount) {
            hasMorePages = false;
          } else {
            pageNumber++;
            if (DEBUG_ENABLED) {
              console.log(
                `%c[useImages] FETCH #${currentFetchId} - Waiting 50ms before next page...`,
                'color: #666; font-size: 0.9em;'
              );
            }
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        } catch (pageError) {
          const isAborted = pageError instanceof Error && pageError.name === 'AbortError';
          if (isAborted) {
            if (DEBUG_ENABLED) {
              console.warn(
                `%c[useImages] FETCH #${currentFetchId} - Page ${pageNumber} ABORTED`,
                'color: #F44336;'
              );
            }
            setIsLoadingImages(false);
            return;
          }

          console.error(
            `%c[useImages] FETCH #${currentFetchId} - ERROR fetching page ${pageNumber}:`,
            'color: #F44336;',
            pageError
          );
          hasMorePages = false;
        }
      }

      // === CRITICAL: Verify we're still the latest fetch ===
      if (currentFetchId !== fetchIdRef.current) {
        if (DEBUG_ENABLED) {
          console.warn(
            `%c[useImages] FETCH #${currentFetchId} was superseded by FETCH #${fetchIdRef.current} - NOT updating state!`,
            'color: #F44336; font-weight: bold;'
          );
        }
        return;
      }

      // === NEW: Don't update with 0 images if we previously had data ===
      if (allImages.length === 0 && previousValidImageCountRef.current > 0) {
        if (DEBUG_ENABLED) {
          console.warn(
            `%c[useImages] FETCH #${currentFetchId} returned 0 images but we had ${previousValidImageCountRef.current} previously - SKIPPING STATE UPDATE`,
            'color: #FF9800; font-weight: bold;',
            { reason: 'Backend may be scanning/refreshing' }
          );
        }
        setIsLoadingImages(false);
        return;
      }

      if (DEBUG_ENABLED) {
        console.log(
          `%c[useImages] FETCH #${currentFetchId} - All ${completedPages} pages fetched. Updating state...`,
          'color: #9C27B0;',
          {
            totalImages: allImages.length,
            totalPages: Math.ceil(totalCount / IMAGES_PER_PAGE),
            timeElapsedSoFar: (performance.now() - fetchStartTime).toFixed(2) + 'ms'
          }
        );
      }

      setImages(allImages);
      setTotalImages(totalCount);
      
      // === NEW: Track valid image count ===
      if (allImages.length > 0) {
        previousValidImageCountRef.current = allImages.length;
      }

      const fetchDuration = (performance.now() - fetchStartTime).toFixed(2);
      const totalPages = Math.ceil(totalCount / IMAGES_PER_PAGE) || 0;
      if (DEBUG_ENABLED) {
        console.log(
          `%c[useImages] FETCH #${currentFetchId} COMPLETE ✓`,
          'color: #4CAF50; font-weight: bold;',
          {
            imagesLoaded: allImages.length,
            totalPages,
            totalDurationMs: fetchDuration,
            averagePerPageMs: totalPages > 0 ? (parseInt(fetchDuration) / totalPages).toFixed(2) : 'N/A',
            imagesPerSecond: parseInt(fetchDuration) > 0 ? (allImages.length / (parseInt(fetchDuration) / 1000)).toFixed(0) : 'N/A'
          }
        );
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Could not load images.';
      setErrorImages(errorMessage);
      setImages([]);
      setTotalImages(0);

      console.error(
        `%c[useImages] FETCH #${currentFetchId} FAILED ✗`,
        'color: #F44336; font-weight: bold;',
        {
          error: errorMessage,
          durationMs: (performance.now() - fetchStartTime).toFixed(2)
        }
      );
    } finally {
      setIsLoadingImages(false);
    }
  }, [IMAGES_PER_PAGE]);

  return {
    images,
    isLoadingImages,
    errorImages,
    thumbnailSize,
    setThumbnailSize,
    currentPage,
    setCurrentPage,
    totalImages,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    selectedFileTypes,
    setSelectedFileTypes,
    fetchImages,
  };
}