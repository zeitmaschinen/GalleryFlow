import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Box,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { borders, colors, typography, spacing } from '../../theme/themeConstants';
import { getImageUrl } from '../../services/api';
import type { Image } from './types';
import { useImageMetadata } from '../../hooks/useImageMetadata';
import { useImageModalNavigationHelpers } from '../../hooks/useImageModalNavigationHelpers';
import ModalNavArrow from '../../theme/ModalNavArrow';
import ModalSlideTransition from '../common/ModalSlideTransition';
import { modalActionButtonSx, modalSecondaryActionButtonSx } from '../../theme/modalStyles';

interface ImageModalProps {
  open: boolean;
  selectedImage: Image | null;
  selectedImageData: Record<string, unknown> | null;
  imageDimensions: { width: number; height: number } | null;
  modalImageRef: React.RefObject<HTMLImageElement>;
  isRevealing: boolean;
  onClose: () => void;
  onModalImageLoad: () => void;
  onRevealFile: () => void;
  onCopyToClipboard: (text: string, isNegative?: boolean) => void;
  onOpenWorkflow: () => void;
  images?: Image[];
  setSelectedImage?: (img: Image) => void;
}

const truncateFilename = (filename: string): string => {
  if (filename.length <= 20) return filename;
  const extension = filename.slice(filename.lastIndexOf('.'));
  const nameWithoutExt = filename.slice(0, filename.lastIndexOf('.'));
  if (nameWithoutExt.length <= 20) return filename;
  return `${nameWithoutExt.slice(0, 15)}...${nameWithoutExt.slice(-5)}${extension}`;
};

