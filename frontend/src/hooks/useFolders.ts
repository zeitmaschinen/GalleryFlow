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
