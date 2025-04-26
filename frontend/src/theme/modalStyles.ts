// Centralized modal-related style objects for reuse in modals/dialogs
import { borders, spacing } from './themeConstants';

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
export const modalIconButtonSx = (theme) => ({
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
export const modalActionButtonSx = {
  borderRadius: borders.radius.sm,
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.95rem',
  px: 2.5,
  py: 1,
};
