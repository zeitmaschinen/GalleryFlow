import React, { useEffect, useState } from 'react';
import { Box, Slider, alpha, CircularProgress, Typography, Tooltip } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import { borders, colors, typography } from '../theme/themeConstants';

// ===== ThumbnailSizeSlider Component =====
interface ThumbnailSizeSliderProps {
  value: number;
  onChange: (event: Event, newValue: number | number[]) => void;
}

/**
 * A slider component for adjusting thumbnail size in a grid view
 */
export const ThumbnailSizeSlider: React.FC<ThumbnailSizeSliderProps> = ({ value, onChange }) => {
  // Define thumbnail sizes that effectively change the grid layout
  // These sizes ensure actual visible changes in the grid
  const thumbnailSizes = [100, 120, 150, 180, 220, 260, 300, 340, 380, 420, 500, 600, 800];
  
  // Find the closest valid size for the current value
  const getClosestSize = (val: number) => {
    return thumbnailSizes.reduce((prev, curr) => 
      Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
    );
  };
  
  // Map the continuous slider value to the closest meaningful size
  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      // Find the closest size that will actually make a difference in the layout
      const closestSize = getClosestSize(newValue);
      onChange(event, closestSize);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2,
      minWidth: 260,
      maxWidth: 400,
      bgcolor: 'background.paper',
      p: 1.5,
      borderRadius: borders.radius.sm,
      border: 0,
      boxShadow: 'none',
    }}>
      <GridViewIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
      <Tooltip title={`${value}px (width)`} arrow placement="top">
        <Slider
          value={value}
          onChange={handleSliderChange}
          min={100}
          max={800}
          step={1}
          aria-label="Thumbnail size"
          valueLabelDisplay="off"
          size="medium"
          marks={thumbnailSizes.map(size => ({ value: size, label: '' }))}
          sx={{
            '& .MuiSlider-thumb': {
              width: 20,
              height: 20,
              '&:hover, &.Mui-focusVisible': {
                boxShadow: (theme) => `0 0 0 10px ${alpha(theme.palette.primary.main, 0.18)}`,
              },
            },
            '& .MuiSlider-rail': {
              opacity: 0.4,
            },
            '& .MuiSlider-mark': {
              backgroundColor: 'primary.main',
              height: 8,
              width: 2,
              opacity: 0.3,
            },
          }}
        />
      </Tooltip>
    </Box>
  );
};

// ===== ProgressBar Component =====
interface ProgressBarProps {
  progress: number;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label }) => {
  return (
    <Box>
      {label && (
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block', 
            mb: 0.5,
            color: 'text.secondary',
            fontSize: typography.sizes.xs
          }}
        >
          {label}
        </Typography>
      )}
      <Box 
        sx={{ 
          height: 4,
          bgcolor: theme => theme.palette.mode === 'dark' ? colors.common.hoverDark : colors.common.hoverLight,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            width: `${progress}%`,
            height: '100%',
            bgcolor: 'primary.main',
            transition: 'width 0.3s ease-in-out'
          }}
        />
      </Box>
    </Box>
  );
};

// ===== LoadingSpinner Component =====
interface LoadingSpinnerProps {
  size?: number;
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 40,
  overlay = false
}) => {
  if (overlay) {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 1000
        }}
      >
        <CircularProgress size={size} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <CircularProgress size={size} />
    </Box>
  );
};
