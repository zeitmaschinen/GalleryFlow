import type { FC } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { typography } from '../../theme/themeConstants';

interface FolderHeaderProps {
  selectedFolder: { path: string };
}

const FolderHeader: FC<FolderHeaderProps> = ({ selectedFolder }) => (
  <Box sx={{
    px: { xs: 1, md: 2 },
    pt: 0.5,
    pb: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <Tooltip title={`Full path: ${selectedFolder.path}`} enterDelay={300} arrow placement="top">
      <Typography
        variant="h3"
        sx={{
          fontSize: 28,
          fontWeight: typography.fontWeights.bold,
          color: (theme) => theme.palette.mode === 'dark'
            ? theme.palette.primary.light
            : theme.palette.primary.dark,
          letterSpacing: 1,
          mb: 1,
          mt: 0,
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        data-testid="folder-header-name"
      >
        {`/${selectedFolder.path.replace(/\\/g, '/').split('/').filter(Boolean).pop()}/`}
      </Typography>
    </Tooltip>
    <Tooltip title="Copy full folder path" enterDelay={300} arrow placement="top">
      <IconButton
        aria-label="Copy folder path"
        size="small"
        sx={{ ml: 1 }}
        onClick={() => {
          navigator.clipboard.writeText(selectedFolder.path);
        }}
      >
        <ContentCopyIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  </Box>
);

export default FolderHeader;
