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
  // Only allow sizes that visually change the image size in the grid
  const [isMobile, setIsMobile] = useState(false);
  const [allowedSizes, setAllowedSizes] = useState([100, 120, 150, 180, 250, 300, 400, 800]);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.matchMedia('(max-width:600px)').matches;
      const newAllowedSizes = isMobile
        ? [100, 120, 180]
        : [100, 120, 150, 180, 250, 300, 400, 800];
      setIsMobile(isMobile);
      setAllowedSizes(newAllowedSizes);
      // If the current value is not in the new allowedSizes, reset to the closest valid value
      if (!newAllowedSizes.includes(value)) {
        onChange(new Event('resize'), newAllowedSizes[0]);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [value, onChange]);

  const stopCount = allowedSizes.length;

  // Map slider index (0..stopCount-1) to actual size
  const sliderValue = allowedSizes.indexOf(value) !== -1 ? allowedSizes.indexOf(value) : 0;
  const handleSliderChange = (event: Event, newIndex: number | number[]) => {
    if (typeof newIndex === 'number') {
      onChange(event, allowedSizes[newIndex]);
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
      <Tooltip title={`${allowedSizes[sliderValue]}px (width)`} arrow placement="top">
        <Slider
          value={sliderValue}
          onChange={handleSliderChange}
          min={0}
          max={stopCount - 1}
          step={1}
          marks={Array.from({length: stopCount}, (_, i) => ({ value: i, label: '' }))}
          aria-label="Thumbnail size"
          valueLabelDisplay="off"
          size="medium"
          sx={{
            '& .MuiSlider-thumb': {
              width: 20,
              height: 20,
              '&:hover, &.Mui-focusVisible': {
                boxShadow: `0 0 0 10px ${alpha(colors.primary[isMobile ? 'light' : 'dark'].main, 0.18)}`,
              },
            },
            '& .MuiSlider-rail': {
              opacity: 0.4,
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

// Removed default export for clarity and tree-shaking
