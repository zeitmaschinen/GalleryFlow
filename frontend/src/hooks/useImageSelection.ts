import { useState, useCallback } from 'react';

export const useImageSelection = () => {
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());

  const toggleImageSelection = useCallback((imageId: number) => {
    setSelectedImages(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(imageId)) {
        newSelection.delete(imageId);
      } else {
        newSelection.add(imageId);
      }
      return newSelection;
    });
  }, []);

  const selectMultipleImages = useCallback((imageIds: number[]) => {
    setSelectedImages(prev => new Set([...prev, ...imageIds]));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedImages(new Set());
  }, []);

  const isSelected = useCallback((imageId: number) => {
    return selectedImages.has(imageId);
  }, [selectedImages]);

  return {
    selectedImages,
    toggleImageSelection,
    selectMultipleImages,
    clearSelection,
    isSelected,
    selectedCount: selectedImages.size
  };
};