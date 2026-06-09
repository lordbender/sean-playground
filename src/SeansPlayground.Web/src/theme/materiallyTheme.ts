import { createTheme } from "@mui/material/styles";

export const materiallyTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#3367f6",
      contrastText: "#ffffff"
    },
    secondary: {
      main: "#00b877"
    },
    error: {
      main: "#ff3d3d"
    },
    warning: {
      main: "#f5a400"
    },
    success: {
      main: "#00b877"
    },
    background: {
      default: "#f3f5fb",
      paper: "#ffffff"
    },
    text: {
      primary: "#1d2433",
      secondary: "#647084"
    }
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontWeight: 700
    },
    h2: {
      fontWeight: 700
    },
    button: {
      textTransform: "none",
      fontWeight: 700
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "0 8px 18px rgba(29, 36, 51, 0.1)"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    }
  }
});

