import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import {
  Box,
  CssBaseline,
  ThemeProvider,
  useMediaQuery
} from '@mui/material';
import TabPerformanceManager from './components/common/TabPerformanceManager';
import { BurgerMenu } from './components/layout/Navigation';
import { useFolders } from './hooks/useFolders';
import { useImages } from './hooks/useImages';
import { IMAGES_PER_PAGE } from './constants';
import { SortField } from './types';
import { getTheme } from './theme';
import { SidebarContainer, MobileSidebar } from './components/layout';
import { MainContent } from './components/layout';
import { subscribeScanProgress } from './services/websocket';

function App() {
  // Use system preference for initial theme mode
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<'light' | 'dark'>(prefersDarkMode ? 'dark' : 'light');
  const [isInitializing, setIsInitializing] = useState(true);
  const theme = useMemo(() => getTheme(mode), [mode]);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
  } = useImages(100); // Use 100 images per page

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

  // Handle sort direction toggle - just update state, let effect handle the fetch
  const handleSortDirectionToggle = () => {
    const newSortDir = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newSortDir);
    setCurrentPage(1);
  };

  // Handle thumbnail size change
  const handleThumbnailSizeChange = (_event: Event, newValue: number | number[]) => {
    console.log('[App] handleThumbnailSizeChange RECEIVED:', newValue);
    if (typeof newValue === 'number') {
      console.log('[App] About to call setThumbnailSize with:', newValue);
      setThumbnailSize(newValue);
      console.log('[App] setThumbnailSize called, thumbnailSize state should update');
    } else {
      console.log('[App] newValue is not a number:', newValue);
    }
  };

  // Handle page change - just update state, let the effect handle the fetch
  const handlePageChange = (_event: ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  // Handle go to first page - just update state, let the effect handle the fetch
  const handleGoToFirstPage = () => {
    setCurrentPage(1);
  };

  // Handle go to last page - just update state, let the effect handle the fetch
  const handleGoToLastPage = () => {
    const lastPage = Math.ceil(totalImages / IMAGES_PER_PAGE);
    setCurrentPage(lastPage);
  };

  // Handle file type change - just update state, let effect handle the fetch
  const handleFileTypeChange = (types: string[]) => {
    setSelectedFileTypes(types);
    setCurrentPage(1);
  };

  // Handle sort by change - just update state, let effect handle the fetch
  const handleSortByChange = (field: SortField) => {
    setSortBy(field);
    setCurrentPage(1);
  };

  // Reset to page 1 when switching folders so user sees page 1 of new folder
  // This is also called by refresh (userInitiated=true)
  const lastUserReloadRef = useRef<{ [folderId: number]: number }>({});
  const lastScanIdRef = useRef<{ [folderId: number]: string }>({});
  const prevFolderIdRef = useRef<number | null | undefined>(undefined);
  const prevReloadKeyRef = useRef<number>(0); // Track reload key changes to detect refresh

  // --- Patch: Debounced but Always Latest Reload ---
  const suppressionWindowMs = 5000; // 5 seconds (or change as desired)
  const suppressionTimeoutRef = useRef<number | null>(null);
  const pendingReloadRef = useRef<{ [folderId: number]: boolean }>({});

  const reloadImageGrid = (userInitiated = false) => {
    if (selectedFolder) {
      console.log('[App] reloadImageGrid called, userInitiated:', userInitiated, 'folderId:', selectedFolder.id);
      if (userInitiated) {
        console.log('[App] User-initiated refresh - resetting to page 1');
        lastUserReloadRef.current[selectedFolder.id] = Date.now();
        // Start suppression window
        if (suppressionTimeoutRef.current) clearTimeout(suppressionTimeoutRef.current as unknown as number);
        pendingReloadRef.current[selectedFolder.id] = false;
        suppressionTimeoutRef.current = setTimeout(() => {
          if (pendingReloadRef.current[selectedFolder.id]) {
            pendingReloadRef.current[selectedFolder.id] = false;
          }
        }, suppressionWindowMs);
        // Reset to page 1 so user sees refreshed page 1 images
        console.log('[App] Before setCurrentPage(1), currentPage is:', currentPage);
        setCurrentPage(1);
        console.log('[App] setCurrentPage(1) called');
      }
      console.log('[App] Incrementing reloadKey');
      setReloadKey(k => k + 1);
    }
  };

  // --- Patch: Universal reload function, used by both sidebar and WebSocket ---
  const handleRefreshFolderAndImages = useCallback(
    async (folderId: number) => {
      // Only refresh the folder metadata without affecting image display
      await handleRefreshFolder(folderId);
      
      // Only reload images if this is the currently selected folder
      if (selectedFolder && selectedFolder.id === folderId) {
        reloadImageGrid(true);
      }
      // Remove the fallback fetch for non-active folders to prevent unwanted reloads
    },
    [handleRefreshFolder, selectedFolder]
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

  // Backend now returns only the requested page, so use images directly
  // No need for local slicing - removed paginatedImages since it was causing double pagination
  const paginatedImages = images; // images is already the current page from backend

  // Layout calculator

  // Fetch images when state changes
  useEffect(() => {
    const currentFolderId = selectedFolder?.id;
    let pageToFetch = currentPage;
    
    // Check if reloadKey changed (user clicked refresh) - if so, always fetch page 1
    const reloadKeyChanged = reloadKey !== prevReloadKeyRef.current;
    if (reloadKeyChanged) {
      console.log('[App] Reload detected! Forcing page 1 fetch');
      pageToFetch = 1;
      prevReloadKeyRef.current = reloadKey;
    }

    // Check if the selected folder has actually changed
    if (currentFolderId !== undefined && currentFolderId !== prevFolderIdRef.current) {
      pageToFetch = 1;
      setCurrentPage(1); 
    }

    if (selectedFolder) {
      fetchImages(selectedFolder.id, pageToFetch, sortBy, sortDirection, selectedFileTypes)
        .then(() => {
          // This check remains useful if images get deleted, making the current page invalid
          const totalPages = Math.max(1, Math.ceil(totalImages / 100)); // Use 100 images per page
          if (pageToFetch > totalPages) {
             setCurrentPage(totalPages);
          }
        })
        .catch(error => {
           console.error("Error fetching images after state change:", error);
        });
    }

    // Update the ref *after* the logic runs
    prevFolderIdRef.current = currentFolderId;
  }, [selectedFolder, currentPage, sortBy, sortDirection, selectedFileTypes, reloadKey, fetchImages, setCurrentPage, totalImages]);
  // NOTE: reloadKey is now in deps to detect refresh

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TabPerformanceManager>
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
          <img src={mode === 'dark' ? "/images/symbol-darkmode.png" : "/images/symbol.png"} alt="Logo" style={{ width: 45, height: 45, animation: 'spin 1s linear infinite' }} />
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
            images={paginatedImages}
            isLoadingImages={isLoadingImages}
            errorImages={errorImages}
            thumbnailSize={thumbnailSize}
            currentPage={currentPage}
            totalImages={totalImages}
            sortBy={sortBy}
            sortDirection={sortDirection}
            selectedFileTypes={selectedFileTypes}
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
      </TabPerformanceManager>
    </ThemeProvider>
  );
}

export default App;