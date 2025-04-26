import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import WorkflowViewer from './WorkflowViewer';
import './WorkflowModal.css';
import ModalSlideTransition from './ModalSlideTransition';
import type { Image } from '../types/index';
import { useTheme } from '@mui/material/styles';
import { borders, spacing, typography } from '../theme/themeConstants';
import Button from '@mui/material/Button';
import { modalActionButtonSx } from '../theme/modalStyles';

interface WorkflowModalProps {
  open: boolean;
  onClose: () => void;
  workflowJson: Record<string, unknown> | null;
  image?: Image | null;
  onSeeMetadataPreview?: () => void;
}

const WorkflowModal: React.FC<WorkflowModalProps> = ({ 
  open, 
  onClose, 
  workflowJson, 
  image,
  onSeeMetadataPreview
}) => {
  const isValid = !!workflowJson && typeof workflowJson === 'object' && Object.keys(workflowJson).length > 0;
  const theme = useTheme();
  const mode = theme.palette.mode;
  const subtitleColor = theme.palette.text.secondary;

  const handleSeeMetadataPreview = () => {
    onClose();
    if (onSeeMetadataPreview) {
      setTimeout(() => {
        onSeeMetadataPreview();
      }, 350); // Match the exit timeout from ModalSlideTransition
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      TransitionComponent={ModalSlideTransition}
      PaperProps={{
        sx: {
          borderRadius: borders.radius.lg,
          backgroundColor: (theme) => theme.palette.background.paper,
          color: (theme) => theme.palette.text.primary,
          boxShadow: (theme) => theme.shadows[8],
          border: 'none',
        },
      }}
      BackdropProps={{
        className: `workflow-modal-backdrop workflow-modal-backdrop-${mode}`
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: spacing.sm,
          pr: spacing.xl,
          fontSize: typography.sizes.lg,
          fontWeight: typography.fontWeights.semibold,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        <span>Workflow preview</span>
        <IconButton
          aria-label="close"
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
        <Box
          sx={{
            fontSize: { xs: '13px', sm: '15px' },
            color: subtitleColor,
            fontWeight: 400,
            px: 3,
            pt: 0.2,
            pb: 0.2,
            mt: '-8px',
            mb: 0.5,
            wordBreak: 'break-all',
            opacity: 0.9,
            letterSpacing: 0.01,
            transition: 'color 0.2s',
          }}
        >
          {image.filename}
        </Box>
      )}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'stretch', minHeight: 400 }}>
        {isValid ? (
          <div className={`workflow-visualization-wrapper workflow-visualization-${mode}`}>
            <Box sx={{ width: '100%', height: 600, minHeight: 400 }}>
              <WorkflowViewer workflowJson={workflowJson} height={600} />
            </Box>
          </div>
        ) : (
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            There is no information on the workflow used for this specific image.
          </Box>
        )}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, pt: 0 }}>
        <Button
          variant="contained"
          size="small"
          sx={modalActionButtonSx}
          onClick={handleSeeMetadataPreview}
          disabled={!image}
        >
          See metadata preview
        </Button>
      </Box>
    </Dialog>
  );
};

export default WorkflowModal;
