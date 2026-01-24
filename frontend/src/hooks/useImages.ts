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

  const fetchImages = useCallback(async (
    folderId: number,
    page: number,
    currentSortBy: 'filename' | 'date' | 'folder',
    currentSortDir: 'asc' | 'desc',
    fileTypes?: string[]
  ) => {
    // Cancel previous requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoadingImages(true);
    setErrorImages(null);
    setImages([]);

    try {
      // Fetch all images by loading all pages sequentially
      const allImages: api.Image[] = [];
      let pageNumber = 1;
      let totalCount = 0;
      let hasMorePages = true;

      while (hasMorePages) {
        try {
          const response = await api.getImages(
            folderId,
            pageNumber,
            IMAGES_PER_PAGE,
            currentSortBy,
            currentSortDir,
            fileTypes
          );

          totalCount = response.total_count;
          allImages.push(...response.images);

          // Check if there are more pages to fetch
          if (allImages.length >= totalCount) {
            hasMorePages = false;
          } else {
            pageNumber++;
            // Small delay between requests to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        } catch (pageError) {
          console.error(`Error fetching page ${pageNumber}:`, pageError);
          hasMorePages = false;
        }
      }

      setImages(allImages);
      setTotalImages(totalCount);
      
      // Log what we loaded for debugging
      console.log(`[useImages] Loaded ${allImages.length} images total (${Math.ceil(totalCount / IMAGES_PER_PAGE)} pages)`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Could not load images.';
      setErrorImages(errorMessage);
      setImages([]);
      setTotalImages(0);
      console.error('[useImages] Error:', errorMessage);
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
