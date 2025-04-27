import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import { typography, spacing } from '../../theme/themeConstants';

interface StatsCardsProps {
  totalImages: number;
  currentPage: number;
  totalPages: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({ totalImages, currentPage, totalPages }) => (
  <Box sx={{ 
    display: 'grid', 
    gap: spacing.md, 
    gridTemplateColumns: 'repeat(3, 1fr)',
    '& > *': { minWidth: 0 }
  }}>
    <Card sx={{ p: { xs: spacing.sm, sm: spacing.md } }}>
      <Typography variant="subtitle2" color="text.secondary" noWrap sx={{ fontWeight: typography.fontWeights.medium }}>
        Total Images
      </Typography>
      <Typography variant="h4" sx={{ mt: spacing.sm, mb: 1, fontSize: { xs: typography.sizes.xl, sm: typography.sizes['3xl'] }, fontWeight: typography.fontWeights.semibold }}>
        {totalImages}
      </Typography>
    </Card>
    <Card sx={{ p: { xs: spacing.sm, sm: spacing.md } }}>
      <Typography variant="subtitle2" color="text.secondary" noWrap sx={{ fontWeight: typography.fontWeights.medium }}>
        Current Page
      </Typography>
      <Typography variant="h4" sx={{ mt: spacing.sm, mb: 1, fontSize: { xs: typography.sizes.xl, sm: typography.sizes['3xl'] }, fontWeight: typography.fontWeights.semibold }}>
        {currentPage}
      </Typography>
    </Card>
    <Card sx={{ p: { xs: spacing.sm, sm: spacing.md } }}>
      <Typography variant="subtitle2" color="text.secondary" noWrap sx={{ fontWeight: typography.fontWeights.medium }}>
        Pages
      </Typography>
      <Typography variant="h4" sx={{ mt: spacing.sm, mb: 1, fontSize: { xs: typography.sizes.xl, sm: typography.sizes['3xl'] }, fontWeight: typography.fontWeights.semibold }}>
        {totalPages}
      </Typography>
    </Card>
  </Box>
);

export default StatsCards;
