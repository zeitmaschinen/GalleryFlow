import { createTheme, alpha } from '@mui/material/styles';
import { ThemeOptions } from '@mui/material';
import { colors, typography, borders, transitions, shadows } from './themeConstants';

const baseTheme = {
  shape: {
    borderRadius: parseInt(borders.radius.md)
  },
  typography: {
    fontFamily: typography.fontFamily,
    button: {
      textTransform: 'none' as const
    },
    h5: {
      fontWeight: typography.fontWeights.semibold
    },
    h6: {
      fontWeight: typography.fontWeights.semibold
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: borders.radius.md,
          transition: 'none !important', // Prevent flicker on theme change
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: alpha(typeof colors.primary.light === 'string' ? colors.primary.light : '#90caf9', 0.08)
          },
          color: colors.modal.light.closeIcon,
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: shadows.md,
          transition: `box-shadow ${transitions.duration.short}ms ${transitions.easing.easeInOut}`
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: shadows.md
        },
        elevation2: {
          boxShadow: shadows.lg
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        outlined: {
          minHeight: '32px',
          padding: '6px 14px'
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.modal.light.background,
          border: `1px solid ${colors.modal.light.border}`,
          boxShadow: colors.modal.light.shadow,
          color: colors.modal.light.textColor,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: colors.modal.light.titleColor,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: colors.modal.light.textColor,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          color: colors.modal.light.textColor,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: colors.modal.light.inputBackground,
          border: `1px solid ${colors.modal.light.inputBorder}`,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: colors.modal.light.inputBackground,
          border: `1px solid ${colors.modal.light.inputBorder}`,
        },
        notchedOutline: {
          borderColor: colors.modal.light.inputBorder,
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: colors.modal.light.inputBackground,
          border: `1px solid ${colors.modal.light.inputBorder}`,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: colors.modal.light.titleColor,
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: colors.modal.light.backdrop,
        },
      },
    },
  }
};

export const customLightTheme: ThemeOptions = {
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: colors.primary.light,
    background: colors.background.light,
    text: colors.text.light,
    divider: colors.common.dividerLight
  }
};

export const customDarkTheme: ThemeOptions = {
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: colors.primary.dark,
    background: colors.background.dark,
    text: colors.text.dark,
    divider: colors.common.dividerDark
  },
  components: {
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: colors.modal.dark.closeIcon,
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.modal.dark.background,
          border: `1px solid ${colors.modal.dark.border}`,
          boxShadow: colors.modal.dark.shadow,
          color: colors.modal.dark.textColor,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: colors.modal.dark.titleColor,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: colors.modal.dark.textColor,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          color: colors.modal.dark.textColor,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: colors.modal.dark.inputBackground,
          border: `1px solid ${colors.modal.dark.inputBorder}`,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: colors.modal.dark.inputBackground,
          border: `1px solid ${colors.modal.dark.inputBorder}`,
        },
        notchedOutline: {
          borderColor: colors.modal.dark.inputBorder,
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: colors.modal.dark.inputBackground,
          border: `1px solid ${colors.modal.dark.inputBorder}`,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: colors.modal.dark.titleColor,
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: colors.modal.dark.backdrop,
        },
      },
    },
  }
};

export const getTheme = (mode: 'light' | 'dark') =>
  createTheme(mode === 'light' ? customLightTheme : customDarkTheme);