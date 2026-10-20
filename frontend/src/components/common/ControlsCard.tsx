import type { FC } from 'react';
import { Box, IconButton, Tooltip, Divider } from '@mui/material';
import { ThumbnailSizeSlider } from './UIControls';
import { FileTypeFilter, SortButton } from './FilterControls';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

interface ControlsCardProps {
  thumbnailSize: number;
  onThumbnailSizeChange: (event: Event | React.SyntheticEvent<Element, Event>, value: number | number[]) => void;
  selectedFileTypes: string[];
  onFileTypeChange: (types: string[]) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
  sortDirection: 'asc' | 'desc';
  onSortDirectionToggle: () => void;
}

/**
 * The gallery toolbar: thumbnail size, file-type filter and sort controls in one row.
 */
const ControlsCard: FC<ControlsCardProps> = ({
  thumbnailSize,
  onThumbnailSizeChange,
  selectedFileTypes,
  onFileTypeChange,
  sortBy,
  onSortByChange,
  sortDirection,
  onSortDirectionToggle,
}) => (
  <Box role="toolbar" aria-label="Gallery controls" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
    <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center' }}>
      <ThumbnailSizeSlider value={thumbnailSize} onChange={onThumbnailSizeChange} />
      <Divider orientation="vertical" flexItem sx={{ mx: 1.5, my: 1 }} />
    </Box>
    <FileTypeFilter selectedTypes={selectedFileTypes} onChange={onFileTypeChange} />
    <SortButton value={sortBy} onChange={onSortByChange} />
    <Tooltip title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}>
      <IconButton
        aria-label={`Sort direction: ${sortDirection === 'asc' ? 'ascending' : 'descending'}. Click to reverse.`}
        onClick={onSortDirectionToggle}
        sx={{ width: 34, height: 34, color: 'text.primary' }}
      >
        {sortDirection === 'asc'
          ? <ArrowUpwardRoundedIcon sx={{ fontSize: 18 }} />
          : <ArrowDownwardRoundedIcon sx={{ fontSize: 18 }} />}
      </IconButton>
    </Tooltip>
  </Box>
);

export default ControlsCard;
