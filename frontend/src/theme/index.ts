import { createTheme } from '@mui/material/styles';
import { palette, colors, typography, borders, transitions, shadows } from './themeConstants';
import type { Mode } from './themeConstants';

/**
 * Builds the MUI theme for one mode from the "Quiet gallery" tokens.
 * Component defaults live here so individual components stay light.
 */
export const getTheme = (mode: Mode) => {
  const p = palette[mode];
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: colors.primary[mode],
      background: { default: p.bg, paper: p.paper },
      text: { primary: p.text, secondary: p.textSecondary, disabled: p.textTertiary },
      divider: p.divider,
      error: { main: colors.common.error },
      success: { main: colors.common.success },
      warning: { main: colors.common.warning },
      info: { main: colors.common.info },
      action: {
        hover: isDark ? colors.common.hoverDark : colors.common.hoverLight,
        selected: p.accentSoft,
      },
    },
    shape: { borderRadius: parseInt(borders.radius.md) },
    typography: {
      fontFamily: typography.fontFamily,
      fontSize: 14,
      button: { textTransform: 'none', fontWeight: typography.fontWeights.medium, letterSpacing: 0 },
      h1: { fontWeight: typography.fontWeights.semibold, letterSpacing: '-0.02em' },
      h2: { fontWeight: typography.fontWeights.semibold, letterSpacing: '-0.02em' },
      h3: { fontWeight: typography.fontWeights.semibold, letterSpacing: '-0.015em' },
      h4: { fontWeight: typography.fontWeights.semibold, letterSpacing: '-0.015em' },
      h5: { fontWeight: typography.fontWeights.semibold, letterSpacing: '-0.01em' },
      h6: { fontWeight: typography.fontWeights.semibold, letterSpacing: '-0.01em' },
      overline: { fontWeight: typography.fontWeights.semibold, letterSpacing: '0.08em', lineHeight: 1.6 },
    },
    transitions: {
      easing: transitions.easing,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: p.bg,
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            fontFeatureSettings: '"cv11", "ss01"',
          },
          '::selection': { backgroundColor: p.accentSoft },
          '*:focus-visible': { outline: `2px solid ${p.accent}`, outlineOffset: 2 },
        },
      },
      MuiButtonBase: {
        defaultProps: { disableRipple: true },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: borders.radius.md,
            fontSize: typography.sizes.base,
            paddingInline: 14,
            transition: `background-color ${transitions.duration.shorter}ms, color ${transitions.duration.shorter}ms, border-color ${transitions.duration.shorter}ms`,
          },
          containedPrimary: {
            backgroundColor: p.accent,
            color: p.onAccent,
            '&:hover': { backgroundColor: p.accentHover },
          },
          outlined: {
            borderColor: p.border,
            color: p.text,
            '&:hover': { borderColor: p.textTertiary, backgroundColor: 'transparent' },
          },
          text: {
            color: p.text,
            '&:hover': { backgroundColor: isDark ? colors.common.hoverDark : colors.common.hoverLight },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: p.textSecondary,
            borderRadius: borders.radius.md,
            transition: `background-color ${transitions.duration.shorter}ms, color ${transitions.duration.shorter}ms`,
            '&:hover': {
              color: p.text,
              backgroundColor: isDark ? colors.common.hoverDark : colors.common.hoverLight,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
          elevation1: { boxShadow: shadows.sm },
          elevation2: { boxShadow: shadows.md },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            border: `1px solid ${p.divider}`,
            borderRadius: borders.radius.lg,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: p.paper,
            borderRadius: borders.radius.xl,
            border: isDark ? `1px solid ${p.divider}` : 'none',
            boxShadow: colors.modal[mode].shadow,
            animation: `gf-rise 320ms ${transitions.easing.easeOut}`,
            '@keyframes gf-rise': {
              from: { transform: 'translateY(12px) scale(0.99)' },
              to: { transform: 'none' },
            },
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backgroundColor: p.overlay,
            backdropFilter: 'blur(6px)',
          },
          invisible: {
            backgroundColor: 'transparent',
            backdropFilter: 'none',
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            marginTop: 6,
            borderRadius: borders.radius.lg,
            border: `1px solid ${p.divider}`,
            boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.5)' : shadows.lg,
            backgroundColor: isDark ? p.elevated : p.paper,
          },
          list: { padding: 6 },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: borders.radius.sm,
            fontSize: typography.sizes.base,
            minHeight: 34,
            gap: 10,
            '&.Mui-selected': {
              backgroundColor: 'transparent',
              color: p.text,
              fontWeight: typography.fontWeights.medium,
            },
            '&.Mui-selected:hover, &:hover': {
              backgroundColor: isDark ? colors.common.hoverDark : colors.common.hoverLight,
            },
          },
        },
      },
      MuiTooltip: {
        defaultProps: { enterDelay: 400, arrow: false },
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? '#EEECE8' : '#1D1C1A',
            color: isDark ? '#1D1C1A' : '#F6F5F2',
            fontSize: typography.sizes.xs,
            fontWeight: typography.fontWeights.medium,
            padding: '6px 10px',
            borderRadius: borders.radius.sm,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: borders.radius.md,
            backgroundColor: p.paper,
            fontSize: typography.sizes.base,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: p.border },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: p.textTertiary },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: p.accent, borderWidth: 1 },
          },
          input: {
            '&::placeholder': { color: p.textTertiary, opacity: 1 },
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          root: { height: 3, padding: '10px 0' },
          rail: { backgroundColor: p.border, opacity: 1 },
          track: { border: 'none' },
          thumb: {
            width: 14,
            height: 14,
            backgroundColor: p.paper,
            border: `2px solid ${p.accent}`,
            boxShadow: 'none',
            '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 6px ${p.accentSoft}` },
            '&.Mui-active': { boxShadow: `0 0 0 8px ${p.accentSoft}` },
            '&::before': { boxShadow: 'none' },
          },
        },
      },
      MuiPaginationItem: {
        styleOverrides: {
          root: {
            borderRadius: borders.radius.md,
            fontWeight: typography.fontWeights.medium,
            color: p.textSecondary,
            '&.Mui-selected': {
              backgroundColor: p.text,
              color: p.bg,
              '&:hover': { backgroundColor: p.text },
            },
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: p.textTertiary,
            '&.Mui-checked': { color: p.accent },
          },
        },
      },
      MuiSnackbarContent: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#EEECE8' : '#1D1C1A',
            color: isDark ? '#1D1C1A' : '#F6F5F2',
            borderRadius: borders.radius.md,
            fontSize: typography.sizes.base,
            fontWeight: typography.fontWeights.medium,
            minWidth: 0,
            boxShadow: shadows.lg,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: borders.radius.md, fontSize: typography.sizes.sm },
        },
      },
      MuiDivider: {
        styleOverrides: { root: { borderColor: p.divider } },
      },
    },
  });
};
