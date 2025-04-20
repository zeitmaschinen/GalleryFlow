import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Paper,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { colors, typography } from '../theme/themeConstants';

// ===== ConfirmationDialog Component =====
interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  severity?: 'warning' | 'error' | 'info';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  severity = 'warning'
}) => {
  const getColor = () => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      PaperProps={{
        sx: theme => ({
          backgroundColor: theme.palette.mode === 'dark' ? colors.modal.dark.background : colors.modal.light.background,
          border: `1px solid ${theme.palette.mode === 'dark' ? colors.modal.dark.border : colors.modal.light.border}`,
          boxShadow: theme.palette.mode === 'dark' ? colors.modal.dark.shadow : colors.modal.light.shadow,
          color: theme.palette.mode === 'dark' ? colors.modal.dark.textColor : colors.modal.light.textColor,
        })
      }}
    >
      <DialogTitle
        sx={theme => ({
          backgroundColor: theme.palette.mode === 'dark' ? colors.modal.dark.background : colors.modal.light.background,
          color: theme.palette.mode === 'dark' ? colors.modal.dark.titleColor : colors.modal.light.titleColor,
          borderBottom: `1px solid ${theme.palette.mode === 'dark' ? colors.modal.dark.border : colors.modal.light.border}`
        })}
      >
        {title}
      </DialogTitle>
      <DialogContent
        sx={theme => ({
          backgroundColor: theme.palette.mode === 'dark' ? colors.modal.dark.background : colors.modal.light.background,
          color: theme.palette.mode === 'dark' ? colors.modal.dark.textColor : colors.modal.light.textColor,
        })}
      >
        <DialogContentText id="confirm-dialog-description"
          sx={theme => ({
            color: theme.palette.mode === 'dark' ? colors.modal.dark.textColor : colors.modal.light.textColor,
          })}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={theme => ({
          backgroundColor: theme.palette.mode === 'dark' ? colors.modal.dark.background : colors.modal.light.background,
          borderTop: `1px solid ${theme.palette.mode === 'dark' ? colors.modal.dark.border : colors.modal.light.border}`,
          color: theme.palette.mode === 'dark' ? colors.modal.dark.textColor : colors.modal.light.textColor,
        })}
      >
        <Button onClick={onCancel} color="inherit">
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} color={getColor()} variant="contained" autoFocus>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ===== ImageDetailDialog Component =====
interface ImageDetailDialogProps {
  open: boolean;
  onClose: () => void;
  image: import('../services/api').Image;
  onRevealInFolder?: () => void;
  onCopyPath?: () => void;
}

export const ImageDetailDialog: React.FC<ImageDetailDialogProps> = ({
  open,
  onClose,
  image,
  onRevealInFolder,
  onCopyPath
}) => {
  const theme = useTheme();
  const metadataColor = theme.palette.mode === 'dark'
    ? colors.text.dark.secondary
    : colors.text.light.secondary;

  if (!image) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: theme => ({
          borderRadius: 2,
          overflow: 'hidden',
          maxHeight: '90vh',
          backgroundColor: theme.palette.mode === 'dark' ? colors.modal.dark.background : colors.modal.light.background,
          border: `1px solid ${theme.palette.mode === 'dark' ? colors.modal.dark.border : colors.modal.light.border}`,
          boxShadow: theme.palette.mode === 'dark' ? colors.modal.dark.shadow : colors.modal.light.shadow,
          color: theme.palette.mode === 'dark' ? colors.modal.dark.textColor : colors.modal.light.textColor,
        })
      }}
    >
      <DialogTitle
        sx={theme => ({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          backgroundColor: theme.palette.mode === 'dark' ? colors.modal.dark.background : colors.modal.light.background,
          color: theme.palette.mode === 'dark' ? colors.modal.dark.titleColor : colors.modal.light.titleColor,
          borderBottom: `1px solid ${theme.palette.mode === 'dark' ? colors.modal.dark.border : colors.modal.light.border}`
        })}
      >
        <Typography variant="h6" sx={{ fontWeight: typography.fontWeights.semibold }}>
          {image.filename}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onRevealInFolder && (
            <Tooltip title="Reveal in folder">
              <IconButton onClick={onRevealInFolder} size="small">
                <FolderOpenIcon />
              </IconButton>
            </Tooltip>
          )}
          {onCopyPath && (
            <Tooltip title="Copy path">
              <IconButton onClick={onCopyPath} size="small">
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          )}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          p: 0,
          minWidth: '300px',
          minHeight: '300px',
        }}
      >
        <Box
          sx={theme => ({
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: theme.palette.mode === 'dark' ? colors.modal.dark.background : colors.modal.light.background,
            p: 2,
            flex: 1,
            overflow: 'auto'
          })}
        >
          <img
            src={image.full_path}
            alt={image.filename}
            style={{
              maxWidth: '100%',
              maxHeight: '70vh',
              objectFit: 'contain',
              borderRadius: 4
            }}
          />
        </Box>

        {image.metadata_ && (
          <Paper
            sx={theme => ({
              m: 2,
              p: 2,
              borderRadius: 1,
              maxHeight: '200px',
              overflow: 'auto',
              backgroundColor: theme.palette.mode === 'dark' ? colors.modal.dark.inputBackground : colors.modal.light.inputBackground,
              border: `1px solid ${theme.palette.mode === 'dark' ? colors.modal.dark.inputBorder : colors.modal.light.inputBorder}`
            })}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: typography.fontWeights.semibold }}>
              Metadata
            </Typography>
            <pre style={{
              margin: 0,
              fontSize: '0.75rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: metadataColor
            }}>
              {JSON.stringify(image.metadata_, null, 2)}
            </pre>
          </Paper>
        )}
        {/* Ensures 100px breathing space at the very end of modal scroll */}
        <Box sx={{ minHeight: '1000px', flexShrink: 0 }} />
      </DialogContent>
    </Dialog>
  );
};
