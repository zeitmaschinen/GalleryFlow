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
import { colors, typography } from '../../theme/themeConstants';
import { parseMetadata } from '../../utils/metadataParser';

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
  image: import('../../types/index').Image;
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
            {(() => {
              let metadata: Record<string, unknown>;
              try {
                metadata = typeof image.metadata_ === 'string' ? JSON.parse(image.metadata_) : image.metadata_;
              } catch {
                metadata = image.metadata_ as Record<string, unknown>;
              }
              const parsed = parseMetadata(metadata);
              const fields = [
                { key: 'model', label: 'Model' },
                { key: 'modelHash', label: 'Model Hash' },
                { key: 'seed', label: 'Seed' },
                { key: 'steps', label: 'Steps' },
                { key: 'cfg', label: 'CFG' },
                { key: 'sampler', label: 'Sampler' },
                { key: 'scheduler', label: 'Scheduler' },
                { key: 'denoise', label: 'Denoise' },
                { key: 'hiresUpscale', label: 'Hires Upscale' },
                { key: 'hiresUpscaler', label: 'Hires Upscaler' },
                { key: 'positivePrompt', label: 'Positive Prompt' },
                { key: 'negativePrompt', label: 'Negative Prompt' },
              ];
              return (
                <Box>
                  {fields.map(({ key, label }) => (
                    <Box key={key} sx={{ display: 'flex', mb: 0.5 }}>
                      <Typography sx={{ minWidth: 140, fontWeight: 500, color: metadataColor }}>{label}:</Typography>
                      {(() => {
  const value = parsed[key as keyof typeof parsed];
  if (!value || value === 'N/A') {
    return <Typography sx={{ color: metadataColor, wordBreak: 'break-word', ml: 1 }}><span style={{ opacity: 0.6 }}>Not found</span></Typography>;
  }
  if (Array.isArray(value)) {
    // Only join and render arrays of primitives
    if (value.every(item => typeof item === 'string' || typeof item === 'number')) {
      return <Typography sx={{ color: metadataColor, wordBreak: 'break-word', ml: 1 }}>{value.join(', ')}</Typography>;
    } else {
      // Skip rendering arrays of objects (like loras) in the generic block
      return null;
    }
  }
  return <Typography sx={{ color: metadataColor, wordBreak: 'break-word', ml: 1 }}>{value}</Typography>;
})()}

                    </Box>
                  ))}
                  {parsed.loras && parsed.loras.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography sx={{ fontWeight: 500, color: metadataColor }}>Lora Models:</Typography>
                      {(parsed.loras as Array<{ name: string; weight: number }> ).map((lora, idx) => (
                        <Box key={idx} sx={{ ml: 2 }}>
                          <Typography sx={{ color: metadataColor }}>
                            {lora.name} (weight: {lora.weight})
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: typography.fontWeights.semibold }}>
                      Raw Metadata
                    </Typography>
                    <pre style={{ margin: 0, fontSize: '0.7rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: metadataColor }}>
                      {JSON.stringify(metadata, null, 2)}
                    </pre>
                  </Box>
                </Box>
              );
            })()}
          </Paper>
        )}
        {/* Ensures 100px breathing space at the very end of modal scroll */}
        <Box sx={{ minHeight: '1000px', flexShrink: 0 }} />
      </DialogContent>
    </Dialog>
  );
};
