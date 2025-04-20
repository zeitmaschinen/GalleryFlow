import { useState, useCallback, useMemo } from 'react';
import type { Image } from '../types/index';
import { SortField } from '../types';
import { config } from '../config';
import { sortImages, filterImagesByType } from '../utils/imageHelpers';

interface SortAndFilterOptions {
  defaultSortField?: SortField;
  defaultSortDirection?: 'asc' | 'desc';
  defaultFileTypes?: string[];
}

export const useSortAndFilter = (
  images: Image[],
  {
    defaultSortField = config.ui.defaultSortField,
    defaultSortDirection = config.ui.defaultSortDirection,
    defaultFileTypes = []
  }: SortAndFilterOptions = {}
) => {
  const [sortField, setSortField] = useState(defaultSortField);
  const [sortDirection, setSortDirection] = useState(defaultSortDirection);
  const [selectedTypes, setSelectedTypes] = useState(defaultFileTypes);

  const toggleSortDirection = useCallback(() => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  const toggleFileType = useCallback((type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  }, []);

  const processedImages = useMemo(() => {
    let result = [...images];
    
    // Apply file type filtering
    if (selectedTypes.length > 0) {
      result = filterImagesByType(result, selectedTypes);
    }
    
    // Apply sorting
    result = sortImages(result, sortField as keyof Image | 'folder', sortDirection);
    
    return result;
  }, [images, selectedTypes, sortField, sortDirection]);

  return {
    sortField,
    sortDirection,
    selectedTypes,
    setSortField,
    setSortDirection,
    setSelectedTypes,
    toggleSortDirection,
    toggleFileType,
    processedImages
  };
};