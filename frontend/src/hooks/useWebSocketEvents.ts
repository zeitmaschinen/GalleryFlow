import { useEffect, useRef } from 'react';
import type { Folder } from '../components/images/types';

interface ScanProgress {
  current: number;
  total: number;
  added_count: number;
  updated_count: number;
  removed_count: number;
  skipped_count: number;
  processed_count: number;
  total_files: number;
}

interface ScanCallbacks {
  onStart?: () => void;
  onProgress?: (progress: ScanProgress) => void;
  onComplete?: () => void;
  onImageAdded?: (folderId: string | number) => void;
  onImageUpdated?: (folderId: string | number) => void;
  onImageRemoved?: (folderId: string | number) => void;
}

const subscribeScanProgress = (callbacks: ScanCallbacks): (() => void) => {
  // This is a mock implementation
  return () => {
    // Unsubscribe function
  };
};

interface WebSocketHandlerOptions {
  selectedFolder: Folder | null;
  onFolderScanStart?: () => void;
  onFolderScanProgress?: (progress: ScanProgress) => void;
  onFolderScanComplete?: () => void;
  onImageAdded?: (folderId: string | number) => void;
  onImageUpdated?: (folderId: string | number) => void;
  onImageRemoved?: (folderId: string | number) => void;
}

export function useWebSocketEvents({
  selectedFolder,
  onFolderScanStart,
  onFolderScanProgress,
  onFolderScanComplete,
  onImageAdded,
  onImageUpdated,
  onImageRemoved,
}: WebSocketHandlerOptions) {
  const scanProgressUnsubscribe = useRef<(() => void) | null>(null);

  // Clean up any existing subscriptions when the component unmounts
  useEffect(() => {
    return () => {
      if (scanProgressUnsubscribe.current) {
        scanProgressUnsubscribe.current();
      }
    };
  }, []);

  // Subscribe to scan progress events when the selected folder changes
  useEffect(() => {
    // Clean up previous subscription
    if (scanProgressUnsubscribe.current) {
      scanProgressUnsubscribe.current();
      scanProgressUnsubscribe.current = null;
    }

    if (!selectedFolder) return;

    // Subscribe to scan progress events for the selected folder
    scanProgressUnsubscribe.current = subscribeScanProgress({
      onStart: () => {
        console.log('[WebSocket] Folder scan started');
        if (onFolderScanStart) onFolderScanStart();
      },
      onProgress: (progress: ScanProgress) => {
        if (onFolderScanProgress) onFolderScanProgress(progress);
      },
      onComplete: () => {
        console.log('[WebSocket] Folder scan completed');
        if (onFolderScanComplete) onFolderScanComplete();
      },
      onImageAdded: (folderId: string | number) => {
        console.log('[WebSocket] Image added', folderId);
        if (onImageAdded && Number(folderId) === selectedFolder.id) onImageAdded(folderId);
      },
      onImageUpdated: (folderId: string | number) => {
        console.log('[WebSocket] Image updated', folderId);
        if (onImageUpdated && Number(folderId) === selectedFolder.id) onImageUpdated(folderId);
      },
      onImageRemoved: (folderId: string | number) => {
        console.log('[WebSocket] Image removed', folderId);
        if (onImageRemoved && Number(folderId) === selectedFolder.id) onImageRemoved(folderId);
      },
    });
  }, [
    selectedFolder,
    onFolderScanStart,
    onFolderScanProgress,
    onFolderScanComplete,
    onImageAdded,
    onImageUpdated,
    onImageRemoved,
  ]);
}
