import React from 'react';
import { Box, CircularProgress, Alert, Card, Typography } from '@mui/material';
import { ImageGrid } from './';
import type { Image } from './types';
import { PaginationControls } from '../common';
import { spacing } from '../../theme/themeConstants';

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
}

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
  isMobile = false
}) => {
  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: spacing.md }}>
      <Card>
        {/* Dynamic image count */}
        {!isLoading && !error && images.length > 0 && (
          <Box sx={{
            mb: spacing.sm,
            mt: spacing.xs,
            pl: spacing.md,
            pt: spacing.sm,
          }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ fontWeight: 'medium' }}
            >
              Viewing {images.length} image{images.length !== 1 ? 's' : ''} on this page:
            </Typography>
          </Box>
        )}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: spacing.xl }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: spacing.md }}>{error}</Alert>
        ) : images.length === 0 ? (
          <Alert severity="info" sx={{ m: spacing.md }}>
            No images found in this folder. Try adding some images or changing your filters.
          </Alert>
        ) : (
          <ImageGrid 
            images={images} 
            thumbnailSize={thumbnailSize}
          />
        )}
      </Card>
      
      {!isLoading && !error && images.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: spacing.md }}>
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
      )}
    </Box>
  );
};

export default ImageGridContainer;
