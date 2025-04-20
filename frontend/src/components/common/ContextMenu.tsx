import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { Portal } from './Portal';

interface ContextMenuProps {
  open: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onRevealInFolder?: () => void;
  onCopyPath?: () => void;
  onDelete?: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  open,
  position,
  onClose,
  onRevealInFolder,
  onCopyPath,
  onDelete
}) => {
  return (
    <Portal>
      <Menu
        open={open}
        onClose={onClose}
        anchorReference="anchorPosition"
        anchorPosition={
          position.y !== null && position.x !== null
            ? { top: position.y, left: position.x }
            : undefined
        }
      >
        {onRevealInFolder && (
          <MenuItem onClick={() => { onRevealInFolder(); onClose(); }}>
            <ListItemIcon>
              <FolderOpenIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Reveal in Folder</ListItemText>
          </MenuItem>
        )}
        {onCopyPath && (
          <MenuItem onClick={() => { onCopyPath(); onClose(); }}>
            <ListItemIcon>
              <ContentCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Copy Path</ListItemText>
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem onClick={() => { onDelete(); onClose(); }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Portal>
  );
};