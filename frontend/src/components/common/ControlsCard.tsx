import type { FC } from 'react';
import { Card, Box, IconButton, Tooltip } from '@mui/material';
import { ThumbnailSizeSlider } from './UIControls';
import { FileTypeFilter, SortButton } from './FilterControls';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { spacing } from '../../theme/themeConstants';

interface ControlsCardProps {
  thumbnailSize: number;
  onThumbnailSizeChange: (event: Event, value: number | number[]) => void;
  selectedFileTypes: string[];
  onFileTypeChange: (types: string[]) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
  sortDirection: 'asc' | 'desc';
  onSortDirectionToggle: () => void;
}

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
  <Card sx={{ p: spacing.md }}>
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' }, 
      gap: { xs: '8px', sm: '16px' }, 
      width: { xs: '100%', sm: 'auto' }, 
      alignItems: { xs: 'stretch', sm: 'center' } 
    }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: { xs: 3, sm: 5 }, alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
        <ThumbnailSizeSlider value={thumbnailSize} onChange={onThumbnailSizeChange} />
      </Box>
      <Box sx={{ display: { xs: 'flex', sm: 'flex' }, gap: { xs: 2, sm: 3 }, flexDirection: 'row', alignItems: 'center' }}>
        <FileTypeFilter
          selectedTypes={selectedFileTypes}
          onChange={onFileTypeChange}
        />
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
          <SortButton
            value={sortBy}
            onChange={onSortByChange}
          />
          <Tooltip title={sortDirection === 'asc' ? 'Sort by descending' : 'Sort by ascending'} arrow>
            <IconButton
              aria-label="Toggle sort direction"
              onClick={onSortDirectionToggle}
              sx={{
                ml: 0,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'grey.300',
                color: 'text.primary',
                transition: 'none !important',
              }}
            >
              {sortDirection === 'asc' ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  </Card>
);

export default ControlsCard;
