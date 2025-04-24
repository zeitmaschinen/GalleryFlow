import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import { borders, typography } from '../theme/themeConstants';

interface AddFolderFormProps {
  onAddFolder: (path: string) => Promise<void>;
}

const AddFolderForm: React.FC<AddFolderFormProps> = ({ onAddFolder }) => {
  const [path, setPath] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHelpText = () => {
    if (navigator.platform.includes('Win')) {
      return "Enter a full folder path (e.g., C:\\Users\\YourName\\Pictures)";
    }
    return "Enter a full folder path (e.g., /Users/YourName/Pictures)";
  };

  const parseErrorMessage = (err: unknown): string => {
    try {
      // Try to parse the error response
      const errorObj = err as { response?: { data?: { detail?: string }; status?: number }; message?: string };
      const detail = errorObj.response?.data?.detail;
      if (detail) return detail;

      // Handle network errors
      if (errorObj.message?.includes('Network Error')) {
        return 'Cannot connect to the server. Please check your connection.';
      }

      // Handle other common errors
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!path.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onAddFolder(path.trim());
      setPath('');
    } catch (err) {
      setError(parseErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Add folder path..."
          value={path}
          onChange={(e) => setPath(e.target.value)}
          disabled={isSubmitting}
          error={!!error}
          sx={(theme) => {
            const palette = theme.palette;
            return {
              '& .MuiOutlinedInput-root': {
                borderRadius: borders.radius.sm,
                fontSize: typography.sizes.sm,
                backgroundColor: palette.background.paper,
                color: '#111',
                border: `1px solid ${palette.divider}`,
              },
              '& .MuiOutlinedInput-input': {
                color: '#111',
                backgroundColor: palette.background.paper,
                borderRadius: borders.radius.sm,
              },
              '& .MuiInputBase-input': {
                borderRadius: borders.radius.sm,
              },
            };
          }}
        />
        <Tooltip title={getHelpText()} placement="top">
          <IconButton 
            size="small" 
            sx={(theme) => ({
              ml: 1,
              color: theme.palette.text.primary
            })}
          >
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Box sx={{ position: 'relative', mb: 2 }}>
          <Alert 
            severity="error" 
            sx={(theme) => {
              return {
                borderRadius: borders.radius.sm,
                pr: 4, 
                overflow: 'visible', 
                background: theme.palette.error.main,
                color: theme.palette.error.contrastText,
                '& .MuiAlert-message': {
                  fontSize: typography.sizes.sm
                }
              };
            }}
          >
            {error}
          </Alert>
          <IconButton
            aria-label="close"
            size="small"
            onClick={() => setError(null)}
            sx={{
              position: 'absolute',
              top: 2,
              right: 2,
              zIndex: 1,
              color: 'inherit',
              background: 'none',
              p: 0.5,
              '& svg': {
                fontSize: { xs: '1.25rem', sm: '1rem', md: '0.9rem' },
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      )}

      <Button
        fullWidth
        variant="contained"
        type="submit"
        disabled={!path.trim() || isSubmitting}
        startIcon={isSubmitting ? <CircularProgress size={20} /> : <AddIcon />}
        sx={(theme) => {
          return {
            borderRadius: borders.radius.sm,
            textTransform: 'none',
            fontWeight: typography.fontWeights.medium,
            transition: 'none !important',
            background: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              background: theme.palette.mode === 'dark' ? '#554ee6' : '#4a3ab3',
            },
          };
        }}
      >
        Add Folder
      </Button>
    </Box>
  );
};

export default AddFolderForm;