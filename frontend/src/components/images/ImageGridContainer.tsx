import React from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { ImageGrid } from './';
import type { Image } from './types';
import { PaginationControls } from '../common';
import { palette } from '../../theme/themeConstants';

interface ImageGridContainerProps {
  images: Image[];
  isLoading: boolean;
  error: string | null;
  thumbnailSize: number;
  currentPage: number;
  totalImages: number;
  imagesPerPage: number;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
  onGoToFirstPage: () => void;
  onGoToLastPage: () => void;
  isMobile?: boolean;
  isScanning?: boolean;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

// Varied widths so the loading state previews the real, justified layout
const SKELETON_RATIOS = [1.5, 0.75, 1, 1.33, 0.67, 1, 1.78, 0.8, 1.2, 0.75, 1.5, 1, 0.67, 1.33, 1];

const GridSkeleton: React.FC<{ rowHeight: number }> = ({ rowHeight }) => (
  <Box aria-busy="true" aria-label="Loading images" sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: '4px', sm: '6px' }, '&::after': { content: '""', flexGrow: 1e9 } }}>
    {SKELETON_RATIOS.map((r, i) => (
      <Box
        key={i}
        sx={(theme) => ({
          flexGrow: r,
          flexBasis: `${r * rowHeight}px`,
          aspectRatio: `${r}`,
          borderRadius: '6px',
          bgcolor: palette[theme.palette.mode].sunken,
          animation: 'gf-pulse 1.6s ease-in-out infinite',
          animationDelay: `${(i % 5) * 120}ms`,
          '@keyframes gf-pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.55 } },
        })}
      />
    ))}
  </Box>
);

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; body: string; action?: React.ReactNode }> = ({ icon, title, body, action }) => (
  <Box sx={{ py: { xs: 10, sm: 14 }, px: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
    <Box sx={(theme) => ({ width: 48, height: 48, borderRadius: '14px', display: 'grid', placeItems: 'center', mb: 2, color: 'text.secondary', bgcolor: palette[theme.palette.mode].elevated })}>
      {icon}
    </Box>
    <Typography sx={{ fontWeight: 600, fontSize: 16, mb: 0.75 }}>{title}</Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360, lineHeight: 1.6 }}>{body}</Typography>
    {action && <Box sx={{ mt: 2.5 }}>{action}</Box>}
  </Box>
);

const ImageGridContainer: React.FC<ImageGridContainerProps> = ({
  images,
  isLoading,
  error,
  thumbnailSize,
  currentPage,
  totalImages,
  imagesPerPage,
  onPageChange,
  onGoToFirstPage,
  onGoToLastPage,
  isMobile = false,
  isScanning = false,
  hasFilters = false,
  onClearFilters,
}) => {
  if (isLoading) return <GridSkeleton rowHeight={thumbnailSize} />;

  if (error) {
    return (
      <EmptyState
        icon={<ErrorOutlineRoundedIcon />}
        title="Couldn't load this folder"
        body={error}
      />
    );
  }

  if (images.length === 0 && isScanning) {
    return (
      <EmptyState
        icon={<CircularProgress size={22} thickness={5} color="inherit" />}
        title="Scanning your folder…"
        body="GalleryFlow is looking through this folder and its subfolders. Images appear here as they're found."
      />
    );
  }

  if (images.length === 0) {
    return hasFilters ? (
      <EmptyState
        icon={<ImageNotSupportedOutlinedIcon />}
        title="No images match this filter"
        body="Try another file type, or show all types again."
        action={onClearFilters && <Button variant="outlined" onClick={onClearFilters}>Show all types</Button>}
      />
    ) : (
      <EmptyState
        icon={<ImageNotSupportedOutlinedIcon />}
        title="No images here yet"
        body="This folder has no PNG, JPG or WebP images. If you just added some, rescan the folder from the sidebar."
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <ImageGrid images={images} thumbnailSize={thumbnailSize} />
      <PaginationControls
        currentPage={currentPage}
        totalImages={totalImages}
        imagesPerPage={imagesPerPage}
        onPageChange={onPageChange}
        onGoToFirstPage={onGoToFirstPage}
        onGoToLastPage={onGoToLastPage}
        isMobile={isMobile}
      />
    </Box>
  );
};

export default ImageGridContainer;
