import React, { useState, useCallback } from 'react';
import type { AppContextValue, AppContextState } from './AppContextTypes';
import type { Image } from '../services/api';
import { config } from '../config';
import { useSnackbar } from '../hooks/useSnackbar';
import { AppContext } from './AppContextCore';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppContextState>({
    selectedFolderId: null,
    sortBy: config.ui.defaultSortField,
    sortDirection: config.ui.defaultSortDirection,
    selectedTypes: [],
    images: [],
    isLoading: false
  });

  const { showSnackbar } = useSnackbar();

  const setSelectedFolder = useCallback((id: number | null) => {
    setState(prev => ({ ...prev, selectedFolderId: id }));
  }, []);

  const setSortBy = useCallback((sort: string) => {
    setState(prev => ({ ...prev, sortBy: sort }));
  }, []);

  const setSortDirection = useCallback((direction: 'asc' | 'desc') => {
    setState(prev => ({ ...prev, sortDirection: direction }));
  }, []);

  const setSelectedTypes = useCallback((types: string[]) => {
    setState(prev => ({ ...prev, selectedTypes: types }));
  }, []);

  const setImages = useCallback((images: Image[]) => {
    setState(prev => ({ ...prev, images }));
  }, []);

  const setIsLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const value: AppContextValue = {
    ...state,
    setSelectedFolder,
    setSortBy,
    setSortDirection,
    setSelectedTypes,
    setImages,
    setIsLoading,
    showMessage: showSnackbar
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Default export for compatibility
export default AppProvider;