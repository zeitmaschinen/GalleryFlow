import React, { useState, useCallback } from 'react';
import { config } from '../config';
import { AppContextState, AppContextValue } from './AppContextTypes';
import { useSnackbar } from '../hooks/useSnackbar';
import { AppContext } from './AppContext';
import type { Image } from '../types/index';

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

// Fix: export AppProvider as default for compatibility
export default AppProvider;

// Export AppContext for direct context access
export { AppContext };
