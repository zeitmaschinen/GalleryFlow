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
import { useLayoutCalculator } from './hooks/useLayoutCalculator';
import { subscribeScanProgress } from './services/websocket';

function App() {
  // Use system preference for initial theme mode
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<'light' | 'dark'>(prefersDarkMode ? 'dark' : 'light');
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
  } = useImages(200); // Force 200 images per page

  const handleDrawerOpen = () => setSidebarOpen(true);
  const handleDrawerClose = () => setSidebarOpen(false);
  const toggleColorMode = () => setMode(prev => prev === 'light' ? 'dark' : 'light');

  // Listen for system color scheme changes
  useEffect(() => {
    setMode(prefersDarkMode ? 'dark' : 'light');
  }, [prefersDarkMode]);

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

  // --- Track last user-initiated reload per folder to suppress redundant WebSocket reloads ---
  const lastUserReloadRef = useRef<{ [folderId: number]: number }>({});
  const lastScanIdRef = useRef<{ [folderId: number]: string }>({});
  const prevFolderIdRef = useRef<number | null | undefined>(undefined);

  // --- Patch: Debounced but Always Latest Reload ---
  const suppressionWindowMs = 5000; // 5 seconds (or change as desired)
  const suppressionTimeoutRef = useRef<number | null>(null);
  const pendingReloadRef = useRef<{ [folderId: number]: boolean }>({});

  const reloadImageGrid = (userInitiated = false) => {
    if (selectedFolder) {
      if (userInitiated) {
        lastUserReloadRef.current[selectedFolder.id] = Date.now();
        // Start suppression window
        if (suppressionTimeoutRef.current) clearTimeout(suppressionTimeoutRef.current as unknown as number);
        pendingReloadRef.current[selectedFolder.id] = false;
        suppressionTimeoutRef.current = setTimeout(() => {
          if (pendingReloadRef.current[selectedFolder.id]) {
            pendingReloadRef.current[selectedFolder.id] = false;
          }
        }, suppressionWindowMs);
      }
      setReloadKey(k => k + 1); // Always reload, but do NOT reset currentPage
    }
  };

  // --- Patch: Universal reload function, used by both sidebar and WebSocket ---
  const handleRefreshFolderAndImages = useCallback(
    async (folderId: number) => {
      await handleRefreshFolder(folderId);
      if (selectedFolder && selectedFolder.id === folderId) {
        reloadImageGrid(true);
      } else {
        // Fallback: force fetch if state is out of sync
        fetchImages(folderId, 1, sortBy, sortDirection, selectedFileTypes);
        setCurrentPage(1);
      }
    },
    [handleRefreshFolder, setCurrentPage, fetchImages, sortBy, sortDirection, selectedFileTypes, selectedFolder]
  );

  // Track latest pagination/sort/filter state for WebSocket handler
  const latestStateRef = useRef({
    currentPage,
    sortBy,
    sortDirection,
    selectedFileTypes,
    fetchImages,
    selectedFolder,
    setCurrentPage
  });
  useEffect(() => {
    latestStateRef.current = {
      currentPage,
      sortBy,
      sortDirection,
      selectedFileTypes,
      fetchImages,
      selectedFolder,
      setCurrentPage
    };
  }, [currentPage, sortBy, sortDirection, selectedFileTypes, fetchImages, selectedFolder, setCurrentPage]);

  // --- Patch: WebSocket event triggers the SAME code as the sidebar refresh button ---
  useEffect(() => {
    if (isLoadingFolders || !selectedFolder || folders.length === 0) return;
    
    // Debounce WebSocket connection until folders exist and selectedFolder is set
    const debounceTimeout = setTimeout(() => {
      const handleWsEvent = (data: unknown) => {
        if (typeof data !== 'object' || data === null) return;
        const eventData = data as { folder_id?: number; event?: string; scan_id?: string };
        const { selectedFolder: sf } = latestStateRef.current;
        if (sf && eventData.folder_id === sf.id && eventData.event === 'folder_change') {
          const lastUserReload = lastUserReloadRef.current[sf.id] || 0;
          if (Date.now() - lastUserReload < suppressionWindowMs) {
            // Within suppression window: mark pending reload
            pendingReloadRef.current[sf.id] = true;
            return;
          }
          if (eventData.scan_id && lastScanIdRef.current[sf.id] !== eventData.scan_id) {
            handleRefreshFolderAndImages(sf.id);
            lastScanIdRef.current[sf.id] = eventData.scan_id;
          }
        }
      };
      
      // Set up polling as fallback in case WebSocket fails
      let pollingInterval: ReturnType<typeof setInterval> | null = null;
      
      try {
        const unsubscribe = subscribeScanProgress(selectedFolder.id, handleWsEvent);
        
        // Return cleanup function
        return () => {
          unsubscribe();
          if (pollingInterval) clearInterval(pollingInterval);
        };
      } catch (error) {
        console.error('[WebSocket] Failed to connect:', error);
        
        // Set up polling as fallback
        pollingInterval = setInterval(() => {
          if (selectedFolder) {
            const folderId = selectedFolder.id;
            handleRefreshFolderAndImages(folderId);
          }
        }, 10000); // Poll every 10 seconds
        
        return () => {
          if (pollingInterval) clearInterval(pollingInterval);
        };
      }
    }, 400); // 400ms debounce
    
    return () => {
      clearTimeout(debounceTimeout as unknown as number);
    };
  }, [isLoadingFolders, folders.length, selectedFolder, handleRefreshFolderAndImages, suppressionWindowMs]);

  // Layout calculator
  const { columnsCount } = useLayoutCalculator({ thumbnailSize });

  // Fetch images when state changes
  useEffect(() => {
    const currentFolderId = selectedFolder?.id;
    let pageToFetch = currentPage;

    // Check if the selected folder has actually changed
    if (currentFolderId !== undefined && currentFolderId !== prevFolderIdRef.current) {
      pageToFetch = 1;
      // Important: Update state synchronoously if possible or ensure fetch uses page 1
      // If setCurrentPage is async, this might still fetch with old page briefly.
      // Consider passing pageToFetch directly to fetchImages if setCurrentPage doesn't update immediately for the fetch.
      setCurrentPage(1); 
    }

    if (selectedFolder) {
      fetchImages(selectedFolder.id, pageToFetch, sortBy, sortDirection, selectedFileTypes)
        .then(() => {
          // This check remains useful if images get deleted, making the current page invalid
          const totalPages = Math.max(1, Math.ceil(totalImages / 200)); // Force 200 images per page
          if (currentPage > totalPages) {
             setCurrentPage(totalPages);
          }
        })
        .catch(error => {
           console.error("Error fetching images after state change:", error);
           // Handle fetch error appropriately, maybe show a message
        });
    }

    // Update the ref *after* the logic runs
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