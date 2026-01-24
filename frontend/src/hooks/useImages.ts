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

  const fetchImages = useCallback(async (
    folderId: number,
    page: number,
    currentSortBy: 'filename' | 'date' | 'folder',
    currentSortDir: 'asc' | 'desc',
    fileTypes?: string[]
  ) => {
    // DEBUG: Set to false to reduce console noise
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

    if (DEBUG_ENABLED) {
      console.log(
        `%c[useImages] Loading page ${page}...`,
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

      // PERFORMANCE OPTIMIZATION: Only fetch the requested page
      // Backend handles pagination - no need to loop through all pages
      // This is 10x faster than fetching all 797 images!
      const pageStartTime = performance.now();

      if (DEBUG_ENABLED) {
        console.log(
          `%c[useImages] FETCH #${currentFetchId} - Fetching page ${page} from backend...`,
          'color: #2196F3;'
        );
      }

      const response = await api.getImages(
        folderId,
        page, // Use the requested page directly (no loop!)
        IMAGES_PER_PAGE,
        currentSortBy,
        currentSortDir,
        fileTypes
      );

      if (!response || typeof response.total_count !== 'number') {
        throw new Error(
          `Invalid API response for page ${page}: ${JSON.stringify(response)}`
        );
      }

      const totalCount = response.total_count;
      const imagesInThisPage = response.images?.length ?? 0;
      const allImages = response.images ?? []; // Just use this page's images
      const pageTime = (performance.now() - pageStartTime).toFixed(2);

      if (DEBUG_ENABLED) {
        console.log(
          `%c[useImages] FETCH #${currentFetchId} - Page ${page} loaded in ${pageTime}ms`,
          'color: #2196F3;',
          {
            imagesInPage: imagesInThisPage,
            totalInFolder: totalCount,
            pageSize: IMAGES_PER_PAGE,
            totalPages: Math.ceil(totalCount / IMAGES_PER_PAGE)
          }
        );
      }

      // Verify we're still the latest fetch
      if (currentFetchId !== fetchIdRef.current) {
        if (DEBUG_ENABLED) {
          console.warn(
            `%c[useImages] FETCH #${currentFetchId} was superseded by FETCH #${fetchIdRef.current} - NOT updating state!`,
            'color: #F44336; font-weight: bold;'
          );
        }
        return;
      }

      // Always update state with whatever backend returns
      if (DEBUG_ENABLED) {
        console.log(
          `%c[useImages] FETCH #${currentFetchId} - Updating state...`,
          'color: #9C27B0;'
        );
      }

      setImages(allImages);
      setTotalImages(totalCount);

      const fetchDuration = (performance.now() - fetchStartTime).toFixed(2);
      const totalPages = Math.ceil(totalCount / IMAGES_PER_PAGE) || 0;
      if (DEBUG_ENABLED) {
        console.log(
          `%c[useImages] FETCH #${currentFetchId} COMPLETE ✓`,
          'color: #4CAF50; font-weight: bold;',
          {
            imagesLoaded: allImages.length,
            totalPages,
            currentPage: page,
            totalDurationMs: fetchDuration
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
