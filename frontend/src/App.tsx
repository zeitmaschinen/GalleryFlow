import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  CssBaseline,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  Stack,
  ThemeProvider,
  Drawer,
  useTheme,
  useMediaQuery,
  Card
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import CollectionsIcon from '@mui/icons-material/Collections';
import { BurgerMenu, DrawerHeaderMobile, SidebarHeader } from './components/Navigation';
import SidebarFooter from './components/SidebarFooter';

import { getTheme } from './theme/index';
import AddFolderForm from './components/AddFolderForm';
import FolderList from './components/FolderList';
import ImageGrid from './components/ImageGrid';
import { typography, spacing } from './theme/themeConstants';
import { useFolders } from './hooks/useFolders';
import { useImages } from './hooks/useImages';
import FolderHeader from './components/FolderHeader';
import StatsCards from './components/StatsCards';
import ControlsCard from './components/ControlsCard';
import PaginationControls from './components/PaginationControls';
import { IMAGES_PER_PAGE } from './constants';
import { SortField } from './types';

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [isInitializing, setIsInitializing] = useState(true);

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

  const theme = useMemo(() => getTheme(mode), [mode]);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleDrawerOpen = () => setSidebarOpen(true);
  const handleDrawerClose = () => setSidebarOpen(false);

  const toggleColorMode = () => setMode(prev => prev === 'light' ? 'dark' : 'light');

  // Restore correct initialization effect
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

  const handleSortDirectionToggle = () => {
    const newSortDir = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newSortDir);
    setCurrentPage(1);
    if (selectedFolder) {
      fetchImages(selectedFolder.id, 1, sortBy, newSortDir, selectedFileTypes);
    }
  };

  const handleThumbnailSizeChange = (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      setThumbnailSize(newValue);
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    if (selectedFolder) {
      setCurrentPage(value);
      fetchImages(selectedFolder.id, value, sortBy, sortDirection, selectedFileTypes);
    }
  };

  const handleGoToFirstPage = () => {
    if (selectedFolder) {
      setCurrentPage(1);
      fetchImages(selectedFolder.id, 1, sortBy, sortDirection, selectedFileTypes);
    }
  };

  const handleGoToLastPage = () => {
    if (selectedFolder) {
      const lastPage = Math.ceil(totalImages / IMAGES_PER_PAGE);
      setCurrentPage(lastPage);
      fetchImages(selectedFolder.id, lastPage, sortBy, sortDirection, selectedFileTypes);
    }
  };

  const handleFileTypeChange = (types: string[]) => {
    setSelectedFileTypes(types);
    if (selectedFolder) {
      setCurrentPage(1);
      fetchImages(selectedFolder.id, 1, sortBy, sortDirection, types);
    }
  };

  // Automatically load images when folder or relevant state changes
  useEffect(() => {
    if (selectedFolder) {
      fetchImages(selectedFolder.id, currentPage, sortBy, sortDirection, selectedFileTypes);
    }
  }, [fetchImages, selectedFolder, currentPage, sortBy, sortDirection, selectedFileTypes]);

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
          <CollectionsIcon sx={{ color: 'primary.main', fontSize: '3rem' }} />
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', height: '100vh', width: '100%' }}>
          {isMobile ? (
            <>
              {!sidebarOpen && (
                <BurgerMenu onClick={handleDrawerOpen} sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1301 }} />
              )}
              <Drawer
                anchor="left"
                open={sidebarOpen}
                onClose={handleDrawerClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                  '& .MuiDrawer-paper': {
                    width: 280,
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                  }
                }}
              >
                <DrawerHeaderMobile onClose={handleDrawerClose} />
                <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                  {/* Add Folder Section */}
                  <Box sx={{ p: spacing.md }}>
                    <AddFolderForm onAddFolder={handleAddFolder} />
                  </Box>
                  <Divider />
                  {/* Folder List */}
                  <Box sx={{ 
                    p: spacing.md, 
                    flexGrow: 1, 
                    overflow: 'auto',
                    scrollBehavior: 'smooth',
                    overscrollBehavior: 'none'
                  }}>
                    <Typography 
                      variant="subtitle2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: spacing.sm,
                        pl: 0,
                        letterSpacing: '0.1em',
                        fontWeight: typography.fontWeights.medium 
                      }}
                    >
                      MAPPED FOLDERS
                    </Typography>
                    {isLoadingFolders ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: spacing.sm }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : (
                      <FolderList
                        folders={folders}
                        onDeleteFolder={handleDeleteFolder}
                        onRefreshFolder={handleRefreshFolder}
                        onSelectFolder={handleSelectFolder}
                        selectedFolderId={selectedFolder?.id ?? null}
                      />
                    )}
                  </Box>
                  <Box sx={{ mt: 'auto' }}><SidebarFooter /></Box>
                </Box>
              </Drawer>
            </>
          ) : (
            <Paper
              elevation={2}
              sx={{
                width: 280,
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRight: 1,
                borderColor: 'divider',
                position: 'relative',
                zIndex: 1201,
                flexShrink: 0
              }}
            >
              <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {/* Logo Area */}
                <SidebarHeader />
                {/* Add Folder Section */}
                <Box sx={{ p: spacing.md }}>
                  <AddFolderForm onAddFolder={handleAddFolder} />
                </Box>

                <Divider />

                {/* Folder List */}
                <Box sx={{ 
                  p: spacing.md, 
                  flexGrow: 1, 
                  overflow: 'auto',
                  scrollBehavior: 'smooth',
                  overscrollBehavior: 'none'
                }}>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: spacing.sm,
                      pl: 0,
                      letterSpacing: '0.1em',
                      fontWeight: typography.fontWeights.medium 
                    }}
                  >
                    MAPPED FOLDERS
                  </Typography>
                  {isLoadingFolders ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: spacing.sm }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <FolderList
                      folders={folders}
                      onDeleteFolder={handleDeleteFolder}
                      onRefreshFolder={handleRefreshFolder}
                      onSelectFolder={handleSelectFolder}
                      selectedFolderId={selectedFolder?.id ?? null}
                    />
                  )}
                </Box>
                <Box sx={{ mt: 'auto' }}><SidebarFooter /></Box>
              </Box>
            </Paper>
          )}
          {/* Main Content */}
          <Box sx={{ flexGrow: 1, minWidth: 0, width: 0, height: '100vh', overflow: 'auto', p: { xs: 1, md: 2 } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: spacing.xl }}>
              <IconButton onClick={toggleColorMode} sx={{ transition: 'none !important' }}>
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Box>

            {selectedFolder ? (
              <Stack spacing={spacing.md}>
                {/* Folder Name Header */}
                <FolderHeader selectedFolder={selectedFolder} />
                {/* Stats Cards */}
                <StatsCards
                  totalImages={totalImages}
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalImages / IMAGES_PER_PAGE)}
                />
                {/* Controls Card */}
                <ControlsCard
                  thumbnailSize={thumbnailSize}
                  onThumbnailSizeChange={handleThumbnailSizeChange}
                  selectedFileTypes={selectedFileTypes}
                  onFileTypeChange={handleFileTypeChange}
                  sortBy={sortBy}
                  onSortByChange={(val: string) => {
                    setSortBy(val as SortField);
                    setCurrentPage(1);
                    if (selectedFolder) {
                      fetchImages(selectedFolder.id, 1, val as SortField, sortDirection, selectedFileTypes);
                    }
                  }}
                  sortDirection={sortDirection}
                  onSortDirectionToggle={handleSortDirectionToggle}
                />
                {/* Images Card */}
                <Card>
                  {isLoadingImages ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: spacing.xl }}>
                      <CircularProgress />
                    </Box>
                  ) : errorImages ? (
                    <Alert severity="error" sx={{ m: spacing.md }}>{errorImages}</Alert>
                  ) : images.length === 0 ? (
                    <Box sx={{ p: spacing.xl, textAlign: 'center' }}>
                      <Typography color="text.secondary">No images found</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ p: spacing.md }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ pb: spacing.md, px: spacing.sm }}
                      >
                        Viewing {images.length} images on this page
                      </Typography>
                      <ImageGrid images={images} thumbnailSize={thumbnailSize} />
                    </Box>
                  )}
                  <PaginationControls
                    totalImages={totalImages}
                    imagesPerPage={IMAGES_PER_PAGE}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    onGoToFirstPage={handleGoToFirstPage}
                    onGoToLastPage={handleGoToLastPage}
                    isMobile={isMobile}
                  />
                </Card>
              </Stack>
            ) : (
              <Card sx={{ p: spacing.xl, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  Select a folder to view images
                </Typography>
              </Card>
            )}
          </Box>
        </Box>
      )}
    </ThemeProvider>
  );
}

export default App;