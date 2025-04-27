import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  CssBaseline,
  ThemeProvider,
  useMediaQuery
} from '@mui/material';
import { BurgerMenu } from './components/layout/Navigation';
import { useFolders } from './hooks/useFolders';
import { useImages } from './hooks/useImages';
import { IMAGES_PER_PAGE } from './constants';
import { SortField } from './types';
import { getTheme } from './theme';
import { SidebarContainer, MobileSidebar } from './components/layout';
import { MainContent } from './components/layout';
import { useWebSocketEvents } from './hooks/useWebSocketEvents';
import { useLayoutCalculator } from './hooks/useLayoutCalculator';

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [isInitializing, setIsInitializing] = useState(true);
  const theme = useMemo(() => getTheme(mode), [mode]);
  const muiTheme = theme;
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Folder state and handlers
  const {
    folders,
    isLoadingFolders,
    selectedFolder,
    handleAddFolder,
    handleDeleteFolder,
    handleRefreshFolder,
    handleSelectFolder,
    fetchFolders
  } = useFolders();

  // Image state and handlers
  const {
    images,
    isLoadingImages,
    errorImages,
    thumbnailSize,
    setThumbnailSize,
    currentPage,
    setCurrentPage,
    totalImages,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    selectedFileTypes,
    setSelectedFileTypes,
    fetchImages,
  } = useImages(IMAGES_PER_PAGE);

  const handleDrawerOpen = () => setSidebarOpen(true);
  const handleDrawerClose = () => setSidebarOpen(false);
  const toggleColorMode = () => setMode(prev => prev === 'light' ? 'dark' : 'light');

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await fetchFolders();
      } finally {
        setIsInitializing(false);
      }
    };
    initializeApp();
  }, [fetchFolders]);

  // Handle sort direction toggle
  const handleSortDirectionToggle = () => {
    const newSortDir = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newSortDir);
    setCurrentPage(1);
    if (selectedFolder) {
      fetchImages(selectedFolder.id, 1, sortBy, newSortDir, selectedFileTypes);
    }
  };

  // Handle thumbnail size change
  const handleThumbnailSizeChange = (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      setThumbnailSize(newValue);
    }
  };

  // Handle page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    if (selectedFolder) {
      setCurrentPage(value);
      fetchImages(selectedFolder.id, value, sortBy, sortDirection, selectedFileTypes);
    }
  };

  // Handle go to first page
  const handleGoToFirstPage = () => {
    if (selectedFolder) {
      setCurrentPage(1);
      fetchImages(selectedFolder.id, 1, sortBy, sortDirection, selectedFileTypes);
    }
  };

  // Handle go to last page
  const handleGoToLastPage = () => {
    if (selectedFolder) {
      const lastPage = Math.ceil(totalImages / IMAGES_PER_PAGE);
      setCurrentPage(lastPage);
      fetchImages(selectedFolder.id, lastPage, sortBy, sortDirection, selectedFileTypes);
    }
  };

  // Handle file type change
  const handleFileTypeChange = (types: string[]) => {
    setSelectedFileTypes(types);
    if (selectedFolder) {
      setCurrentPage(1);
      fetchImages(selectedFolder.id, 1, sortBy, sortDirection, types);
    }
  };

  // Handle sort by change
  const handleSortByChange = (field: SortField) => {
    setSortBy(field);
    setCurrentPage(1);
    if (selectedFolder) {
      fetchImages(selectedFolder.id, 1, field, sortDirection, selectedFileTypes);
    }
  };

  // Reload image grid
  const reloadImageGrid = useCallback((userInitiated = false) => {
    if (selectedFolder) {
      if (userInitiated) {
        webSocketEvents.markUserInitiatedReload(selectedFolder.id);
      }
      setReloadKey(k => k + 1);
    }
  }, [selectedFolder]);

  // Handle refresh folder and images
  const handleRefreshFolderAndImages = useCallback(
    async (folderId: number) => {
      await handleRefreshFolder(folderId);
      if (selectedFolder && selectedFolder.id === folderId) {
        reloadImageGrid(true);
      } else {
        fetchImages(folderId, 1, sortBy, sortDirection, selectedFileTypes);
        setCurrentPage(1);
      }
    },
    [handleRefreshFolder, setCurrentPage, fetchImages, sortBy, sortDirection, selectedFileTypes, reloadImageGrid, selectedFolder]
  );

  // WebSocket events
  const webSocketEvents = useWebSocketEvents({
    selectedFolder,
    isLoadingFolders,
    folders,
    onRefreshFolderAndImages: handleRefreshFolderAndImages
  });

  // Layout calculator
  const { columnsCount } = useLayoutCalculator({ thumbnailSize });

  // Ref for tracking previous folder ID
  const prevFolderIdRef = useRef<number | null | undefined>(undefined);

  // Fetch images when state changes
  useEffect(() => {
    const currentFolderId = selectedFolder?.id;
    let pageToFetch = currentPage;

    // Check if the selected folder has actually changed
    if (currentFolderId !== undefined && currentFolderId !== prevFolderIdRef.current) {
      setCurrentPage(1);
      pageToFetch = 1;
    }

    if (selectedFolder) {
      fetchImages(selectedFolder.id, pageToFetch, sortBy, sortDirection, selectedFileTypes)
        .then(() => {
          // This check remains useful if images get deleted, making the current page invalid
          const totalPages = Math.max(1, Math.ceil(totalImages / IMAGES_PER_PAGE));
          if (currentPage > totalPages) {
            setCurrentPage(totalPages);
          }
        })
        .catch(error => {
          console.error("Error fetching images after state change:", error);
        });
    }

    // Update the ref after the logic runs
    prevFolderIdRef.current = currentFolderId;
  }, [selectedFolder, currentPage, sortBy, sortDirection, selectedFileTypes, reloadKey, fetchImages, totalImages, setCurrentPage]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isInitializing ? (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          bgcolor: 'background.default'
        }}>
          <img src="/images/symbol.png" alt="Logo" style={{ width: 64, height: 64, animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', height: '100vh', width: '100%' }}>
          {isMobile ? (
            <>
              {!sidebarOpen && (
                <BurgerMenu onClick={handleDrawerOpen} sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1301 }} />
              )}
              <MobileSidebar
                open={sidebarOpen}
                onClose={handleDrawerClose}
                folders={folders}
                isLoadingFolders={isLoadingFolders}
                selectedFolderId={selectedFolder?.id ?? null}
                onAddFolder={handleAddFolder}
                onDeleteFolder={handleDeleteFolder}
                onRefreshFolder={handleRefreshFolderAndImages}
                onSelectFolder={handleSelectFolder}
              />
            </>
          ) : (
            <SidebarContainer
              folders={folders}
              isLoadingFolders={isLoadingFolders}
              selectedFolderId={selectedFolder?.id ?? null}
              onAddFolder={handleAddFolder}
              onDeleteFolder={handleDeleteFolder}
              onRefreshFolder={handleRefreshFolderAndImages}
              onSelectFolder={handleSelectFolder}
            />
          )}

          <MainContent
            mode={mode}
            toggleColorMode={toggleColorMode}
            selectedFolder={selectedFolder}
            images={images}
            isLoadingImages={isLoadingImages}
            errorImages={errorImages}
            thumbnailSize={thumbnailSize}
            currentPage={currentPage}
            totalImages={totalImages}
            sortBy={sortBy}
            sortDirection={sortDirection}
            selectedFileTypes={selectedFileTypes}
            columnsCount={columnsCount}
            onSortByChange={handleSortByChange}
            onSortDirectionToggle={handleSortDirectionToggle}
            onFileTypeChange={handleFileTypeChange}
            onPageChange={handlePageChange}
            onGoToFirstPage={handleGoToFirstPage}
            onGoToLastPage={handleGoToLastPage}
            onThumbnailSizeChange={handleThumbnailSizeChange}
          />
        </Box>
      )}
    </ThemeProvider>
  );
}

export default App;