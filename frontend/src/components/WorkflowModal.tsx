import React from 'react';
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
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WorkflowViewer from './WorkflowViewer';
import './WorkflowModal.css';
import ModalSlideTransition from './ModalSlideTransition';
import type { Image } from '../types/index';
import { borders, spacing, typography } from '../theme/themeConstants';
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
  const isDarkMode = theme.palette.mode === 'dark';

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
          justifyContent: 'flex-end'
        }}
      >
        <Button
          variant="contained"
          size="small"
          sx={modalActionButtonSx}
          onClick={handleSeeMetadataPreview}
          disabled={!image}
        >
          See metadata preview
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkflowModal;
