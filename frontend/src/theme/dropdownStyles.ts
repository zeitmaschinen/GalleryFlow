import { Theme } from '@mui/material';
import { borders, shadows } from './themeConstants';

/**
 * Centralized dropdown styles for consistent UI across the application
 */
export const dropdownStyles = {
  // Button styles for dropdown triggers
  button: (theme: Theme) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: borders.radius.md,
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontFamily: theme.typography.fontFamily || 'inherit',
    fontWeight: theme.typography.fontWeightRegular ?? 400,
    fontSize: theme.typography.pxToRem(16),
    textTransform: 'none',
    height: 40,
    padding: '0 14px',
    boxShadow: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'none !important',
    '&:hover': {
      background: theme.palette.action.hover,
      borderColor: theme.palette.text.primary,
      boxShadow: 'none',
    },
    '&:active': {
      boxShadow: 'none',
    },
    '& .MuiButton-endIcon': {
      marginLeft: 0,
      marginRight: 0,
      color: theme.palette.action.active,
      boxShadow: 'none',
    },
  }),

  // Icon styles for dropdown buttons
  icon: {
    fontSize: 20,
    color: 'action.active',
    boxShadow: 'none',
  },

  // Menu styles for dropdown content
  menu: (theme: Theme) => ({
    // elevation: 1, // Use boxShadow directly for more control
    // boxShadow: shadows.sm, // Use md for better separation
    '& .MuiPaper-root': {
      borderRadius: borders.radius.sm,
      boxShadow: shadows.md, // Apply medium shadow for visibility
      background: theme.palette.mode === 'dark' ? '#302D49' : theme.palette.background.paper, // Apply custom dark mode color
    },
  }),

  // MenuItem styles
  menuItem: (isSelected: boolean) => ({
    fontWeight: isSelected ? 600 : 400,
  }),
};
