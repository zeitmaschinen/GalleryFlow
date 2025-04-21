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
import { borders, colors, typography, spacing } from '../theme/themeConstants';
import { getImageUrl } from '../services/api';
import type { Image } from '../types/index';
import ModalNavArrow from '../theme/ModalNavArrow';

interface ImageModalProps {
  open: boolean;
  selectedImage: Image | null;
  selectedImageData: Record<string, unknown> | null;
  imageDimensions: { width: number; height: number } | null;
  modalImageRef: React.RefObject<HTMLImageElement | null>;
  isRevealing: boolean;
  onClose: () => void;
  onModalImageLoad: () => void;
  onRevealFile: () => void;
  onCopyToClipboard: (text: string, isNegative?: boolean) => void;
  images?: Image[]; // Optional: list of all images for navigation
  setSelectedImage?: (img: Image) => void; // Optional: setter for navigation
}

const truncateFilename = (filename: string): string => {
  if (filename.length <= 20) return filename;
  const extension = filename.slice(filename.lastIndexOf('.'));
  const nameWithoutExt = filename.slice(0, filename.lastIndexOf('.'));
  if (nameWithoutExt.length <= 20) return filename;
  return `${nameWithoutExt.slice(0, 15)}...${nameWithoutExt.slice(-5)}${extension}`;
};

// Helper to safely get string or number from unknown
function getString(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return '';
}

const ImageModal: React.FC<ImageModalProps> = ({
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
  images,
  setSelectedImage
}) => {
  if (!selectedImage || !selectedImageData) return null;

  // Defensive: ensure loras is always correct type
  let loras: Array<{ name: string; weight: number }> = [];
  const loraVal = selectedImageData?.['loras'];
  if (loraVal && Array.isArray(loraVal)) {
    loras = loraVal.map((lora) => ({
      name: lora && typeof lora === 'object' && typeof lora.name === 'string' ? lora.name : 'Unknown Lora',
      weight: lora && typeof lora === 'object' && typeof lora.weight === 'number' ? lora.weight : 1.0,
    }));
  }

  try {
    if (!selectedImage || !selectedImageData) {
      return null;
    }
    // Defensive checks for all fields
    const model = getString(selectedImageData, 'model');
    const seed = getString(selectedImageData, 'seed');
    const steps = getString(selectedImageData, 'steps');
    const cfg = getString(selectedImageData, 'cfg');
    const sampler = getString(selectedImageData, 'sampler');
    const scheduler = getString(selectedImageData, 'scheduler');
    const denoise = getString(selectedImageData, 'denoise');
    const hiresUpscale = getString(selectedImageData, 'hiresUpscale');
    const hiresUpscaler = getString(selectedImageData, 'hiresUpscaler');
    const positivePrompt = getString(selectedImageData, 'positivePrompt');
    const negativePrompt = getString(selectedImageData, 'negativePrompt');

    // Defensive: Only render Lora Models if all entries are valid
    const validLoras = Array.isArray(loras)
      ? loras.filter(lora => lora && typeof lora.name === 'string' && typeof lora.weight === 'number')
      : [];

    // Navigation logic
    const currentIdx = images && selectedImage ? images.findIndex(img => img.id === selectedImage.id) : -1;
    const hasPrev = images && currentIdx > 0;
    const hasNext = images && images.length > 0 && currentIdx < images.length - 1 && currentIdx !== -1;

    const goPrev = () => {
      if (hasPrev && setSelectedImage && images) setSelectedImage(images[currentIdx - 1]);
    };
    const goNext = () => {
      if (hasNext && setSelectedImage && images) setSelectedImage(images[currentIdx + 1]);
    };

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: borders.radius.lg } }}
        TransitionProps={{ onExited: onClose }}
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
          Image Details
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
              src={getImageUrl(selectedImage.full_path)}
              alt={selectedImage.filename}
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
              {truncateFilename(selectedImage.filename)}
              <Tooltip title="Copy full filename">
                <IconButton
                  size="small"
                  onClick={() => onCopyToClipboard(selectedImage.filename, false)}
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
            <Box sx={{ mt: 2 }}>
              {/* Model Info */}
              <Typography variant="body2" gutterBottom sx={{ fontWeight: typography.fontWeights.medium }}>
                Model:
              </Typography>
              <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
                <Typography variant="body2">{model}</Typography>
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
                    <Typography variant="body2">{seed}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Steps:
                    </Typography>
                    <Typography variant="body2">{steps}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      CFG Scale:
                    </Typography>
                    <Typography variant="body2">{cfg}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Sampler:
                    </Typography>
                    <Typography variant="body2">{sampler}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Scheduler:
                    </Typography>
                    <Typography variant="body2">{scheduler}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Denoise:
                    </Typography>
                    <Typography variant="body2">{denoise}</Typography>
                  </Box>
                </Box>
              </Paper>
              {/* Hires Fix Info */}
              <Typography variant="body2" gutterBottom sx={{ fontWeight: typography.fontWeights.medium }}>
                Hires Fix:
              </Typography>
              <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Scale:
                    </Typography>
                    <Typography variant="body2">{hiresUpscale}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Upscaler:
                    </Typography>
                    <Typography variant="body2">{hiresUpscaler}</Typography>
                  </Box>
                </Box>
              </Paper>
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
                  mb: 2,
                  position: 'relative',
                  '&:hover .copy-button': {
                    opacity: 1,
                  },
                }}
              >
                <Typography variant="body2" sx={{ pr: 4 }}>{positivePrompt}</Typography>
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
              </Paper>
              <Typography variant="body2" gutterBottom sx={{ fontWeight: typography.fontWeights.medium }}>
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
              </Paper>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: spacing.sm,
            bgcolor: colors.common.hoverLight,
          }}
        >
          <Button
            onClick={onRevealFile}
            startIcon={isRevealing ? <CircularProgress size={18} color="inherit" /> : <FolderOpenIcon />}
            disabled={isRevealing || !selectedImage}
            variant="outlined"
            size="small"
            sx={{
              borderRadius: borders.radius.sm,
              textTransform: 'none',
            }}
          >
            Reveal in Finder/Explorer
          </Button>
        </DialogActions>
      </Dialog>
    );
  } catch (e) {
    console.error('Error rendering ImageModal:', e);
    return null;
  }
};

export default ImageModal;