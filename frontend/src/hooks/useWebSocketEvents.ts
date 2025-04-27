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

  // Mark a folder reload as user-initiated to avoid duplicate reloads
  const markUserInitiatedReload = useCallback((folderId: number) => {
    userInitiatedReloads.current.add(folderId);
    // Clear the marker after a reasonable time
    setTimeout(() => {
      userInitiatedReloads.current.delete(folderId);
    }, 5000); // 5 seconds should be enough for the scan to complete
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
    const handleWebSocketMessage = (data: any) => {
      if (!data) return;
      console.log('[WebSocketEvents] Received message:', data);
      // Reset connection errors counter on successful message
      connectionErrorsRef.current = 0;

      // Handle scan progress events
      if (data.event === 'scan_start') {
        console.log('[WebSocket] Folder scan started');
        if (onFolderScanStart) onFolderScanStart();
      } 
      else if (data.event === 'scan_progress') {
        if (onFolderScanProgress && data.progress) onFolderScanProgress(data.progress as ScanProgress);
      } 
      else if (data.event === 'scan_complete') {
        console.log('[WebSocket] Folder scan completed');
        if (onFolderScanComplete) onFolderScanComplete();
      } 
      // Handle folder change events
      else if (data.event === 'folder_change') {
        console.log('[WebSocket] Folder change detected:', data.folder_id);
        if (onRefreshFolderAndImages && data.folder_id) {
          onRefreshFolderAndImages(typeof data.folder_id === 'string' ? parseInt(data.folder_id, 10) : data.folder_id as number);
        }
      }
      // Handle specific image events
      else if (data.event === 'image_added') {
        console.log('[WebSocket] Image added', data.folder_id);
        if (onImageAdded && data.folder_id) {
          const folderId = typeof data.folder_id === 'string' ? parseInt(data.folder_id, 10) : data.folder_id as number;
          onImageAdded(folderId);
        }
      } 
      else if (data.event === 'image_updated') {
        console.log('[WebSocket] Image updated', data.folder_id);
        if (onImageUpdated && data.folder_id) {
          const folderId = typeof data.folder_id === 'string' ? parseInt(data.folder_id, 10) : data.folder_id as number;
          onImageUpdated(folderId);
        }
      } 
      else if (data.event === 'image_removed') {
        console.log('[WebSocket] Image removed', data.folder_id);
        if (onImageRemoved && data.folder_id) {
          const folderId = typeof data.folder_id === 'string' ? parseInt(data.folder_id, 10) : data.folder_id as number;
          onImageRemoved(folderId);
        }
      }
    };

    // Handle WebSocket errors
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

  return {
    markUserInitiatedReload
  };
}
