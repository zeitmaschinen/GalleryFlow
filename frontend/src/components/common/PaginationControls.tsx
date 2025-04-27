import React from 'react';
import { Box, Button, Pagination } from '@mui/material';

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
  onGoToFirstPage,
  onGoToLastPage,
  isMobile,
}) => {
  const lastPage = Math.ceil(totalImages / imagesPerPage);
  if (totalImages <= imagesPerPage) return null;
  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: { xs: 1, md: 2 },
      p: { xs: 1, md: 2 },
      borderTop: 1,
      borderColor: 'divider',
    }}>
      {!isMobile && (
        <Button
          size="small"
          variant="text"
          onClick={onGoToFirstPage}
          disabled={currentPage === 1}
          sx={{ textTransform: 'none', minWidth: 'auto', px: 1 }}
        >
          First Page
        </Button>
      )}
      <Pagination
        count={lastPage}
        page={currentPage}
        onChange={onPageChange}
        color="primary"
        shape="rounded"
        size={isMobile ? 'large' : 'medium'}
        showFirstButton={isMobile}
        showLastButton={isMobile}
        hidePrevButton={isMobile}
        hideNextButton={isMobile}
        siblingCount={isMobile ? 1 : 1}
        boundaryCount={isMobile ? 0 : 1}
      />
      {!isMobile && (
        <Button
          size="small"
          variant="text"
          onClick={onGoToLastPage}
          disabled={currentPage === lastPage}
          sx={{ textTransform: 'none', minWidth: 'auto', px: 1 }}
        >
          Last Page
        </Button>
      )}
    </Box>
  );
};

export default PaginationControls;
