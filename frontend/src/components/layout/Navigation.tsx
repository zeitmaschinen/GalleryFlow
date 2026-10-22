import React from 'react';
import { Box, Typography, useTheme, IconButton, Link } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import logoLight from '../../images/logo.png';
import logoDark from '../../images/logo-darkmode.png';
import { layout } from '../../theme/themeConstants';
import { APP_VERSION } from '../../constants';

// ===== BurgerMenu Component =====
interface BurgerMenuProps {
  onClick: () => void;
  sx?: Record<string, unknown>;
}

export const BurgerMenu: React.FC<BurgerMenuProps> = ({ onClick, sx }) => (
  <IconButton aria-label="Open folders" edge="start" onClick={onClick} sx={sx}>
    <MenuRoundedIcon />
  </IconButton>
);

export const Logo: React.FC = () => {
  const theme = useTheme();
  return (
    <img
      src={theme.palette.mode === 'dark' ? logoDark : logoLight}
      alt="GalleryFlow"
      style={{ height: 24, width: 'auto', display: 'block' }}
    />
  );
};

// ===== DrawerHeaderMobile Component =====
interface DrawerHeaderMobileProps {
  onClose: () => void;
}

export const DrawerHeaderMobile: React.FC<DrawerHeaderMobileProps> = ({ onClose }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: layout.headerHeight, px: 2.5, flexShrink: 0 }}>
    <Logo />
    <IconButton onClick={onClose} aria-label="Close folders" edge="end">
      <CloseRoundedIcon />
    </IconButton>
  </Box>
);

// ===== SidebarHeader Component =====
export const SidebarHeader: React.FC = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', height: layout.headerHeight, px: 2.5, flexShrink: 0 }}>
    <Logo />
  </Box>
);

// ===== SidebarFooter Component =====
export const SidebarFooter: React.FC = () => (
  <Box sx={{ px: 2.5, py: 1.75, flexShrink: 0, borderTop: 1, borderColor: 'divider' }}>
    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 11.5 }}>
      <Link
        href="https://github.com/zeitmaschinen/GalleryFlow"
        target="_blank"
        rel="noopener noreferrer"
        color="inherit"
        underline="hover"
      >
        GalleryFlow
      </Link>
      {' '}{APP_VERSION} · zeitmaschinen
    </Typography>
  </Box>
);
