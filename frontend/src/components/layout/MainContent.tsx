import React from 'react';
import symbolLight from '../../images/symbol.png';
import symbolDark from '../../images/symbol-darkmode.png';
import { Box, IconButton, Typography, Stack } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { FolderHeader } from '../folders';
import { StatsCards, ControlsCard } from '../common';
import { ImageGridContainer } from '../images';
import { spacing, colors } from '../../theme/themeConstants';
import type { SortField } from '../../types';
import { Image } from '../images/ImageGrid';

// Define the Folder interface locally since it's not properly exported from types
interface Folder {
  id: number;
  path: string;
}

interface MainContentProps {
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
  selectedFolder: Folder | null;
  images: Image[];
  isLoadingImages: boolean;
  errorImages: string | null;
  thumbnailSize: number;
  currentPage: number;
  totalImages: number;
  sortBy: SortField;
  sortDirection: 'asc' | 'desc';
  selectedFileTypes: string[];
  columnsCount: number;
  onSortByChange: (field: SortField) => void;
  onSortDirectionToggle: () => void;
  onFileTypeChange: (types: string[]) => void;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
  onGoToFirstPage: () => void;
  onGoToLastPage: () => void;
  onThumbnailSizeChange: (event: Event, newValue: number | number[]) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  mode,
  toggleColorMode,
  selectedFolder,
  images,
  isLoadingImages,
  errorImages,
  thumbnailSize,
  currentPage,
  totalImages,
  sortBy,
  sortDirection,
  selectedFileTypes,
  columnsCount,
  onSortByChange,
  onSortDirectionToggle,
  onFileTypeChange,
  onPageChange,
  onGoToFirstPage,
  onGoToLastPage,
  onThumbnailSizeChange
}) => {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: spacing.md,
        width: { sm: `calc(100% - 280px)` },
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto', // Make the entire main container scrollable
      }}
    >
      {selectedFolder ? (
        /* Main content container */
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          {/* Top area with theme toggle button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: spacing.md }}>
            <IconButton onClick={toggleColorMode} color="inherit">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
          
          {/* Folder header with more space below the theme toggle */}
          <Box sx={{ mb: spacing.lg }}>
            <FolderHeader selectedFolder={selectedFolder} />
          </Box>
          
          {/* Additional spacer between header and content */}
          <Box sx={{ height: spacing.md }} />

          {/* Stats Cards */}
          <Box sx={{ mb: spacing.md }}>
            <StatsCards
              totalImages={totalImages}
              currentPage={currentPage}
              totalPages={Math.ceil(totalImages / 200)} // Force 200 images per page
            />
          </Box>

          {/* Controls Card */}
          <Box sx={{ mb: spacing.md }}>
            <ControlsCard
              sortBy={sortBy}
              sortDirection={sortDirection}
              selectedFileTypes={selectedFileTypes}
              thumbnailSize={thumbnailSize}
              onSortByChange={(val: string) => onSortByChange(val as SortField)}
              onSortDirectionToggle={onSortDirectionToggle}
              onFileTypeChange={onFileTypeChange}
              onThumbnailSizeChange={onThumbnailSizeChange}
            />
          </Box>

          {/* Image Grid Area - No longer has its own scrolling */}
          <Box sx={{ flex: 1 }}>
            <ImageGridContainer
              images={images}
              isLoading={isLoadingImages}
              error={errorImages}
              thumbnailSize={thumbnailSize}
              columnsCount={columnsCount}
              currentPage={currentPage}
              totalImages={totalImages}
              imagesPerPage={200} // Force 200 images per page
              onPageChange={onPageChange}
              onGoToFirstPage={onGoToFirstPage}
              onGoToLastPage={onGoToLastPage}
            />
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Top area with theme toggle for welcome screen */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: spacing.md }}>
            <IconButton onClick={toggleColorMode} color="inherit">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
          
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              textAlign: 'center',
              p: spacing.xl
            }}
          >
            <Stack spacing={2} alignItems="center">
              <Box sx={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src={mode === 'dark' ? symbolDark : symbolLight} 
                  alt="Logo" 
                  style={{ 
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }} 
                />
              </Box>
              <Typography variant="h5" component="h1">
                <span style={{ 
                  fontFamily: "'Space Mono', monospace", 
                  fontWeight: 400,
                  color: mode === 'dark' ? colors.primary.dark.main : colors.primary.light.dark
                }}>
                  Welcome to GalleryFlow
                </span>
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Add or select a folder from the sidebar to view your images.
              </Typography>
            </Stack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MainContent;
