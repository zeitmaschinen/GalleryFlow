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
} from '../theme/controlStyles';

// ===== ThumbnailSizeSlider Component =====
interface ThumbnailSizeSliderProps {
  value: number;
  onChange: (event: Event, newValue: number | number[]) => void;
}

/**
 * A slider component for adjusting thumbnail size in a grid view
 */
export const ThumbnailSizeSlider: React.FC<ThumbnailSizeSliderProps> = ({ value, onChange }) => {
  // Define sizes with evenly spaced values (50px increments)
  const thumbnailSizes = [100, 150, 200, 250, 300, 350, 400, 450, 500];
  
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
    <Box sx={thumbnailSizeSliderContainerSx}>
      <GridViewIcon sx={thumbnailSizeIconSx} />
      <Slider
        value={value}
        onChange={handleSliderChange}
        min={100}
        max={500}
        step={1}
        aria-label="Thumbnail size"
        valueLabelDisplay="off"
        size="medium"
        marks={thumbnailSizes.map(size => ({ value: size, label: '' }))}
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
