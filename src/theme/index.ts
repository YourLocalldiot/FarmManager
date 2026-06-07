import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: '#2e7d32', // Green representing agriculture
      light: '#4caf50',
      dark: '#1b5e20',
    },
    secondary: {
      main: '#757575', // Neutral greys
      light: '#9e9e9e',
      dark: '#424242',
    },
    background: {
      default: mode === 'light' ? '#f5f5f5' : '#000000',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Inter", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    }
  },
  shape: {
    borderRadius: 16, // Rounded cards Google Chat style
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light' ? '0px 1px 3px rgba(0,0,0,0.08)' : '0px 1px 3px rgba(0,0,0,0.5)',
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          borderTop: mode === 'light' ? '1px solid #e0e0e0' : '1px solid #333',
          height: 64,
          backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: mode === 'light' ? '#757575' : '#aaaaaa',
          paddingTop: 8,
          paddingBottom: 8,
          '&.Mui-selected': {
            color: '#2e7d32',
          },
        },
        label: {
          marginTop: 4,
          fontSize: '0.75rem',
          '&.Mui-selected': {
            fontSize: '0.75rem',
            fontWeight: 600,
          }
        }
      },
    },
  },
});

export const lightTheme = createTheme(getDesignTokens('light'));
export const darkTheme = createTheme(getDesignTokens('dark'));
