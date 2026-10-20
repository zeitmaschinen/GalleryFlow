import React from 'react';
import { Box, Pagination } from '@mui/material';

interface PaginationControlsProps {
  totalImages: number;
  imagesPerPage: number;
  currentPage: number;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
  onGoToFirstPage: () => void;
  onGoToLastPage: () => void;
  isMobile: boolean;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  totalImages,
  imagesPerPage,
  currentPage,
  onPageChange,
  isMobile,
}) => {
  const lastPage = Math.ceil(totalImages / imagesPerPage);
  if (totalImages <= imagesPerPage) return null;

  return (
    <Box component="nav" aria-label="Pages" sx={{ display: 'flex', justifyContent: 'center' }}>
      <Pagination
        count={lastPage}
        page={currentPage}
        onChange={(event, page) => {
          onPageChange(event, page);
          // Start the new page from the top of the gallery
          document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        shape="rounded"
        size={isMobile ? 'medium' : 'large'}
        showFirstButton={!isMobile}
        showLastButton={!isMobile}
        siblingCount={isMobile ? 0 : 1}
      />
    </Box>
  );
};

export default PaginationControls;
