import { useState, useCallback, useRef, useEffect } from 'react';
import type { Image } from '../types/index';
import { useSnackbar } from './useSnackbar';
import { logger } from '../services/logger';

interface ClipboardOptions {
  onCopy?: (text: string) => void;
  onError?: (error: Error) => void;
}

interface ClipboardError extends Error {
  name: 'ClipboardError';
  code?: string;
}

const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

const createClipboardError = (message: string, code?: string): ClipboardError => {
  const error = new Error(message) as ClipboardError;
  error.name = 'ClipboardError';
  error.code = code;
  return error;
};

const isValidImageType = (type: string) => SUPPORTED_IMAGE_TYPES.includes(type);

const formatMetadata = (metadata: unknown): string => {
  try {
    return JSON.stringify(metadata, null, 2);
  } catch {
    return JSON.stringify({ error: 'Invalid metadata format' });
  }
};

export const useClipboard = ({ onCopy, onError }: ClipboardOptions = {}) => {
  const [hasCopied, setHasCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { showSnackbar } = useSnackbar();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const resetCopyState = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setHasCopied(false), 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setHasCopied(true);
      onCopy?.(text);
      showSnackbar('Text copied to clipboard', 'success');
      resetCopyState();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to copy');
      setError(error);
      onError?.(error);
      logger.error('Failed to copy text to clipboard', error);
      showSnackbar('Failed to copy text', 'error');
    }
  }, [onCopy, onError, showSnackbar, resetCopyState]);

  const copyImage = useCallback(async (imageBlob: Blob) => {
    try {
      if (!isValidImageType(imageBlob.type)) {
        throw createClipboardError('Unsupported image type', 'INVALID_TYPE');
      }
      await navigator.clipboard.write([
        new ClipboardItem({
          [imageBlob.type]: imageBlob
        })
      ]);
      setHasCopied(true);
      resetCopyState();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to copy image');
      setError(error);
      onError?.(error);
      logger.error('Failed to copy image to clipboard', error);
      showSnackbar('Failed to copy image', 'error');
    }
  }, [onError, showSnackbar, resetCopyState]);

  const copyImageToClipboard = useCallback(async (image: Image) => {
    const controller = new AbortController();
    
    try {
      const response = await fetch(image.full_path, {
        signal: controller.signal
      });
      
      if (!response.ok) {
        throw createClipboardError('Failed to fetch image', 'FETCH_ERROR');
      }
      
      const blob = await response.blob();
      await copyImage(blob);
      showSnackbar('Image copied to clipboard', 'success');
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return;
      }
      const error = err instanceof Error ? err : new Error('Failed to copy image');
      logger.error('Failed to copy image to clipboard', error);
      showSnackbar('Failed to copy image', 'error');
    }
    
    return () => controller.abort();
  }, [copyImage, showSnackbar]);

  const copyMetadata = useCallback(async (image: Image) => {
    if (!image?.metadata_) {
      showSnackbar('No metadata available', 'warning');
      return;
    }

    try {
      // Fix JSON.parse argument type
      const metadata = typeof image.metadata_ === 'string' ? JSON.parse(image.metadata_) : image.metadata_;
      const formattedMetadata = formatMetadata(metadata as unknown);
      await copy(formattedMetadata);
    } catch {
      showSnackbar('Failed to copy metadata', 'error');
    }
  }, [copy, showSnackbar]);

  return {
    hasCopied,
    error,
    copy,
    copyImage,
    copyImageToClipboard,
    copyMetadata
  };
};