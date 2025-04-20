import { useState, useCallback, useMemo } from 'react';
import type { Image } from '../types/index';
import { ImageMetadata, parseMetadata } from '../utils/metadataParser';

interface MetadataSearchOptions {
  searchFields?: (keyof ImageMetadata)[];
  caseSensitive?: boolean;
}

export const useMetadataSearch = (
  images: Image[],
  { searchFields = ['positivePrompt', 'negativePrompt', 'model'], caseSensitive = false }: MetadataSearchOptions = {}
) => {
  const [searchQuery, setSearchQuery] = useState('');

  const searchMetadata = useCallback((metadata: Record<string, unknown> | null, query: string) => {
    if (!metadata || !query) return false;
    
    const parsedMetadata = parseMetadata(metadata);
    const searchValue = caseSensitive ? query : query.toLowerCase();

    return searchFields.some(field => {
      const fieldValue = String(parsedMetadata[field] || '');
      const compareValue = caseSensitive ? fieldValue : fieldValue.toLowerCase();
      return compareValue.includes(searchValue);
    });
  }, [searchFields, caseSensitive]);

  const filteredImages = useMemo(() => {
    if (!searchQuery) return images;
    
    return images.filter(image => 
      searchMetadata(image.metadata_, searchQuery)
    );
  }, [images, searchQuery, searchMetadata]);

  return {
    searchQuery,
    setSearchQuery,
    filteredImages,
    searchMetadata
  };
};