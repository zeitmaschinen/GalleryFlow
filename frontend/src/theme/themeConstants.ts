// Theme Constants for GalleryFlow
//
// "Quiet gallery" design system: warm neutral surfaces so the images carry the
// colour, with GalleryFlow's purple used sparingly as the single accent.

export type Mode = 'light' | 'dark';

/**
 * Core palette. Every component reads from here (directly or through the MUI theme).
 */
export const palette: Record<Mode, {
  bg: string;          // Page background
  paper: string;       // Raised surfaces: dialogs, menus, panels
  elevated: string;    // Hovered rows, inputs, chips
  sunken: string;      // Wells behind images and the workflow canvas
  text: string;
  textSecondary: string;
  textTertiary: string;
  divider: string;
  border: string;
  accent: string;
  accentHover: string;
  accentSoft: string;  // Tinted background for selected items
  accentText: string;  // Accent used as text on bg/paper
  onAccent: string;
  overlay: string;     // Backdrop behind dialogs
  viewer: string;      // Backdrop behind the full-screen image viewer
}> = {
  light: {
    bg: '#F6F5F2',
    paper: '#FFFFFF',
    elevated: '#EFEEEA',
    sunken: '#ECEAE5',
    text: '#1D1C1A',
    textSecondary: '#6F6B64',
    textTertiary: '#9A968E',
    divider: 'rgba(29, 28, 26, 0.08)',
    border: 'rgba(29, 28, 26, 0.12)',
    accent: '#6C5CE7',
    accentHover: '#5A4AD6',
    accentSoft: 'rgba(108, 92, 231, 0.10)',
    accentText: '#5A4AD6',
    onAccent: '#FFFFFF',
    overlay: 'rgba(29, 28, 26, 0.45)',
    viewer: 'rgba(12, 12, 11, 0.94)',
  },
  dark: {
    bg: '#131312',
    paper: '#1C1C1A',
    elevated: '#262624',
    sunken: '#0E0E0D',
    text: '#EEECE8',
    textSecondary: '#A19D95',
    textTertiary: '#6F6B64',
    divider: 'rgba(238, 236, 232, 0.08)',
    border: 'rgba(238, 236, 232, 0.12)',
    accent: '#A99CFF',
    accentHover: '#BDB3FF',
    accentSoft: 'rgba(169, 156, 255, 0.14)',
    accentText: '#B9AEFF',
    onAccent: '#16132E',
    overlay: 'rgba(0, 0, 0, 0.6)',
    viewer: 'rgba(8, 8, 7, 0.96)',
  },
};

/**
 * Colour groups kept for components that read them by role.
 */
export const colors = {
  primary: {
    light: {
      lighter: '#ECE9FD',
      light: '#8E80F0',
      main: palette.light.accent,
      dark: palette.light.accentHover,
      darker: '#2E2575',
      contrastText: palette.light.onAccent,
    },
    dark: {
      lighter: '#2A2645',
      light: '#C3BAFF',
      main: palette.dark.accent,
      dark: '#8C7DF5',
      darker: '#2A2645',
      contrastText: palette.dark.onAccent,
    },
  },
  background: {
    light: { default: palette.light.bg, paper: palette.light.paper },
    dark: { default: palette.dark.bg, paper: palette.dark.paper },
  },
  text: {
    light: { primary: palette.light.text, secondary: palette.light.textSecondary },
    dark: { primary: palette.dark.text, secondary: palette.dark.textSecondary },
  },
  common: {
    dividerLight: palette.light.divider,
    dividerDark: palette.dark.divider,
    hoverLight: 'rgba(29, 28, 26, 0.04)',
    hoverDark: 'rgba(238, 236, 232, 0.06)',
    error: '#E5484D',
    success: '#30A46C',
    warning: '#F5A524',
    info: '#3E8EF7',
  },
  modal: {
    light: {
      background: palette.light.paper,
      border: palette.light.divider,
      shadow: '0 24px 64px rgba(29, 28, 26, 0.18), 0 2px 8px rgba(29, 28, 26, 0.06)',
      inputBackground: palette.light.elevated,
      inputBorder: palette.light.border,
      titleColor: palette.light.text,
      textColor: palette.light.text,
      closeIcon: palette.light.textSecondary,
      backdrop: palette.light.overlay,
    },
    dark: {
      background: palette.dark.paper,
      border: palette.dark.divider,
      shadow: '0 24px 64px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)',
      inputBackground: palette.dark.elevated,
      inputBorder: palette.dark.border,
      titleColor: palette.dark.text,
      textColor: palette.dark.text,
      closeIcon: palette.dark.textSecondary,
      backdrop: palette.dark.overlay,
    },
  },
};

/**
 * Typography: Inter for everything, with tabular numbers for metadata values.
 */
export const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  monoFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.8125rem',  // 13px
    base: '0.875rem', // 14px
    md: '1rem',       // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
  },
};

/**
 * Spacing scale for consistent margins and paddings.
 */
export const spacing = {
  unit: 8,
  xs: '0.5rem',    // 8px
  sm: '1rem',      // 16px
  md: '1.5rem',    // 24px
  lg: '2rem',      // 32px
  xl: '3rem',      // 48px
};

/**
 * Border radius values for UI elements.
 */
export const borders = {
  radius: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    rounded: '9999px',
  },
};

/**
 * Transition durations and easing curves for animations and UI feedback.
 */
export const transitions = {
  duration: {
    shortest: 120,
    shorter: 180,
    short: 240,
    standard: 300,
    complex: 375,
    enteringScreen: 260,
    leavingScreen: 200,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};

/**
 * Shadows: soft and low, used only on floating surfaces.
 */
export const shadows = {
  sm: '0 1px 2px rgba(29, 28, 26, 0.06)',
  md: '0 4px 16px rgba(29, 28, 26, 0.08), 0 1px 3px rgba(29, 28, 26, 0.05)',
  lg: '0 12px 32px rgba(29, 28, 26, 0.12), 0 2px 6px rgba(29, 28, 26, 0.06)',
  xl: '0 24px 64px rgba(29, 28, 26, 0.18), 0 2px 8px rgba(29, 28, 26, 0.06)',
};

/**
 * Layout constants shared by the shell.
 */
export const layout = {
  sidebarWidth: 264,
  headerHeight: 64,
};

/**
 * Single theme object for convenient import (optional usage).
 */
export const theme = {
  palette,
  colors,
  typography,
  spacing,
  borders,
  transitions,
  shadows,
  layout,
};
