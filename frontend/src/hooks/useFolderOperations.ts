import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { useSnackbar } from './useSnackbar';
import { logger } from '../services/logger';
import { scanProgressWS, subscribeScanProgress } from '../services/websocket';
import type { ScanProgress } from '../services/api';

const SCAN_TIMEOUT = 180000; // 3 minutes timeout

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
    if (progress.skipped_count > 100) {
      showSnackbar(`Warning: ${progress.skipped_count} files were skipped. Check folder permissions.`, 'warning');
    }
  }, [showSnackbar]);

  const startScan = useCallback(async () => {
    if (!folderId) {
      showSnackbar('No folder selected', 'error');
      return;
    }

    let timeoutId: number | undefined;
    let cleanup: (() => void) | undefined;

    try {
      setIsScanning(true);
      setScanProgress(null);

      // Set timeout
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Scan timed out'));
        }, SCAN_TIMEOUT);
      });

      // Use scanFolders (the available api method) instead of scanFolder/refreshFolder
      const scanPromise = api.scanFolders();
      
      cleanup = subscribeScanProgress(
        handleScanProgress,
        (error) => {
          logger.error('Scan progress WebSocket error', error instanceof Error ? error : new Error(String(error)));
          showSnackbar('Error monitoring scan progress. The scan may still be running.', 'warning');
        }
      );

      // Race between timeout and scan completion
      await Promise.race([scanPromise, timeoutPromise]);

      return cleanup;
    } catch (error: unknown) {
      setIsScanning(false);
      setScanProgress(null);
      if (error instanceof Error && error.message === 'Scan timed out') {
        showSnackbar('Scan timed out. Try scanning a folder with fewer files or check system resources.', 'error');
      } else {
        logger.error('Failed to start folder scan', error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }, [folderId, showSnackbar, handleScanProgress]);

  const stopScan = useCallback(() => {
    if (!folderId || !isScanning) return;

    try {
      scanProgressWS.disconnect();
      setIsScanning(false);
      setScanProgress(null);
      showSnackbar('Scan stopped', 'info');
    } catch {
      showSnackbar('Failed to stop scan. The process may still be running.', 'error');
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