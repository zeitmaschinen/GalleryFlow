import { SxProps, Theme, alpha } from '@mui/material';
import { borders, colors } from './themeConstants';

/**
 * Styles for the ThumbnailSizeSlider component
 */
export const thumbnailSizeSliderContainerSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  minWidth: 260,
  maxWidth: 400,
  bgcolor: (theme) => theme.palette.mode === 'dark' 
    ? colors.sliderBox.dark.background 
    : colors.sliderBox.light.background,
  p: 1.5,
  borderRadius: borders.radius.sm,
  border: 0,
  boxShadow: 'none',
};

export const thumbnailSizeIconSx: SxProps<Theme> = {
  color: 'text.secondary',
  fontSize: 28,
};

export const thumbnailSizeSliderSx: SxProps<Theme> = {
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
};

/**
 * Styles for the ProgressBar component
 */
export const progressBarLabelSx: SxProps<Theme> = {
  display: 'block',
  mb: 0.5,
  color: 'text.secondary',
  fontSize: '0.75rem'
};

export const progressBarContainerSx: SxProps<Theme> = {
  height: 4,
  bgcolor: 'rgba(0, 0, 0, 0.1)',
  borderRadius: 2,
  overflow: 'hidden'
};

export const progressBarFillSx = (progress: number): SxProps<Theme> => ({
  width: `${progress}%`,
  height: '100%',
  bgcolor: 'primary.main',
  transition: 'width 0.3s ease-in-out'
});

/**
 * Styles for the LoadingSpinner component
 */
export const loadingSpinnerOverlaySx: SxProps<Theme> = {
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
};

export const loadingSpinnerContainerSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  p: 2
};
