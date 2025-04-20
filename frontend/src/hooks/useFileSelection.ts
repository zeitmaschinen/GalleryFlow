import { useState, useCallback } from 'react';
import { useSnackbar } from './useSnackbar';
import { api } from '../services/api';
import { logger } from '../services/logger';

interface UseFileSelectionOptions {
  onSelectionChange?: (selectedIds: Set<number>) => void;
}

export const useFileSelection = ({ onSelectionChange }: UseFileSelectionOptions = {}) => {
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const { showSnackbar } = useSnackbar();

  const toggleSelection = useCallback((id: number) => {
    setSelectedFiles(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  }, [onSelectionChange]);

  const selectMultiple = useCallback((ids: number[]) => {
    setSelectedFiles(prev => {
      const newSelection = new Set([...prev, ...ids]);
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  }, [onSelectionChange]);

  const clearSelection = useCallback(() => {
    setSelectedFiles(new Set());
    onSelectionChange?.(new Set());
  }, [onSelectionChange]);

  const deleteSelected = useCallback(async () => {
    try {
      const promises = Array.from(selectedFiles).map(id => api.deleteImage(id));
      await Promise.all(promises);
      showSnackbar(`Successfully deleted ${selectedFiles.size} files`, 'success');
      clearSelection();
    } catch (error) {
      logger.error('Failed to delete selected files', error as Error);
      showSnackbar('Failed to delete some files', 'error');
    }
  }, [selectedFiles, clearSelection, showSnackbar]);

  return {
    selectedFiles,
    toggleSelection,
    selectMultiple,
    clearSelection,
    deleteSelected,
    hasSelection: selectedFiles.size > 0,
    selectionCount: selectedFiles.size
  };
};