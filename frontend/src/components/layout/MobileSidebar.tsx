import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Divider,
  Drawer
} from '@mui/material';
import { AddFolderForm } from '../folders';
import { FolderList } from '../folders';
import { DrawerHeaderMobile } from './Navigation';
import { SidebarFooter } from './Navigation';
import { typography, spacing } from '../../theme/themeConstants';
import type { Folder } from '../../types';

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  folders: Folder[];
  isLoadingFolders: boolean;
  selectedFolderId: number | null;
  onAddFolder: (path: string) => Promise<void>;
  onDeleteFolder: (id: number) => Promise<void>;
  onRefreshFolder: (id: number) => Promise<void>;
  onSelectFolder: (folder: Folder) => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  open,
  onClose,
  folders,
  isLoadingFolders,
  selectedFolderId,
  onAddFolder,
  onDeleteFolder,
  onRefreshFolder,
  onSelectFolder
}) => {
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
        }
      }}
    >
      <DrawerHeaderMobile onClose={onClose} />
      <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Add Folder Section */}
        <Box sx={{ p: spacing.md }}>
          <AddFolderForm onAddFolder={onAddFolder} />
        </Box>
        <Divider />
        {/* Folder List */}
        <Box sx={{ 
          p: spacing.md, 
          flexGrow: 1, 
          overflow: 'auto',
          scrollBehavior: 'smooth',
          overscrollBehavior: 'none'
        }}>
          <Typography 
            variant="subtitle2" 
            color="text.secondary" 
            sx={{ 
              mb: spacing.sm,
              pl: 0,
              letterSpacing: '0.1em',
              fontWeight: typography.fontWeights.medium 
            }}
          >
            MAPPED FOLDERS
          </Typography>
          {isLoadingFolders ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: spacing.sm }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <FolderList
              folders={folders}
              onDeleteFolder={onDeleteFolder}
              onRefreshFolder={onRefreshFolder}
              onSelectFolder={onSelectFolder}
              selectedFolderId={selectedFolderId}
            />
          )}
        </Box>
        <Box sx={{ mt: 'auto' }}><SidebarFooter /></Box>
      </Box>
    </Drawer>
  );
};

export default MobileSidebar;
