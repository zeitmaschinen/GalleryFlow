import React from 'react';
import { Drawer } from '@mui/material';
import { DrawerHeaderMobile } from './Navigation';
import SidebarContent from './SidebarContent';
import type { SidebarContentProps } from './SidebarContent';
import type { Folder } from '../images/types';
import { layout } from '../../theme/themeConstants';

interface MobileSidebarProps extends SidebarContentProps {
  open: boolean;
  onClose: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ open, onClose, onSelectFolder, ...rest }) => {
  // Close the drawer once a folder is picked, so the gallery is visible right away
  const handleSelectFolder = (folder: Folder) => {
    onSelectFolder(folder);
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        sx: {
          width: layout.sidebarWidth + 16,
          maxWidth: '85vw',
          bgcolor: 'background.default',
          backgroundImage: 'none',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DrawerHeaderMobile onClose={onClose} />
      <SidebarContent {...rest} onSelectFolder={handleSelectFolder} />
    </Drawer>
  );
};

export default MobileSidebar;