// Create a separate component for the modal content to avoid conditional rendering issues
const ImageModalContent: React.FC<ImageModalProps> = ({
  open,
  selectedImage,
  selectedImageData,
  imageDimensions,
  modalImageRef,
  isRevealing,
  onClose,
  onModalImageLoad,
  onRevealFile,
  onCopyToClipboard,
  onOpenWorkflow,
  images,
  setSelectedImage
}) => {
  // Use custom hook for extracting metadata fields
  const {
    model,
    seed,
    steps,
    cfg,
    sampler,
    scheduler,
    denoise,
    hiresUpscale,
    hiresUpscaler,
    positivePrompt,
    negativePrompt,
    loras,
  } = useImageMetadata(selectedImageData || {});
  
  const validLoras = Array.isArray(loras)
    ? loras.filter(lora => lora && typeof lora.name === 'string' && typeof lora.weight === 'number')
    : [];

  // Use combined hook for modal navigation and keyboard logic
  const { 
    hasPrev, 
    hasNext, 
    goPrev, 
    goNext 
  } = useImageModalNavigationHelpers(
    open,
    images, 
    selectedImage, 
    setSelectedImage
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={ModalSlideTransition}
      PaperProps={{ sx: { borderRadius: borders.radius.lg } }}
      BackdropProps={{
        timeout: 500, // Moderate backdrop transition (faster than 600ms but slower than default)
        sx: {
          transition: 'opacity 500ms cubic-bezier(0.3, 0, 0.3, 1) !important'
        }
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: spacing.sm,
          pr: spacing.xl,
          fontSize: typography.sizes.lg,
          fontWeight: typography.fontWeights.semibold,
        }}
      >
        Metadata preview
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: spacing.xs,
            top: spacing.xs,
            color: 'text.secondary',
            bgcolor: 'action.hover',
            borderRadius: borders.radius.sm,
            '&:hover': { bgcolor: 'action.selected' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          p: spacing.sm,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: spacing.md,
          scrollBehavior: 'smooth',
          overscrollBehavior: 'none',
        }}
      >
        {/* Navigation arrows always visible on all screen sizes */}
        {open && hasPrev && (
          <ModalNavArrow
            direction="left"
            aria-label="Previous image"
            onClick={goPrev}
            sx={{ display: 'flex' }} // always visible
          />
        )}
        {open && hasNext && (
          <ModalNavArrow
            direction="right"
            aria-label="Next image"
            onClick={goNext}
            sx={{ display: 'flex' }} // always visible
          />
        )}
        {/* Left: Image Preview */}
        <Box sx={{ flex: '1 1 40%', minWidth: 200, textAlign: 'center', position: 'relative' }}>
          <img
            ref={modalImageRef}
            onLoad={onModalImageLoad}
            src={getImageUrl(selectedImage?.full_path || '')}
            alt={selectedImage?.filename || ''}
            style={{
              maxWidth: '100%',
              maxHeight: '60vh',
              objectFit: 'contain',
              borderRadius: borders.radius.md,
              marginBottom: 8,
            }}
          />
          <Typography
            variant="caption"
            display="block"
            sx={{
              mt: 1,
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            {truncateFilename(selectedImage?.filename || 'Untitled')}
            <Tooltip title="Copy full filename">
              <IconButton
                size="small"
                onClick={() => onCopyToClipboard(selectedImage?.filename || '', false)}
                sx={{ p: 0.5, '&:hover': { bgcolor: 'action.hover' } }}
              >
                <ContentCopyIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
          </Typography>
          {imageDimensions && (
            <Typography variant="caption" display="block" color="text.secondary">
              {imageDimensions.width} × {imageDimensions.height} pixels
            </Typography>
          )}
        </Box>
        {/* Right: Metadata */}
        <Box sx={{ flex: '1 1 60%' }}>
          {selectedImageData && Object.keys(selectedImageData).length > 0 ? (
            <Box sx={{ mt: 2 }}>
              {/* Model Info */}
              <Typography variant="body2" gutterBottom sx={{ fontWeight: typography.fontWeights.medium }}>
                Model:
              </Typography>
              <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
                <Typography variant="body2">{model || 'N/A'}</Typography>
              </Paper>
              {/* Generation Parameters */}
              <Typography variant="body2" gutterBottom sx={{ fontWeight: typography.fontWeights.medium }}>
                Parameters:
              </Typography>
              <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Seed:
                    </Typography>
                    <Typography variant="body2">{seed || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Steps:
                    </Typography>
                    <Typography variant="body2">{steps || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      CFG Scale:
                    </Typography>
                    <Typography variant="body2">{cfg || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Sampler:
                    </Typography>
                    <Typography variant="body2">{sampler || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Scheduler:
                    </Typography>
                    <Typography variant="body2">{scheduler || 'N/A'}</Typography>
                  </Box>
                  {denoise !== undefined && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Denoise:
                      </Typography>
                      <Typography variant="body2">{denoise}</Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
              {/* Hires Fix Info */}
              {(hiresUpscale !== undefined || hiresUpscaler !== undefined) && (
                <>
                  <Typography variant="body2" gutterBottom sx={{ fontWeight: typography.fontWeights.medium }}>
                    Hires Fix:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                      {hiresUpscale !== undefined && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Scale:
                          </Typography>
                          <Typography variant="body2">{hiresUpscale}</Typography>
                        </Box>
                      )}
                      {hiresUpscaler !== undefined && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Upscaler:
                          </Typography>
                          <Typography variant="body2">{hiresUpscaler}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </>
              )}
              {/* Lora Models */}
              {validLoras.length > 0 && (
                <>
                  <Typography variant="body2" gutterBottom sx={{ fontWeight: typography.fontWeights.medium }}>
                    Lora Models:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                      {validLoras.map((lora, index) => (
                        <Box key={index}>
                          <Typography variant="caption" color="text.secondary">Model Name:</Typography>
                          <Typography variant="body2">{lora.name}</Typography>
                          <Typography variant="caption" color="text.secondary">Weight:</Typography>
                          <Typography variant="body2">{lora.weight.toFixed(2)}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </>
              )}
              {/* Prompts */}
              <Typography variant="body2" gutterBottom sx={{ fontWeight: typography.fontWeights.medium }}>
                Positive Prompt:
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  position: 'relative',
                  '&:hover .copy-button': {
                    opacity: 1,
                  },
                }}
              >
                <Typography variant="body2" sx={{ pr: 4 }}>{positivePrompt}</Typography>
                {/* Conditionally render copy icon for positive prompt */}
                {positivePrompt && positivePrompt !== 'N/A' && (
                  <IconButton
                    size="small"
                    className="copy-button"
                    onClick={() => onCopyToClipboard(positivePrompt, false)}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: 8,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                )}
              </Paper>
              <Typography 
                variant="body2" 
                gutterBottom 
                sx={{ fontWeight: typography.fontWeights.medium, mt: 3 }} 
              >
                Negative Prompt:
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  position: 'relative',
                  '&:hover .copy-button': {
                    opacity: 1,
                  },
                }}
              >
                <Typography variant="body2" sx={{ pr: 4 }}>{negativePrompt}</Typography>
                {/* Conditionally render copy icon for negative prompt */}
                {negativePrompt && negativePrompt !== 'N/A' && (
                  <IconButton
                    size="small"
                    className="copy-button"
                    onClick={() => onCopyToClipboard(negativePrompt, true)}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: 8,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                )}
              </Paper>
              {/* Metadata extraction notice */}
              <Box
                sx={theme => {
                  const mode = theme.palette.mode === 'dark' ? 'dark' : 'light';
                  return {
                    mt: 2,
                    mb: 3,
                    p: 1.5,
                    borderRadius: borders.radius.md,
                    backgroundColor: colors.warningBox[mode].background,
                    border: `1px solid ${colors.warningBox[mode].border}`,
                    color: colors.warningBox[mode].text,
                    width: '100%',
                    boxSizing: 'border-box',
                  };
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: typography.fontWeights.normal, fontSize: '0.85em' }}
                >
                  Some fields may appear empty if the workflow is too complex or uses custom nodes. For a better panorama, check the workflow preview.
                </Typography>
              </Box>
              {/* Empty space below negative prompt */}
              <Box sx={{ height: spacing.md, width: '100%' }} />
            </Box>
          ) : (
            <Box 
              sx={{ 
                mt: 4, 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                textAlign: 'center'
              }}
            >
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No metadata available for this image
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This image doesn't have any embedded metadata or it couldn't be extracted.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          p: spacing.sm,
          bgcolor: colors.common.hoverLight,
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Button
          onClick={onRevealFile}
          startIcon={isRevealing ? <CircularProgress size={18} color="inherit" /> : <FolderOpenIcon />}
          disabled={isRevealing || !selectedImage}
          variant="text"
          size="small"
          sx={modalSecondaryActionButtonSx}
        >
          Reveal in Finder/Explorer
        </Button>
        {selectedImageData && Object.keys(selectedImageData).length > 0 && (
          <Button
            onClick={onOpenWorkflow}
            variant="contained"
            size="small"
            sx={modalActionButtonSx}
          >
            See workflow preview
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// Main component that handles conditional rendering
const ImageModal: React.FC<ImageModalProps> = (props) => {
  if (!props.selectedImage) {
    return null;
  }
  
  return <ImageModalContent {...props} />;
};

export default ImageModal;