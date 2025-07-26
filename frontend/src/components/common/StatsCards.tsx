import React from 'react';
import { Box, Card, Typography, useTheme } from '@mui/material';
import { typography, spacing, colors } from '../../theme/themeConstants';

interface StatsCardsProps {
  totalImages: number;
  currentPage: number;
  totalPages: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({ totalImages, currentPage, totalPages }) => {
  const theme = useTheme();
  const mode = theme.palette.mode === 'dark' ? 'dark' : 'light';
  
  return (
    <Box sx={{ 
      display: 'grid', 
      gap: spacing.md, 
      gridTemplateColumns: 'repeat(3, 1fr)', // Back to 3 columns as requested
      '& > *': { minWidth: 0 }
    }}>
      {/* Total Images card with inline layout */}
      <Card sx={{ p: { xs: spacing.sm, sm: spacing.md } }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: { xs: typography.sizes.lg, sm: typography.sizes.xl }, 
            fontWeight: typography.fontWeights.medium,
            lineHeight: 1.2,
            '& span': {
              color: colors.primary[mode].main // Purple color for numbers, same as selected folder
            }
          }}
        >
          Total images: <span>{totalImages}</span>
        </Typography>
      </Card>
      
      {/* Current Page card with inline layout */}
      <Card sx={{ p: { xs: spacing.sm, sm: spacing.md } }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: { xs: typography.sizes.lg, sm: typography.sizes.xl }, 
            fontWeight: typography.fontWeights.medium,
            lineHeight: 1.2,
            '& span': {
              color: colors.primary[mode].main // Purple color for numbers, same as selected folder
            }
          }}
        >
          Current page: <span>{currentPage}</span>
        </Typography>
      </Card>
      
      {/* Total Pages card with inline layout */}
      <Card sx={{ p: { xs: spacing.sm, sm: spacing.md } }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: { xs: typography.sizes.lg, sm: typography.sizes.xl }, 
            fontWeight: typography.fontWeights.medium,
            lineHeight: 1.2,
            '& span': {
              color: colors.primary[mode].main // Purple color for numbers, same as selected folder
            }
          }}
        >
          Total pages: <span>{totalPages}</span>
        </Typography>
      </Card>
    </Box>
  );
};

export default StatsCards;
