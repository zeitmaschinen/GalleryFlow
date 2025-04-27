import { useEffect, useRef } from 'react';
import { subscribeScanProgress } from '../services/websocket';
import type { Folder } from '../types';

interface WebSocketHandlerOptions {
  selectedFolder: Folder | null;
  isLoadingFolders: boolean;
  folders: Folder[];
  onRefreshFolderAndImages: (folderId: number) => Promise<void>;
  suppressionWindowMs?: number;
}

export const useWebSocketEvents = ({
  selectedFolder,
  isLoadingFolders,
  folders,
  onRefreshFolderAndImages,
  suppressionWindowMs = 5000
}: WebSocketHandlerOptions) => {
  // Track last user-initiated reload per folder to suppress redundant WebSocket reloads
  const lastUserReloadRef = useRef<{ [folderId: number]: number }>({});
  const lastScanIdRef = useRef<{ [folderId: number]: string }>({});
  const pendingReloadRef = useRef<{ [folderId: number]: boolean }>({});
  const suppressionTimeoutRef = useRef<number | null>(null);

  // Set up a function to mark a user-initiated reload
  const markUserInitiatedReload = (folderId: number) => {
    lastUserReloadRef.current[folderId] = Date.now();
    
    // Start suppression window
    if (suppressionTimeoutRef.current) {
      clearTimeout(suppressionTimeoutRef.current as unknown as number);
    }
    
    pendingReloadRef.current[folderId] = false;
    
    suppressionTimeoutRef.current = setTimeout(() => {
      if (pendingReloadRef.current[folderId]) {
        console.log('[Suppression] Running pending reload after debounce window');
        onRefreshFolderAndImages(folderId);
        pendingReloadRef.current[folderId] = false;
      }
    }, suppressionWindowMs);
  };

  // Set up WebSocket subscription
  useEffect(() => {
    if (isLoadingFolders || !selectedFolder || folders.length === 0) return;
    
    // Debounce WebSocket connection until folders exist and selectedFolder is set
    const debounceTimeout = setTimeout(() => {
      const handleWsEvent = (data: unknown) => {
        if (typeof data !== 'object' || data === null) return;
        
        const eventData = data as { folder_id?: number; event?: string; scan_id?: string };
        
        if (selectedFolder && eventData.folder_id === selectedFolder.id && eventData.event === 'folder_change') {
          const lastUserReload = lastUserReloadRef.current[selectedFolder.id] || 0;
          
          if (Date.now() - lastUserReload < suppressionWindowMs) {
            // Within suppression window: mark pending reload
            console.log('[WebSocket] Suppressed reload, will run after debounce window');
            pendingReloadRef.current[selectedFolder.id] = true;
            return;
          }
          
          if (eventData.scan_id && lastScanIdRef.current[selectedFolder.id] !== eventData.scan_id) {
            onRefreshFolderAndImages(selectedFolder.id);
            lastScanIdRef.current[selectedFolder.id] = eventData.scan_id;
          }
        }
      };
      
      const unsubscribe = subscribeScanProgress(selectedFolder.id, handleWsEvent);
      
      // Cleanup
      return () => {
        unsubscribe();
      };
    }, 400); // 400ms debounce
    
    return () => {
      clearTimeout(debounceTimeout as unknown as number);
    };
  }, [isLoadingFolders, folders.length, selectedFolder, onRefreshFolderAndImages, suppressionWindowMs]);

  return {
    markUserInitiatedReload
  };
};
