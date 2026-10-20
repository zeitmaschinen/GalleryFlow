import React, { useState } from 'react';
import { Box, Button, TextField, CircularProgress, Typography, IconButton, InputAdornment } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { typography } from '../../theme/themeConstants';

interface AddFolderFormProps {
  onAddFolder: (path: string) => Promise<void>;
}

const examplePath = () =>
  navigator.platform.includes('Win') ? 'C:\\Users\\you\\ComfyUI\\output' : '/Users/you/ComfyUI/output';

const parseErrorMessage = (err: unknown): string => {
  try {
    const errorObj = err as { response?: { data?: { detail?: string }; status?: number }; message?: string };
    const detail = errorObj.response?.data?.detail;
    if (detail) return detail;

    if (errorObj.message?.includes('Network Error')) {
      return 'Cannot connect to the GalleryFlow server. Is it running?';
    }
    if (errorObj.response?.status === 404) {
      return 'The folder does not exist. Please check the path and try again.';
    }
    if (errorObj.response?.status === 403) {
      return 'Cannot access this folder. Please check permissions.';
    }
    if (errorObj.response?.status === 409) {
      return 'This folder is already in your library.';
    }

    return errorObj.message || 'Failed to add folder. Please try again.';
  } catch {
    return 'An unexpected error occurred. Please try again.';
  }
};

/**
 * "Add folder" control: a quiet button that opens into a path field.
 */
const AddFolderForm: React.FC<AddFolderFormProps> = ({ onAddFolder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [path, setPath] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setIsOpen(false);
    setPath('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!path.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onAddFolder(path.trim());
      close();
    } catch (err) {
      setError(parseErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        fullWidth
        onClick={() => setIsOpen(true)}
        startIcon={<AddRoundedIcon />}
        sx={{ justifyContent: 'flex-start', color: 'text.secondary', px: 1.25, '&:hover': { color: 'text.primary' } }}
      >
        Add folder
      </Button>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, px: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: typography.fontWeights.semibold }}>
          Add a folder
        </Typography>
        <IconButton size="small" aria-label="Cancel" onClick={close} sx={{ p: 0.5 }}>
          <CloseRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
      <TextField
        autoFocus
        fullWidth
        size="small"
        placeholder={examplePath()}
        aria-label="Full folder path"
        value={path}
        onChange={(e) => setPath(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Escape') close(); }}
        disabled={isSubmitting}
        error={!!error}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                type="submit"
                edge="end"
                size="small"
                aria-label="Add folder"
                disabled={!path.trim() || isSubmitting}
                sx={(theme) => ({
                  bgcolor: path.trim() ? theme.palette.primary.main : 'transparent',
                  color: path.trim() ? theme.palette.primary.contrastText : 'text.disabled',
                  width: 26,
                  height: 26,
                  '&:hover': { bgcolor: theme.palette.primary.dark, color: theme.palette.primary.contrastText },
                  '&.Mui-disabled': { color: path.trim() ? theme.palette.primary.contrastText : 'text.disabled' },
                })}
              >
                {isSubmitting
                  ? <CircularProgress size={14} color="inherit" />
                  : <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ '& .MuiInputBase-input': { fontSize: typography.sizes.sm } }}
      />
      <Typography
        variant="caption"
        role={error ? 'alert' : undefined}
        sx={{ display: 'block', mt: 0.75, px: 0.5, lineHeight: 1.45, color: error ? 'error.main' : 'text.secondary' }}
      >
        {error ?? 'Paste the full path to your ComfyUI output folder. Subfolders are included.'}
      </Typography>
    </Box>
  );
};

export default AddFolderForm;
