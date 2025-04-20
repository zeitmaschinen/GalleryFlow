import { useState, useCallback } from 'react';

interface ErrorInfo {
  componentStack: string;
}

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export const useErrorBoundary = (onError?: (error: Error, errorInfo: ErrorInfo) => void) => {
  const [errorState, setErrorState] = useState<ErrorBoundaryState>({
    error: null,
    errorInfo: null
  });

  const handleError = useCallback((error: Error, errorInfo: ErrorInfo) => {
    setErrorState({ error, errorInfo });
    onError?.(error, errorInfo);
  }, [onError]);

  const resetError = useCallback(() => {
    setErrorState({ error: null, errorInfo: null });
  }, []);

  const getErrorMessage = useCallback(() => {
    if (!errorState.error) return '';

    return errorState.error.message || 'An unexpected error occurred';
  }, [errorState.error]);

  return {
    error: errorState.error,
    errorInfo: errorState.errorInfo,
    handleError,
    resetError,
    getErrorMessage,
    hasError: errorState.error !== null
  };
};