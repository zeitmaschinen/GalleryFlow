import { useState, useCallback } from 'react';
import * as api from '../services/api';

export function useImages(IMAGES_PER_PAGE: number) {
  const [images, setImages] = useState<api.Image[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [errorImages, setErrorImages] = useState<string | null>(null);
  const [thumbnailSize, setThumbnailSize] = useState<number>(150);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const [sortBy, setSortBy] = useState<'filename' | 'date' | 'folder'>('filename');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([]);

  const fetchImages = useCallback(async (
    folderId: number,
    page: number,
    currentSortBy: 'filename' | 'date' | 'folder',
    currentSortDir: 'asc' | 'desc',
    fileTypes?: string[]
  ) => {
    setIsLoadingImages(true);
    setErrorImages(null);
    try {
      const response = await api.getImages(
        folderId,
        page,
        IMAGES_PER_PAGE,
        currentSortBy,
        currentSortDir,
        fileTypes
      );
      setImages(response.images);
      setTotalImages(response.total_count);
    } catch (err: unknown) {
      setErrorImages(err instanceof Error ? err.message : 'Could not load images.');
      setImages([]);
      setTotalImages(0);
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
