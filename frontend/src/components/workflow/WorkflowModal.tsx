import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Box,
  Paper,
  Typography,
  useTheme,
  Snackbar,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WorkflowViewer from './WorkflowViewer';
import './WorkflowModal.css';
import ModalSlideTransition from '../common/ModalSlideTransition';
import type { Image } from '../images/types';
import { borders, spacing, typography } from '../../theme/themeConstants';
import { modalActionButtonSx, modalSecondaryActionButtonSx } from '../../theme/modalStyles';
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

  const handleSeeMetadataPreview = () => {
    onClose();
    if (onSeeMetadataPreview) {
      setTimeout(() => {
        onSeeMetadataPreview();
      }, 350); // Match the exit timeout from ModalSlideTransition
    }
  };

  const copyWorkflowJson = () => {
    if (workflowJson) {
      navigator.clipboard.writeText(JSON.stringify(workflowJson, null, 2));
      setSnackbarMessage('Workflow JSON copied to clipboard');
      setSnackbarOpen(true);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        TransitionComponent={ModalSlideTransition}
        aria-labelledby="workflow-modal-title"
        BackdropProps={{
          timeout: 500, // Moderate backdrop transition (faster than 600ms but slower than default)
          sx: theme => ({
            transition: 'opacity 500ms cubic-bezier(0.3, 0, 0.3, 1) !important',
            backgroundColor: 
              theme.palette.mode === 'dark' 
                ? 'rgba(0,0,0,0.7)' 
                : 'rgba(44, 40, 73, 0.85)' // Purple tint for light mode with 0.85 opacity
          })
        }}
        PaperProps={{ sx: { borderRadius: borders.radius.lg } }}
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
          Workflow preview
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

        {/* Subtitle with filename */}
        {image?.filename && (
          <Typography
            variant="body2"
            sx={{
              px: spacing.md,
              pt: 0,
              pb: 1,
              mt: '-8px',
              color: 'text.secondary',
              wordBreak: 'break-all',
              letterSpacing: 0.2,
            }}
          >
            {image.filename}
          </Typography>
        )}

        <DialogContent
          sx={{
            p: spacing.md,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            minHeight: 400,
            bgcolor: 'background.paper',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              height: 600,
              minHeight: 400,
              overflow: 'hidden',
              bgcolor: 'background.paper',
              borderRadius: borders.radius.md,
              border: 1,
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
              '& .workflow-visualization-wrapper': {
                height: '100%',
                width: '100%'
              }
            }}
          >
            {isValid ? (
              <div className={`workflow-visualization-wrapper workflow-visualization-${isDarkMode ? 'dark' : 'light'}`}>
                <WorkflowViewer workflowJson={workflowJson} height={600} />
              </div>
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                mt: 6,
                color: 'text.secondary',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography>
                  There is no information on the workflow used for this specific image.
                </Typography>
              </Box>
            )}
          </Paper>
        </DialogContent>

        <DialogActions
          sx={{
            p: spacing.sm,
            bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.03)',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <Button
            onClick={copyWorkflowJson}
            startIcon={<ContentCopyIcon />}
            disabled={!isValid}
            variant="text"
            size="small"
            sx={modalSecondaryActionButtonSx}
          >
            Copy workflow JSON
          </Button>
          
          <Button
            variant="contained"
            size="small"
            sx={modalActionButtonSx}
            onClick={handleSeeMetadataPreview}
          >
            See metadata preview
          </Button>
        </DialogActions>
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
      
      {/* Snackbar notification */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar} 
        message={snackbarMessage} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} 
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default WorkflowModal;
