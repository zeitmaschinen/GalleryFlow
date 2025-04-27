import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Divider,
  Paper
} from '@mui/material';
import { AddFolderForm } from '../folders';
import { FolderList } from '../folders';
import { SidebarHeader, SidebarFooter } from './Navigation';
import { typography, spacing } from '../../theme/themeConstants';
import type { Folder } from '../../types';

interface SidebarContainerProps {
  folders: Folder[];
  isLoadingFolders: boolean;
  selectedFolderId: number | null;
  onAddFolder: (path: string) => Promise<void>;
  onDeleteFolder: (id: number) => Promise<void>;
  onRefreshFolder: (id: number) => Promise<void>;
  onSelectFolder: (folder: Folder) => void;
}

const SidebarContainer: React.FC<SidebarContainerProps> = ({
  folders,
  isLoadingFolders,
  selectedFolderId,
  onAddFolder,
  onDeleteFolder,
  onRefreshFolder,
  onSelectFolder
}) => {
  return (
    <Paper
      elevation={2}
      sx={{
        width: 280,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: 1,
        borderColor: 'divider',
        position: 'relative',
        zIndex: 1201,
        flexShrink: 0
      }}
    >
      <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Logo Area */}
        <SidebarHeader />
        
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
    </Paper>
  );
};

export default SidebarContainer;
