// Theme Constants for GalleryFlow

/**
 * Color palette for the application, including primary, background, text, and component-specific colors.
 */
export const colors = {
  // Primary and secondary colors split by mode
  primary: {
    light: {
      lighter: '#C3BEFF',
      light: '#ACA5FF',
      main: '#9C8EFA',
      dark: '#3A2DB3',
      darker: '#28243D',
      contrastText: '#FFF'
    },
    dark: {
      lighter: '#C3BEFF',
      light: '#ACA5FF',
      main: '#9C8EFA',
      dark: '#3A2DB3',
      darker: '#28243D',
      contrastText: '#FFF'
    }
  },
  background: {
    light: {
      default: '#F4F5FA',
      paper: '#FFFFFF'
    },
    dark: {
      default: '#28243D',
      paper: '#312D4B'
    }
  },
  text: {
    light: {
      primary: '#3A3541',
      secondary: '#3A3541AA'
    },
    dark: {
      primary: '#F4F2FF',
      secondary: '#E7E3FCD9'
    }
  },
  link: {
    light: '#1A0DAB',
    dark: '#B39DFF',
    hoverLight: '#174EA6',
    hoverDark: '#D1B3FF'
  },
  common: {
    dividerLight: 'rgba(47, 43, 61, 0.12)',
    dividerDark: 'rgba(231, 227, 252, 0.12)',
    hoverLight: 'rgba(0, 0, 0, 0.04)',
    hoverDark: 'rgba(75, 61, 92, 0.15)',
    error: '#FF4C51',
    success: '#56CA00',
    warning: '#FFB400',
    info: '#16B1FF'
  },
  modal: {
    light: {
      background: '#FFFFFF',
      border: '#E0E0E0',
      shadow: '0 2px 16px rgba(44, 40, 73, 0.18)',
      inputBackground: '#F4F5FA',
      inputBorder: '#E0E0E0',
      titleColor: '#3A3541',
      textColor: '#3A3541',
      closeIcon: '#3A3541AA',
      backdrop: 'rgba(44, 40, 73, 0.7)',
    },
    dark: {
      background: '#080529',
      border: '#080529',
      shadow: '0 2px 16px rgba(0,0,0,0.6)',
      inputBackground: '#28243D',
      inputBorder: '#56546A',
      titleColor: '#FFF',
      textColor: '#FFF',
      closeIcon: '#C3BEFF',
      backdrop: 'rgba(0,0,0,0.7)',
    }
  },
  warningBox: {
    light: {
      background: '#FFF9E1',
      border: '#FFE066',
      text: '#B38600',
    },
    dark: {
      background: '#41403B',
      border: '#FFE451',
      text: '#EEE6BA',
    }
  },
};

/**
 * Typography settings for consistent font usage across the application.
 */
export const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem'     // 32px
  }
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
  xl: '3rem'       // 48px
};

/**
 * Border radius values for UI elements.
 */
export const borders = {
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    rounded: '9999px'
  }
};

/**
 * Transition durations and easing curves for animations and UI feedback.
 */
export const transitions = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
  }
};

/**
 * Shadow styles for elevation and depth in UI components.
 */
export const shadows = {
  sm: '0 1px 6px 0 rgba(60, 60, 60, 0.04)',
  md: '0 4px 24px 0 rgba(60, 60, 60, 0.08)',
  lg: '0 8px 40px 0 rgba(60, 60, 60, 0.12)',
  xl: '0 16px 64px 0 rgba(60, 60, 60, 0.16)'
};

/**
 * Single theme object for convenient import (optional usage).
 */
export const theme = {
  colors,
  typography,
  spacing,
  borders,
  transitions,
  shadows,
};