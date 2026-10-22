import React, { useState, useEffect } from 'react';
import {
  Dialog,
  IconButton,
  Button,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Snackbar,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WorkflowViewer from './WorkflowViewer';
import './WorkflowModal.css';
import ModalSlideTransition from '../common/ModalSlideTransition';
import type { Image } from '../images/types';
import { palette, typography } from '../../theme/themeConstants';
import ModalNavArrow from '../../theme/ModalNavArrow';

interface WorkflowModalProps {
  open: boolean;
  onClose: () => void;
  workflowJson: Record<string, unknown> | null;
  image: Image | null;
  images?: Image[];
  setSelectedImage?: (image: Image) => void;
  onSeeMetadataPreview?: () => void;
}

const WorkflowModal: React.FC<WorkflowModalProps> = ({
  open,
  onClose,
  workflowJson,
  image,
  images = [],
  setSelectedImage,
  onSeeMetadataPreview,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(-1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Find the current image index in the images array
  useEffect(() => {
    if (image && images.length > 0) {
      const idx = images.findIndex(img => img.id === image.id);
      setCurrentIdx(idx);
    }
  }, [image, images]);

  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < images.length - 1;

  const handlePrevImage = () => {
    if (images.length > 0 && currentIdx > 0 && setSelectedImage) {
      const prevImage = images[currentIdx - 1];
      setSelectedImage(prevImage);
    }
  };

  const handleNextImage = () => {
    if (images.length > 0 && currentIdx < images.length - 1 && setSelectedImage) {
      const nextImage = images[currentIdx + 1];
      setSelectedImage(nextImage);
    }
  };

  const isValid = !!workflowJson && typeof workflowJson === 'object' && Object.keys(workflowJson).length > 0;
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isNarrow = useMediaQuery(theme.breakpoints.down('md'));

  const handleSeeMetadataPreview = () => {
    onClose();
    if (onSeeMetadataPreview) {
      setTimeout(() => {
        onSeeMetadataPreview();
      }, 350); // Match the exit timeout from ModalSlideTransition
    }
  };

  const copyWorkflowJson = async () => {
    if (!workflowJson) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(workflowJson, null, 2));
      setSnackbarMessage('Workflow JSON copied');
    } catch {
      setSnackbarMessage("Couldn't copy. Your browser blocked access to the clipboard.");
    }
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        fullScreen={isNarrow}
        TransitionComponent={ModalSlideTransition}
        aria-labelledby="workflow-modal-title"
        PaperProps={{
          sx: {
            width: isNarrow ? '100%' : 'calc(100vw - 160px)',
            height: isNarrow ? '100%' : 'calc(100vh - 64px)',
            m: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: isNarrow ? 0 : undefined,
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography id="workflow-modal-title" component="h2" sx={{ fontWeight: typography.fontWeights.semibold, fontSize: 15 }}>
              Workflow
            </Typography>
            {image?.filename && (
              <Typography variant="caption" noWrap component="p" sx={{ color: 'text.secondary' }}>
                {image.filename}
              </Typography>
            )}
          </Box>
          <Button
            onClick={copyWorkflowJson}
            startIcon={<ContentCopyRoundedIcon sx={{ fontSize: '16px !important' }} />}
            disabled={!isValid}
            variant="outlined"
            size="small"
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Copy JSON
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<InfoOutlinedIcon sx={{ fontSize: '16px !important' }} />}
            onClick={handleSeeMetadataPreview}
          >
            Details
          </Button>
          <IconButton onClick={onClose} aria-label="Close workflow" sx={{ mr: -1 }}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, position: 'relative', bgcolor: palette[theme.palette.mode].sunken }}>
          {isValid ? (
            <div className={`workflow-visualization-wrapper workflow-visualization-${isDarkMode ? 'dark' : 'light'}`}>
              <WorkflowViewer workflowJson={workflowJson} height="100%" />
            </div>
          ) : (
            <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center', px: 3 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: typography.fontWeights.semibold, mb: 0.5 }}>
                  No workflow saved in this image
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Only PNGs saved by ComfyUI carry their workflow.
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Dialog>

      {/* Navigation arrows outside the dialog */}
      {open && hasPrev && (
        <ModalNavArrow
          direction="left"
          aria-label="Previous image"
          onClick={handlePrevImage}
          sx={{ display: 'flex' }} // always visible
        />
      )}
      {open && hasNext && (
        <ModalNavArrow
          direction="right"
          aria-label="Next image"
          onClick={handleNextImage}
          sx={{ display: 'flex' }} // always visible
        />
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default WorkflowModal;
