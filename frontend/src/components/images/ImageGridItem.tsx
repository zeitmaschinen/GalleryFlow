import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import { getThumbnailUrl } from '../../services/api';
import { palette } from '../../theme/themeConstants';
import type { Image } from './types';

interface ImageGridItemProps {
  image: Image;
  rowHeight: number;
  handleImageClick: (image: Image) => void;
  handleOpenWorkflowModal?: (image: Image) => void;
  handleOpenMetadata?: (image: Image) => void;
}

/** Width ÷ height, from the scan data; square when the size is unknown. */
const aspectRatioOf = (image: Image) =>
  image.width && image.height ? Math.min(Math.max(image.width / image.height, 0.4), 3) : 1;

const overlayButtonSx = {
  width: 30,
  height: 30,
  color: '#fff',
  bgcolor: 'rgba(20, 20, 18, 0.45)',
  backdropFilter: 'blur(8px)',
  '&:hover': { bgcolor: 'rgba(20, 20, 18, 0.7)', color: '#fff' },
};

const ImageGridItem: React.FC<ImageGridItemProps> = ({
  image,
  rowHeight,
  handleImageClick,
  handleOpenWorkflowModal,
  handleOpenMetadata = handleImageClick,
}) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const thumbnailUrl = getThumbnailUrl(image.full_path);
  const ratio = aspectRatioOf(image);
  const hasMetadata = !!image.metadata_ && Object.keys(image.metadata_).length > 0;

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={`Open ${image.filename}`}
      onClick={() => handleImageClick(image)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleImageClick(image);
        }
      }}
      sx={(theme) => ({
        position: 'relative',
        flexGrow: ratio,
        flexBasis: `${ratio * rowHeight}px`,
        // Let rows stretch to fill the width, but never blow one image up
        maxWidth: `min(100%, ${Math.round(ratio * rowHeight * 1.8)}px)`,
        aspectRatio: `${ratio}`,
        borderRadius: '6px',
        overflow: 'hidden',
        cursor: 'zoom-in',
        bgcolor: palette[theme.palette.mode].sunken,
        outlineOffset: 2,
        '& img': {
          transition: 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease',
        },
        '& .tile-overlay': { opacity: 0, transition: 'opacity 200ms ease' },
        '&:hover img': { transform: 'scale(1.025)' },
        '&:hover .tile-overlay, &:focus-visible .tile-overlay, &:focus-within .tile-overlay': { opacity: 1 },
        '@media (hover: none)': { '& .tile-overlay': { display: 'none' } },
      })}
    >
      {status !== 'error' ? (
        <img
          src={thumbnailUrl}
          alt={image.filename}
          loading="lazy"
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            opacity: status === 'loaded' ? 1 : 0,
          }}
        />
      ) : (
        <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'text.disabled' }}>
          <BrokenImageOutlinedIcon aria-label="Image could not be loaded" />
        </Box>
      )}

      {status === 'loading' && (
        <Box
          aria-hidden
          sx={(theme) => ({
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(100deg, transparent 30%, ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)'} 50%, transparent 70%)`,
            backgroundSize: '200% 100%',
            animation: 'gf-shimmer 1.4s ease-in-out infinite',
            '@keyframes gf-shimmer': { from: { backgroundPosition: '150% 0' }, to: { backgroundPosition: '-50% 0' } },
          })}
        />
      )}

      {/* Hover overlay: filename and quick actions */}
      <Box
        className="tile-overlay"
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          p: 1,
          background: 'linear-gradient(to top, rgba(10,10,9,0.62) 0%, rgba(10,10,9,0.18) 38%, transparent 60%)',
          pointerEvents: 'none',
        }}
      >
        <Typography
          noWrap
          sx={{ flex: 1, minWidth: 0, color: '#fff', fontSize: 12, fontWeight: 500, textShadow: '0 1px 2px rgba(0,0,0,0.4)', pb: 0.5, pl: 0.25 }}
        >
          {image.filename}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, pointerEvents: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <Tooltip title="Details">
              <IconButton
                size="small"
                aria-label={`Details for ${image.filename}`}
                sx={overlayButtonSx}
                onClick={() => handleOpenMetadata(image)}
              >
                <InfoOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
            {handleOpenWorkflowModal && hasMetadata && (
              <Tooltip title="Workflow">
                <IconButton
                  size="small"
                  aria-label={`Workflow for ${image.filename}`}
                  sx={overlayButtonSx}
                  onClick={() => handleOpenWorkflowModal(image)}
                >
                  <AccountTreeOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
        </Box>
      </Box>
    </Box>
  );
};

export default ImageGridItem;
