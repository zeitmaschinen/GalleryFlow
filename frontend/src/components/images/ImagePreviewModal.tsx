import React from 'react';
import { Dialog, IconButton, Box, Tooltip, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import { getImageUrl } from '../../services/api';
import { palette } from '../../theme/themeConstants';

import ModalSlideTransition from '../common/ModalSlideTransition';
import ModalNavArrow from '../../theme/ModalNavArrow';
import { useImageModalNavigationHelpers } from '../../hooks/useImageModalNavigationHelpers';
import type { Image } from './types';

interface ImagePreviewModalProps {
  open: boolean;
  selectedImage: Image | null;
  onClose: () => void;
  onSeeMetadata: () => void;
  onSeeWorkflow: () => void;
  images?: Image[];
  setSelectedImage?: (img: Image) => void;
}

const viewerButtonSx = {
  width: 40,
  height: 40,
  color: 'rgba(255, 255, 255, 0.85)',
  borderRadius: '50%',
  '&:hover': { color: '#fff', bgcolor: 'rgba(255, 255, 255, 0.1)' },
};

/**
 * Full-screen, distraction-free image viewer.
 */
const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  open,
  selectedImage,
  onClose,
  onSeeMetadata,
  onSeeWorkflow,
  images,
  setSelectedImage,
}) => {
  // IMPORTANT: Call hooks BEFORE any conditional returns
  const { currentIdx, hasPrev, hasNext, goPrev, goNext } = useImageModalNavigationHelpers(
    open,
    images,
    selectedImage,
    setSelectedImage
  );

  if (!selectedImage) return null;

  const hasMetadata = !!selectedImage.metadata_ && Object.keys(selectedImage.metadata_).length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      TransitionComponent={ModalSlideTransition}
      aria-label={`Viewing ${selectedImage.filename}`}
      BackdropProps={{ sx: (theme) => ({ bgcolor: palette[theme.palette.mode].viewer, backdropFilter: 'blur(12px)' }) }}
      PaperProps={{
        component: 'div',
        sx: { background: 'none', boxShadow: 'none', border: 'none', borderRadius: 0, outline: 'none' },
      }}
    >
      {hasPrev && <ModalNavArrow direction="left" aria-label="Previous image" onClick={goPrev} />}
      {hasNext && <ModalNavArrow direction="right" aria-label="Next image" onClick={goNext} />}

      {/* Top bar */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1500,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: { xs: 1.5, sm: 2.5 },
          height: 64,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0, color: '#fff' }}>
          <Typography noWrap sx={{ fontSize: 14, fontWeight: 600 }}>
            {selectedImage.filename}
          </Typography>
          {images && currentIdx >= 0 && (
            <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontVariantNumeric: 'tabular-nums' }}>
              {currentIdx + 1} of {images.length}
            </Typography>
          )}
        </Box>
        <Tooltip title="Details">
          <IconButton onClick={onSeeMetadata} aria-label="Show details" sx={viewerButtonSx}>
            <InfoOutlinedIcon sx={{ fontSize: 21 }} />
          </IconButton>
        </Tooltip>
        {hasMetadata && (
          <Tooltip title="Workflow">
            <IconButton onClick={onSeeWorkflow} aria-label="Show workflow" sx={viewerButtonSx}>
              <AccountTreeOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Close (Esc)">
          <IconButton onClick={onClose} aria-label="Close viewer" sx={viewerButtonSx}>
            <CloseRoundedIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Image */}
      <Box
        onClick={onClose}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: '72px 8px 16px', sm: '72px 88px 32px' },
          boxSizing: 'border-box',
        }}
      >
        <Box
          component="img"
          key={selectedImage.id}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          src={`${getImageUrl(selectedImage.full_path)}&t=${selectedImage.last_modified || Date.now()}`}
          alt={selectedImage.filename}
          sx={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '4px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            animation: 'gf-viewer-in 280ms cubic-bezier(0.16, 1, 0.3, 1)',
            '@keyframes gf-viewer-in': { from: { opacity: 0, transform: 'scale(0.985)' }, to: { opacity: 1, transform: 'none' } },
          }}
        />
      </Box>
    </Dialog>
  );
};

export default ImagePreviewModal;
