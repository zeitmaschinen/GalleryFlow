import { useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  message: string;
}

interface UseLoadingStateOptions {
  initialMessage?: string;
  onError?: (error: Error) => void;
}

export const useLoadingState = ({ initialMessage = '', onError }: UseLoadingStateOptions = {}) => {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    message: initialMessage
  });

  const startLoading = useCallback((message: string = '') => {
    setState({
      isLoading: true,
      error: null,
      message
    });
  }, []);

  const stopLoading = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      message: ''
    }));
  }, []);

  const setError = useCallback((error: Error) => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      error,
      message: error.message
    }));
    onError?.(error);
  }, [onError]);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      message: ''
    }));
  }, []);

  const updateMessage = useCallback((message: string) => {
    setState(prev => ({
      ...prev,
      message
    }));
  }, []);

  const withLoading = useCallback(async <T,>(
    operation: () => Promise<T>,
    loadingMessage: string = ''
  ): Promise<T> => {
    startLoading(loadingMessage);
    try {
      const result = await operation();
      stopLoading();
      return result;
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  }, [startLoading, stopLoading, setError]);

  return {
    ...state,
    startLoading,
    stopLoading,
    setError,
    clearError,
    updateMessage,
    withLoading
  };
};