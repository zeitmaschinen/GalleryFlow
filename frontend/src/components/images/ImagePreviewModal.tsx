import React from 'react';
import {
  Dialog,
  IconButton,
  Box,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import WorkflowIcon from '@mui/icons-material/AccountTree';
import { getImageUrl } from '../../services/api';

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
  const { hasPrev, hasNext, goPrev, goNext } = useImageModalNavigationHelpers(
    open,
    images,
    selectedImage,
    setSelectedImage
  );

  // Now safe to return early if no image selected
  if (!selectedImage) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      TransitionComponent={ModalSlideTransition}
      BackdropProps={{
        timeout: 500,
        sx: theme => ({
          transition: 'opacity 500ms cubic-bezier(0.3, 0, 0.3, 1) !important',
          backgroundColor: 
            theme.palette.mode === 'dark' 
              ? 'rgba(0,0,0,0.7)' 
              : 'rgba(44, 40, 73, 0.85)', // Purple tint for light mode with 0.85 opacity
        }),
      }}
      PaperProps={{
        component: 'div', // Remove MUI Paper entirely
        sx: {
          background: 'none', // No background
          boxShadow: 'none',
          margin: 0,
          maxWidth: '100%',
          maxHeight: '100%',
          border: 'none', // Explicitly remove border
          outline: 'none', // Explicitly remove outline
          '&:focus-visible, &::before, &::after': { 
            outline: 'none !important',
            border: 'none !important'
          },
          '& .MuiDialog-paper': {
            border: 'none',
            outline: 'none',
            '&::before, &::after': {
              display: 'none !important'
            }
          }
        },
      }}
    >
      {/* Navigation arrows */}
      {hasPrev && (
        <ModalNavArrow direction="left" aria-label="Previous image" onClick={goPrev} />
      )}
      {hasNext && (
        <ModalNavArrow direction="right" aria-label="Next image" onClick={goNext} />
      )}

      {/* Close button */}
      <IconButton
        onClick={onClose}
        sx={{
          top: 16,
          right: 16,
          zIndex: 1500,
          bgcolor: '#23272E',
          color: '#fff',
          '&:hover': { bgcolor: '#444' },
          p: 1,
          borderRadius: '50%',
          position: 'fixed',
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Action buttons */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 72,
          display: 'flex',
          gap: 1,
          zIndex: 1500,
        }}
      >
        <Tooltip title="Metadata preview" arrow placement="bottom" enterDelay={300}>
          <IconButton
            onClick={onSeeMetadata}
            sx={{
              bgcolor: '#23272E',
              color: '#fff',
              '&:hover': { bgcolor: '#444' },
              p: 1,
              borderRadius: '50%',
            }}
          >
            <InfoIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Workflow preview" arrow placement="bottom" enterDelay={300}>
          <IconButton
            onClick={onSeeWorkflow}
            sx={{
              bgcolor: '#23272E',
              color: '#fff',
              '&:hover': { bgcolor: '#444' },
              p: 1,
              borderRadius: '50%',
            }}
          >
            <WorkflowIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Full-size image */}
      <Box
        onClick={onClose}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          
        }}
      >
        <img
          onClick={e => e.stopPropagation()}
          src={`${getImageUrl(selectedImage.full_path)}&t=${selectedImage.last_modified || Date.now()}`}
          alt={selectedImage.filename}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      </Box>
    </Dialog>
  );
};

export default ImagePreviewModal;
