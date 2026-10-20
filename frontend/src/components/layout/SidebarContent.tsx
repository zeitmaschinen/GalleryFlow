import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { AddFolderForm, FolderList } from '../folders';
import { SidebarFooter } from './Navigation';
import type { Folder } from '../images/types';

export interface SidebarContentProps {
  folders: Folder[];
  isLoadingFolders: boolean;
  selectedFolderId: number | null;
  onAddFolder: (path: string) => Promise<void>;
  onDeleteFolder: (id: number) => Promise<void>;
  onRefreshFolder: (id: number) => Promise<void>;
  onSelectFolder: (folder: Folder) => void;
}

/**
 * Folder library shown in the desktop sidebar and the mobile drawer.
 */
const SidebarContent: React.FC<SidebarContentProps> = ({
  folders,
  isLoadingFolders,
  selectedFolderId,
  onAddFolder,
  onDeleteFolder,
  onRefreshFolder,
  onSelectFolder,
}) => (
  <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1.5, pb: 2, overscrollBehavior: 'contain' }}>
      <Typography
        variant="overline"
        component="h2"
        sx={{ display: 'block', px: 1, mt: 1, mb: 0.5, fontSize: 11, color: 'text.disabled' }}
      >
        Library
      </Typography>

      {isLoadingFolders ? (
        <Box sx={{ px: 1 }}>
          {[0, 1].map(i => (
            <Skeleton key={i} variant="rounded" height={36} sx={{ mb: 0.5, borderRadius: '8px' }} />
          ))}
        </Box>
      ) : folders.length === 0 ? (
        <Typography variant="body2" sx={{ px: 1, py: 1, color: 'text.secondary', lineHeight: 1.5 }}>
          No folders yet. Add your ComfyUI output folder below to get started.
        </Typography>
      ) : (
        <FolderList
          folders={folders}
          onDeleteFolder={onDeleteFolder}
          onRefreshFolder={onRefreshFolder}
          onSelectFolder={onSelectFolder}
          selectedFolderId={selectedFolderId}
        />
      )}

      <Box sx={{ mt: 2, px: 0.5 }}>
        <AddFolderForm onAddFolder={onAddFolder} />
      </Box>
    </Box>
    <SidebarFooter />
  </Box>
);

export default SidebarContent;
