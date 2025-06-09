import React from 'react';
import { Box, Slider, CircularProgress, Typography } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import { 
  thumbnailSizeSliderContainerSx, 
  thumbnailSizeIconSx, 
  thumbnailSizeSliderSx,
  progressBarLabelSx,
  progressBarContainerSx,
  progressBarFillSx,
  loadingSpinnerOverlaySx,
  loadingSpinnerContainerSx
} from '../../theme/controlStyles';

// ===== ThumbnailSizeSlider Component =====
interface ThumbnailSizeSliderProps {
  value: number;
  onChange: (event: Event, newValue: number | number[]) => void;
}

/**
 * A slider component for adjusting thumbnail size in a grid view
 */
export const ThumbnailSizeSlider: React.FC<ThumbnailSizeSliderProps> = ({ value, onChange }) => {
  // Use a continuous approach for thumbnail sizes
  // Define min and max sizes
  const MIN_SIZE = 150;
  const MAX_SIZE = 500;
  
  // Handle slider change with continuous values
  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      // Round to nearest 5px for smoother experience
      const roundedSize = Math.round(newValue / 5) * 5;
      onChange(event, roundedSize);
    }
  };

  return (
    <Box sx={thumbnailSizeSliderContainerSx}>
      <GridViewIcon sx={thumbnailSizeIconSx} />
      <Slider
        value={value}
        onChange={handleSliderChange}
        min={MIN_SIZE}
        max={MAX_SIZE}
        step={1}
        aria-label="Thumbnail size"
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => `${value}px`}
        size="medium"
        marks={false}
        sx={thumbnailSizeSliderSx}
      />
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
          sx={progressBarLabelSx}
        >
          {label}
        </Typography>
      )}
      <Box sx={progressBarContainerSx}>
        <Box sx={progressBarFillSx(progress)} />
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
      <Box sx={loadingSpinnerOverlaySx}>
        <CircularProgress size={size} />
      </Box>
    );
  }

  return (
    <Box sx={loadingSpinnerContainerSx}>
      <CircularProgress size={size} />
    </Box>
  );
};
