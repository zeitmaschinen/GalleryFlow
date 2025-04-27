import React from 'react';
import { Box, IconButton, Typography, Stack } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { FolderHeader } from '../folders';
import { StatsCards, ControlsCard } from '../common';
import { ImageGridContainer } from '../images';
import { spacing } from '../../theme/themeConstants';
import type { SortField } from '../../types';
import { IMAGES_PER_PAGE } from '../../constants';
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
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Top Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: spacing.md }}>
        <IconButton onClick={toggleColorMode} color="inherit">
          {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Box>

      {selectedFolder ? (
        <>
          {/* Folder Header */}
          <FolderHeader selectedFolder={selectedFolder} />

          {/* Stats Cards */}
          <Box sx={{ mb: spacing.md }}>
            <StatsCards
              totalImages={totalImages}
              currentPage={currentPage}
              totalPages={Math.ceil(totalImages / IMAGES_PER_PAGE)}
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

          {/* Image Grid */}
          <ImageGridContainer
            images={images}
            isLoading={isLoadingImages}
            error={errorImages}
            thumbnailSize={thumbnailSize}
            columnsCount={columnsCount}
            currentPage={currentPage}
            totalImages={totalImages}
            imagesPerPage={IMAGES_PER_PAGE}
            onPageChange={onPageChange}
            onGoToFirstPage={onGoToFirstPage}
            onGoToLastPage={onGoToLastPage}
          />
        </>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
            p: spacing.xl
          }}
        >
          <Stack spacing={2} alignItems="center">
            <Box sx={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src="/images/symbol.png" 
                alt="Logo" 
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }} 
              />
            </Box>
            <Typography variant="h5" component="h1">
              <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400 }}>Welcome to GalleryFlow</span>
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Add or select a folder from the sidebar to view your images.
            </Typography>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default MainContent;
