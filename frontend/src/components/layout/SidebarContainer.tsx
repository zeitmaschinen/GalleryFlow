import React from 'react';
import { Box } from '@mui/material';
import { SidebarHeader } from './Navigation';
import SidebarContent from './SidebarContent';
import type { SidebarContentProps } from './SidebarContent';
import { layout } from '../../theme/themeConstants';

const SidebarContainer: React.FC<SidebarContentProps> = (props) => (
  <Box
    component="nav"
    aria-label="Folders"
    sx={{
      width: layout.sidebarWidth,
      height: '100vh',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      borderRight: 1,
      borderColor: 'divider',
      bgcolor: 'background.default',
    }}
  >
    <SidebarHeader />
    <SidebarContent {...props} />
  </Box>
);

export default SidebarContainer;
