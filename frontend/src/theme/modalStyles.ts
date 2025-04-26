// Centralized modal-related style objects for reuse in modals/dialogs
import { borders, spacing, typography } from './themeConstants';
import { Theme } from '@mui/material/styles';

export const dialogPaperSx = {
  borderRadius: borders.radius.lg,
};

export const dialogContentSx = {
  p: spacing.sm,
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  gap: spacing.md,
  scrollBehavior: 'smooth',
  overscrollBehavior: 'none',
};

// Shared icon button style for modal actions (close, copy, etc.)
export const modalIconButtonSx = (theme: Theme) => ({
  position: 'absolute',
  right: theme?.spacing?.(1) || 8,
  top: theme?.spacing?.(1) || 8,
  color: theme?.palette?.text?.secondary || '#3A3541AA',
  bgcolor: theme?.palette?.action?.hover || '#F4F5FA',
  borderRadius: borders.radius.sm,
  p: 0.5,
  transition: 'background 0.2s',
  '&:hover': {
    bgcolor: theme?.palette?.action?.selected || '#E0E0E0',
  },
});

// Shared style for modal footer action buttons (e.g., Reveal, See metadata preview)
export const modalActionButtonSx = (theme: Theme) => ({
  borderRadius: borders.radius.sm,
  textTransform: 'none',
  fontWeight: typography.fontWeights.medium,
  transition: 'none !important',
  background: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    background: theme.palette.mode === 'dark' ? '#554ee6' : '#4a3ab3',
  },
});

// Secondary action button style (e.g., Reveal in Finder)
export const modalSecondaryActionButtonSx = (theme: Theme) => ({
  borderRadius: borders.radius.sm,
  textTransform: 'none',
  fontWeight: typography.fontWeights.medium,
  transition: 'none !important',
  background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
  color: theme.palette.text.primary,
  '&:hover': {
    background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
  },
});
