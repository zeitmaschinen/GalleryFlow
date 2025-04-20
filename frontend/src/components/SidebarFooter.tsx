import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { colors } from '../theme/themeConstants';

const SidebarFooter: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const textColor = isDark ? colors.text.dark.secondary : colors.text.light.secondary;
  const linkColor = isDark ? colors.link.dark : colors.link.light;
  const linkHover = isDark ? colors.link.hoverDark : colors.link.hoverLight;

  return (
    <Box sx={{ p: 2, textAlign: 'center', opacity: 0.7, fontSize: 13 }}>
      <Typography variant="caption" component="div" sx={{ color: textColor }}>
        2025{' '}
        <a
          href="https://github.com/zeitmaschinen/galleryflow"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: linkColor, textDecoration: 'underline', transition: 'color 0.2s' }}
          onMouseOver={e => (e.currentTarget.style.color = linkHover)}
          onMouseOut={e => (e.currentTarget.style.color = linkColor)}
        >
          GalleryFlow
        </a>{' '}by zeitmaschinen
      </Typography>
    </Box>
  );
};

export default SidebarFooter;