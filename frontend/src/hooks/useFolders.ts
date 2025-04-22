import { useState, useCallback } from 'react';
import * as api from '../services/api';

export function useFolders() {
  const [folders, setFolders] = useState<api.Folder[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [errorFolders, setErrorFolders] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<api.Folder | null>(null);

  const fetchFolders = useCallback(async () => {
    setIsLoadingFolders(true);
    setErrorFolders(null);
    try {
      const fetchedFolders = await api.getFolders();
      setFolders(fetchedFolders);
      // --- Auto-clean localStorage if folders are missing (DB reset, etc.) ---
      if (window && window.localStorage) {
        // Remove any cached folder paths/IDs that are not in the backend anymore
        const remembered = window.localStorage.getItem('folders');
        if (remembered) {
          try {
            const rememberedFolders = JSON.parse(remembered);
            const validIds = new Set(fetchedFolders.map(f => f.id));
            const filtered = rememberedFolders.filter((f: api.Folder) => validIds.has(f.id));
            if (filtered.length !== rememberedFolders.length) {
              window.localStorage.setItem('folders', JSON.stringify(filtered));
            }
          } catch {
            window.localStorage.removeItem('folders');
          }
        }
      }
      // ---------------------------------------------------------------
    } catch (err: unknown) {
      setErrorFolders(err instanceof Error ? err.message : 'Could not load folders.');
    } finally {
      setIsLoadingFolders(false);
    }
  }, []);

  const handleAddFolder = async (path: string) => {
    await api.addFolder(path);
    await fetchFolders();
  };

  const handleDeleteFolder = async (folderId: number) => {
    await api.deleteFolder(folderId);
    setFolders(prev => prev.filter(f => f.id !== folderId));
    if (selectedFolder?.id === folderId) {
      setSelectedFolder(null);
    }
  };

  const handleRefreshFolder = async (folderId: number) => {
    await api.refreshFolder(folderId);
    await fetchFolders();
  };

  const handleSelectFolder = useCallback((folder: api.Folder) => {
    setSelectedFolder(folder);
  }, []);

  return {
    folders,
    isLoadingFolders,
    errorFolders,
    selectedFolder,
    setSelectedFolder,
    fetchFolders,
    handleAddFolder,
    handleDeleteFolder,
    handleRefreshFolder,
    handleSelectFolder,
  };
}
