import React from 'react';
import { Box, styled, Typography, useTheme, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import CollectionsIcon from '@mui/icons-material/Collections';

// ===== BurgerMenu Component =====
interface BurgerMenuProps {
  onClick: () => void;
  sx?: Record<string, unknown>;
}

export const BurgerMenu: React.FC<BurgerMenuProps> = ({ onClick, sx }) => (
  <IconButton
    color="inherit"
    aria-label="open sidebar"
    edge="start"
    onClick={onClick}
    sx={sx}
  >
    <MenuIcon />
  </IconButton>
);

// ===== DrawerHeaderMobile Component =====
interface DrawerHeaderMobileProps {
  onClose: () => void;
}

export const DrawerHeaderMobile: React.FC<DrawerHeaderMobileProps> = ({ onClose }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, pb: 0 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <CollectionsIcon sx={{ color: 'primary.main', fontSize: '2rem' }} />
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        GalleryFlow
      </Typography>
    </Box>
    <IconButton onClick={onClose} aria-label="Close sidebar" sx={{ ml: 1 }}>
      <CloseIcon />
    </IconButton>
  </Box>
);

// ===== Sidebar Container =====
export const SidebarContainer = styled(Box)(({ theme }) => ({
  width: '280px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRight: `1px solid ${theme.palette.divider}`,
  padding: 0,
  backgroundColor: theme.palette.background.paper,
  overflow: 'hidden',
  position: 'relative'
}));

// ===== SidebarFooter Component =====

export const SidebarFooter: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTop: `1px solid ${theme.palette.divider}`,
        py: 1.5,
        px: 2,
        mt: 'auto',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          fontSize: '0.75rem',
        }}
      >
        &copy; 2025{' '}
        <a 
          href="https://github.com/zeitmaschinen/galleryflow" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            color: 'inherit', 
            textDecoration: 'underline',
            textUnderlineOffset: '2px'
          }}
        >
          zeitmaschinen
        </a>
      </Typography>
    </Box>
  );
};

// Removed default export for clarity and tree-shaking
