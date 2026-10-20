import { useState } from 'react';
import type { FC, MouseEvent } from 'react';
import { Box, ButtonBase, IconButton, Tooltip, Typography, CircularProgress } from '@mui/material';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Folder } from './types';
import { palette, borders, typography } from '../../theme/themeConstants';
import { folderName } from '../../utils/fileUtils';

interface FolderListProps {
  folders: Folder[];
  selectedFolderId: number | null;
  onDeleteFolder: (id: number) => void;
  onRefreshFolder: (id: number) => Promise<void>;
  onSelectFolder: (folder: Folder) => void;
}

const FolderList: FC<FolderListProps> = ({
  folders,
  selectedFolderId,
  onDeleteFolder,
  onRefreshFolder,
  onSelectFolder,
}) => {
  const [refreshingFolders, setRefreshingFolders] = useState<number[]>([]);

  const handleRefresh = async (folderId: number, e: MouseEvent) => {
    e.stopPropagation();
    if (refreshingFolders.includes(folderId)) return;

    setRefreshingFolders(prev => [...prev, folderId]);
    try {
      await onRefreshFolder(folderId);
    } finally {
      setRefreshingFolders(prev => prev.filter(id => id !== folderId));
    }
  };

  const handleDelete = (folderId: number, e: MouseEvent) => {
    e.stopPropagation();
    onDeleteFolder(folderId);
  };

  return (
    <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {folders.map((folder) => {
        const isSelected = folder.id === selectedFolderId;
        const isRefreshing = refreshingFolders.includes(folder.id);

        return (
          <Box
            component="li"
            key={folder.id}
            sx={(theme) => {
              const p = palette[theme.palette.mode];
              return {
                position: 'relative',
                borderRadius: borders.radius.md,
                bgcolor: isSelected ? p.accentSoft : 'transparent',
                transition: 'background-color 160ms',
                '&:hover': { bgcolor: isSelected ? p.accentSoft : theme.palette.action.hover },
                '& .folder-actions': { opacity: isRefreshing ? 1 : 0, transition: 'opacity 160ms' },
                '&:hover .folder-actions, &:focus-within .folder-actions': { opacity: 1 },
                '@media (hover: none)': { '& .folder-actions': { opacity: 1 } },
              };
            }}
          >
            <Tooltip title={folder.path} placement="right" enterDelay={700}>
              <ButtonBase
                onClick={() => onSelectFolder(folder)}
                aria-current={isSelected ? 'true' : undefined}
                sx={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  gap: 1.25,
                  py: 1,
                  pl: 1.25,
                  pr: 8,
                  borderRadius: borders.radius.md,
                  textAlign: 'left',
                }}
              >
                <FolderRoundedIcon
                  sx={(theme) => ({
                    fontSize: 18,
                    flexShrink: 0,
                    color: isSelected ? palette[theme.palette.mode].accentText : 'text.disabled',
                  })}
                />
                <Typography
                  variant="body2"
                  noWrap
                  sx={(theme) => ({
                    fontWeight: isSelected ? typography.fontWeights.semibold : typography.fontWeights.medium,
                    color: isSelected ? palette[theme.palette.mode].accentText : 'text.primary',
                  })}
                >
                  {folderName(folder.path)}
                </Typography>
              </ButtonBase>
            </Tooltip>

            <Box
              className="folder-actions"
              sx={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}
            >
              <Tooltip title="Rescan folder">
                <span>
                  <IconButton
                    size="small"
                    aria-label={`Rescan ${folderName(folder.path)}`}
                    onClick={(e) => handleRefresh(folder.id, e)}
                    disabled={isRefreshing}
                    sx={{ p: 0.5 }}
                  >
                    {isRefreshing
                      ? <CircularProgress size={14} color="inherit" />
                      : <RefreshRoundedIcon sx={{ fontSize: 17 }} />}
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Remove from library">
                <IconButton
                  size="small"
                  aria-label={`Remove ${folderName(folder.path)} from library`}
                  onClick={(e) => handleDelete(folder.id, e)}
                  sx={(theme) => ({
                    p: 0.5,
                    '&:hover': { color: theme.palette.error.main },
                  })}
                >
                  <CloseRoundedIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default FolderList;
