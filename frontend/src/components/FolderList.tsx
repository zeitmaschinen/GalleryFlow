import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Tooltip,
  alpha,
  CircularProgress,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import { Folder } from '../services/api';
import { styled } from '@mui/system';
import { colors } from '../theme/themeConstants';
import { useTheme } from '@mui/material';
import type { Transitions } from '@mui/material/styles';

const FolderItem = styled(ListItem)(({ theme }) => {
  const mode = theme.palette.mode === 'dark' ? 'dark' : 'light';
  return {
    position: 'relative',
    width: '100%',
    margin: 0,
    padding: 0,
    '&:hover': {
      '&::before': {
        backgroundColor: alpha(colors.primary[mode].main, 0.04),
      }
    },
    '&.selected': {
      '&::before': {
        backgroundColor: alpha(colors.primary[mode].main, 0.12),
      },
      '&:hover::before': {
        backgroundColor: alpha(colors.primary[mode].main, 0.16),
      }
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      transition: theme.transitions && typeof (theme.transitions as Transitions).create === 'function'
        ? (theme.transitions as Transitions).create(['background-color'])
        : undefined,
      zIndex: 0
    }
  };
});

interface FolderListProps {
  folders: Folder[];
  selectedFolderId: number | null;
  onDeleteFolder: (id: number) => void;
  onRefreshFolder: (id: number) => Promise<void>;
  onSelectFolder: (folder: Folder) => void;
}

const FolderList: React.FC<FolderListProps> = ({
  folders,
  selectedFolderId,
  onDeleteFolder,
  onRefreshFolder,
  onSelectFolder,
}) => {
  const [refreshingFolders, setRefreshingFolders] = useState<number[]>([]);
  const theme = useTheme();
  const mode = theme.palette.mode === 'dark' ? 'dark' : 'light';

  const handleRefresh = async (folderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (refreshingFolders.includes(folderId)) return;

    setRefreshingFolders(prev => [...prev, folderId]);
    try {
      await onRefreshFolder(folderId);
    } finally {
      setRefreshingFolders(prev => prev.filter(id => id !== folderId));
    }
  };

  const handleDelete = (folderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteFolder(folderId);
  };

  return (
    <List sx={{ m: 0, p: 0, width: '100%' }}>
      {folders.map((folder) => {
        const isSelected = folder.id === selectedFolderId;
        const isRefreshing = refreshingFolders.includes(folder.id);

        return (
          <FolderItem
            key={folder.id}
            disablePadding
            className={isSelected ? 'selected' : ''}
          >
            <ListItemButton
              selected={isSelected}
              onClick={() => onSelectFolder(folder)}
              sx={{
                width: '100%',
                minWidth: 0,
                py: 1,
                px: 1,
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'transparent',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: 0, pl: 1 }}>
                <FolderIcon
                  sx={{
                    mr: 1,
                    transition: 'color 0.2s',
                    color: isSelected ? colors.primary[mode].main : 'text.secondary',
                  }}
                />
                <ListItemText
                  primary={
                    <Tooltip title={folder.path} enterDelay={300} arrow>
                      <Typography
                        variant="body2"
                        sx={{
                          transition: 'all 0.2s',
                          fontWeight: isSelected ? '600' : '400',
                          color: isSelected ? colors.primary[mode].main : 'text.primary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '120px',
                          direction: 'rtl',
                          textAlign: 'left',
                          minWidth: 0,
                          flexShrink: 1
                        }}
                      >
                        {folder.path}
                      </Typography>
                    </Tooltip>
                  }
                  sx={{
                    minWidth: 0,
                    mr: 0.5
                  }}
                />
              </Box>
              <Box sx={{
                display: 'flex',
                gap: 0.5,
                ml: 1,
                alignItems: 'center',
                flexShrink: 0
              }}>
                <Tooltip title="Refresh folder">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => handleRefresh(folder.id, e)}
                    disabled={isRefreshing}
                    sx={{
                      color: 'text.secondary',
                      p: '2px',
                      '&:hover': {
                        color: colors.primary[mode].main,
                        bgcolor: alpha(colors.primary[mode].main, 0.08),
                      }
                    }}
                  >
                    {isRefreshing ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                        refresh
                      </span>
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete folder">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => handleDelete(folder.id, e)}
                    sx={{
                      color: 'text.secondary',
                      p: '2px',
                      '&:hover': {
                        color: colors.common.error,
                        bgcolor: alpha(colors.common.error, 0.08),
                      }
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      delete
                    </span>
                  </IconButton>
                </Tooltip>
              </Box>
            </ListItemButton>
          </FolderItem>
        );
      })}
    </List>
  );
};

export default FolderList;