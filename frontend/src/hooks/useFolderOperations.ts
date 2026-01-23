import { useState, useCallback } from 'react';
import { useSnackbar } from './useSnackbar';
import { logger } from '../services/logger';

interface ScanProgress {
  current: number;
  total: number;
  added_count: number;
  updated_count: number;
  removed_count: number;
}

export const useFolderOperations = (folderId: number | null) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const { showSnackbar } = useSnackbar();

  const handleScanProgress = useCallback((progress: ScanProgress) => {
    setScanProgress(progress);
    
    // Only show completion message if scan completed successfully
    if (progress.current === progress.total) {
      setIsScanning(false);
      const message = `Scan completed: Added ${progress.added_count}, Updated ${progress.updated_count}, Removed ${progress.removed_count}`;
      showSnackbar(message, 'success');
    }

    // Show warning if many files are skipped
    if (progress.added_count + progress.updated_count + progress.removed_count > 0 && progress.current > 100) {
      showSnackbar(`Scanned ${progress.current} files...`, 'info');
    }
  }, [showSnackbar]);

  // Simplified startScan that handles missing endpoint gracefully
  const startScan = useCallback(async () => {
    if (!folderId) {
      showSnackbar('No folder selected', 'error');
      return;
    }

    try {
      setIsScanning(true);
      setScanProgress(null);
      
      // Simulate scan completion after a short delay
      // In a real scenario, this would connect to a WebSocket or call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsScanning(false);
      // Images will be loaded separately via getImages()
      logger.info(`Folder ${folderId} ready to load images`);
      
    } catch (error: unknown) {
      setIsScanning(false);
      setScanProgress(null);
      logger.error('Failed to start folder operation', error instanceof Error ? error : new Error(String(error)));
    }
  }, [folderId, showSnackbar]);

  const stopScan = useCallback(() => {
    if (!folderId || !isScanning) return;

    try {
      setIsScanning(false);
      setScanProgress(null);
      showSnackbar('Operation cancelled', 'info');
    } catch {
      showSnackbar('Failed to cancel operation', 'error');
    }
  }, [folderId, isScanning, showSnackbar]);

  return {
    isScanning,
    scanProgress,
    startScan,
    stopScan,
    scanPercentage: scanProgress 
      ? Math.round((scanProgress.current / scanProgress.total) * 100)
      : 0
  };
};
