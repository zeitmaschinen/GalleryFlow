import { useEffect, useRef, useCallback } from 'react';
import type { Folder } from '../components/images/types';
import { subscribeScanProgress } from '../services/websocket';
import type { ScanProgress } from '../types/index';

interface WebSocketHandlerOptions {
  selectedFolder: Folder | null;
  onFolderScanStart?: () => void;
  onFolderScanProgress?: (progress: ScanProgress) => void;
  onFolderScanComplete?: () => void;
  onImageAdded?: (folderId: string | number) => void;
  onImageUpdated?: (folderId: string | number) => void;
  onImageRemoved?: (folderId: string | number) => void;
  onRefreshFolderAndImages?: (folderId: number) => Promise<void>;
}

export function useWebSocketEvents({
  selectedFolder,
  onFolderScanStart,
  onFolderScanProgress,
  onFolderScanComplete,
  onImageAdded,
  onImageUpdated,
  onImageRemoved,
  onRefreshFolderAndImages
}: WebSocketHandlerOptions) {
  const scanProgressUnsubscribe = useRef<(() => void) | null>(null);
  const userInitiatedReloads = useRef<Set<number>>(new Set());
  const connectionErrorsRef = useRef<number>(0);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxRetries = 3;

  // Debounce logic for backend events
  const backendRefreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const BACKEND_DEBOUNCE_MS = 150;

  // Helper: call refresh immediately, cancel backend debounce
  const immediateRefresh = useCallback((folderId: number) => {
    if (backendRefreshTimeout.current) {
      clearTimeout(backendRefreshTimeout.current);
      backendRefreshTimeout.current = null;
    }
    onRefreshFolderAndImages?.(folderId);
  }, [onRefreshFolderAndImages]);

  // Helper: debounce for backend (WebSocket) events
  const scheduleBackendRefresh = useCallback((folderId: number) => {
    if (backendRefreshTimeout.current) {
      clearTimeout(backendRefreshTimeout.current);
    }
    backendRefreshTimeout.current = setTimeout(() => {
      onRefreshFolderAndImages?.(folderId);
      backendRefreshTimeout.current = null;
    }, BACKEND_DEBOUNCE_MS);
  }, [onRefreshFolderAndImages]);

  // Expose immediate refresh for user actions
  // Usage: Call this from user actions (add/delete/move) to force immediate refresh
  // Example: useWebSocketEvents(...).immediateRefresh(folderId)
  // (You may want to export this via return value if needed)

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((data: any) => {
    if (!data) return;
    connectionErrorsRef.current = 0;
    if (data.event === 'scan_start') {
      if (onFolderScanStart) onFolderScanStart();
    } else if (data.event === 'scan_progress') {
      if (onFolderScanProgress && data.progress) onFolderScanProgress(data.progress as ScanProgress);
    } else if (data.event === 'scan_complete') {
      if (onFolderScanComplete) onFolderScanComplete();
    } else if (data.event === 'image_added' || data.event === 'image_updated' || data.event === 'image_removed') {
      // Always batch backend events (WebSocket) with debounce
      const folderId = typeof data.folder_id === 'string' ? parseInt(data.folder_id, 10) : data.folder_id as number;
      scheduleBackendRefresh(folderId);
      // Optionally, call onImageAdded/onImageRemoved/onImageUpdated if needed
      if (data.event === 'image_added' && onImageAdded) onImageAdded(folderId);
      if (data.event === 'image_updated' && onImageUpdated) onImageUpdated(folderId);
      if (data.event === 'image_removed' && onImageRemoved) onImageRemoved(folderId);
    }
  }, [onFolderScanStart, onFolderScanProgress, onFolderScanComplete, onImageAdded, onImageUpdated, onImageRemoved, scheduleBackendRefresh]);

  // Cleanup backend debounce on unmount
  useEffect(() => {
    return () => {
      if (backendRefreshTimeout.current) {
        clearTimeout(backendRefreshTimeout.current);
        backendRefreshTimeout.current = null;
      }
    };
  }, []);

  // Setup polling mechanism
  const setupPolling = useCallback(() => {
    // Clear any existing polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (!selectedFolder || !onRefreshFolderAndImages) return;

    console.log('[WebSocketEvents] Setting up polling fallback mechanism');
    
    // Set up polling interval
    pollingIntervalRef.current = setInterval(() => {
      if (selectedFolder) {
        const folderId = typeof selectedFolder.id === 'string' 
          ? parseInt(selectedFolder.id, 10) 
          : selectedFolder.id as number;
          
        if (!userInitiatedReloads.current.has(folderId)) {
          console.log('[Polling] Checking for changes in folder', folderId);
          onRefreshFolderAndImages(folderId).catch(error => {
            console.error('[Polling] Error refreshing folder:', error);
          });
        }
      }
    }, 10000); // Poll every 10 seconds
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [selectedFolder, onRefreshFolderAndImages]);

  // Subscribe to scan progress events when the selected folder changes
  useEffect(() => {
    // Clean up previous subscription
    if (scanProgressUnsubscribe.current) {
      scanProgressUnsubscribe.current();
      scanProgressUnsubscribe.current = null;
    }

    // Clean up polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (!selectedFolder) return;

    // Process WebSocket messages
    const handleWebSocketError = (error: Event) => {
      console.error('[WebSocket] Error:', error);
      connectionErrorsRef.current += 1;

      // If we've had multiple connection errors, switch to polling
      if (connectionErrorsRef.current >= maxRetries) {
        console.log('[WebSocket] Max retries reached, switching to polling');
        setupPolling();
      }
    };

    try {
      // Subscribe to WebSocket events for the selected folder
      const folderId = typeof selectedFolder.id === 'string' 
        ? parseInt(selectedFolder.id, 10) 
        : selectedFolder.id as number;
        
      console.log('[WebSocketEvents] Attempting to connect to WebSocket for folder', folderId);
      scanProgressUnsubscribe.current = subscribeScanProgress(
        folderId,
        handleWebSocketMessage,
        handleWebSocketError
      );
    } catch (error) {
      console.error('[WebSocketEvents] Failed to subscribe to scan progress:', error);
      // If WebSocket connection fails, set up a polling mechanism as fallback
      setupPolling();
    }

    return () => {
      if (scanProgressUnsubscribe.current) {
        scanProgressUnsubscribe.current();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [
    selectedFolder,
    onFolderScanStart,
    onFolderScanProgress,
    onFolderScanComplete,
    onImageAdded,
    onImageUpdated,
    onImageRemoved,
    onRefreshFolderAndImages,
    maxRetries,
    setupPolling
  ]);

  // Mark a folder reload as user-initiated to avoid duplicate reloads
  const markUserInitiatedReload = useCallback((folderId: number) => {
    userInitiatedReloads.current.add(folderId);
    // Clear the marker after a reasonable time
    setTimeout(() => {
      userInitiatedReloads.current.delete(folderId);
    }, 5000); // 5 seconds should be enough for the scan to complete
  }, []);

  return {
    markUserInitiatedReload,
    immediateRefresh,
  };
}
