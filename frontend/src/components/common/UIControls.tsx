import { Box, Slider, CircularProgress, Typography } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import type { FC, SyntheticEvent } from 'react';
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
  onChange: (event: Event | SyntheticEvent<Element, Event>, newValue: number | number[]) => void;
}

/**
 * A slider component for adjusting thumbnail size in a grid view
 * Uses onChangeCommitted for consistent cross-browser behavior
 */
export const ThumbnailSizeSlider: FC<ThumbnailSizeSliderProps> = ({ value, onChange }) => {
  const MIN_SIZE = 150;
  const MAX_SIZE = 250;
  
  // Handle slider change after commit - fires when user finishes dragging or clicking
  const handleSliderChangeCommitted = (event: Event | SyntheticEvent<Element, Event>, newValue: number | number[]) => {
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
        onChangeCommitted={handleSliderChangeCommitted}
        min={MIN_SIZE}
        max={MAX_SIZE}
        step={1}
        aria-label="Thumbnail size"
        valueLabelDisplay="off"
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

export const ProgressBar: FC<ProgressBarProps> = ({ progress, label }) => {
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

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({ 
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
