import { Box, Slider } from '@mui/material';
import PhotoSizeSelectSmallRoundedIcon from '@mui/icons-material/PhotoSizeSelectSmallRounded';
import PhotoSizeSelectLargeRoundedIcon from '@mui/icons-material/PhotoSizeSelectLargeRounded';
import type { FC, SyntheticEvent } from 'react';
import { MIN_ROW_HEIGHT, MAX_ROW_HEIGHT } from '../../constants';

// ===== ThumbnailSizeSlider Component =====
interface ThumbnailSizeSliderProps {
  value: number;
  onChange: (event: Event | SyntheticEvent<Element, Event>, newValue: number | number[]) => void;
}

/**
 * Compact slider that sets the gallery's row height. Updates live while dragging.
 */
export const ThumbnailSizeSlider: FC<ThumbnailSizeSliderProps> = ({ value, onChange }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 150 }, px: 0.5, color: 'text.disabled' }}>
    <PhotoSizeSelectSmallRoundedIcon sx={{ fontSize: 16 }} aria-hidden />
    <Slider
      value={value}
      onChange={onChange}
      min={MIN_ROW_HEIGHT}
      max={MAX_ROW_HEIGHT}
      step={10}
      aria-label="Thumbnail size"
      size="small"
    />
    <PhotoSizeSelectLargeRoundedIcon sx={{ fontSize: 18 }} aria-hidden />
  </Box>
);
