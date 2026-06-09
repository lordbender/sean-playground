import { alpha, createTheme } from "@mui/material/styles";

const mardiGras = {
  purple: "#5b1a8e",
  purpleDark: "#35104f",
  purpleLight: "#8e35d1",
  green: "#00843d",
  greenLight: "#1fbf62",
  gold: "#f2c14e",
  goldDeep: "#c79018",
  ruby: "#c91f6a",
  ivory: "#fff8e8",
  ink: "#25152f"
};

export const materiallyTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: {
      main: mardiGras.purple,
      light: mardiGras.purpleLight,
      dark: mardiGras.purpleDark,
      contrastText: "#ffffff"
    },
    secondary: {
      main: mardiGras.green,
      light: mardiGras.greenLight,
      contrastText: "#ffffff"
    },
    error: {
      main: mardiGras.ruby
    },
    warning: {
      main: mardiGras.gold,
      dark: mardiGras.goldDeep,
      contrastText: mardiGras.ink
    },
    success: {
      main: mardiGras.green
    },
    background: {
      default: "#f7efd9",
      paper: "#fffdf7"
    },
    text: {
      primary: mardiGras.ink,
      secondary: "#6f6177"
    },
    divider: alpha(mardiGras.purple, 0.14)
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontWeight: 900
    },
    h2: {
      fontWeight: 900
    },
    h3: {
      fontWeight: 900
    },
    h4: {
      fontWeight: 900
    },
    button: {
      textTransform: "none",
      fontWeight: 800
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ":root": {
          "--sp-purple": mardiGras.purple,
          "--sp-purple-dark": mardiGras.purpleDark,
          "--sp-purple-light": mardiGras.purpleLight,
          "--sp-green": mardiGras.green,
          "--sp-green-light": mardiGras.greenLight,
          "--sp-gold": mardiGras.gold,
          "--sp-gold-deep": mardiGras.goldDeep,
          "--sp-ruby": mardiGras.ruby,
          "--sp-ivory": mardiGras.ivory,
          "--sp-ink": mardiGras.ink,
          "--sp-shadow": "0 16px 34px rgba(53, 16, 79, 0.18)",
          "--sp-stage-shadow": "0 26px 70px rgba(53, 16, 79, 0.24)"
        },
        body: {
          background:
            "radial-gradient(circle at top left, rgba(242, 193, 78, 0.32), transparent 34%), radial-gradient(circle at 82% 8%, rgba(91, 26, 142, 0.24), transparent 28%), linear-gradient(135deg, #fff8e8 0%, #f5ebcf 54%, #eee1bd 100%)"
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: `1px solid ${alpha(mardiGras.gold, 0.5)}`,
          boxShadow: "var(--sp-shadow)",
          background:
            "linear-gradient(180deg, rgba(255, 253, 247, 0.98) 0%, rgba(255, 248, 232, 0.96) 100%)"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none"
        },
        containedPrimary: {
          backgroundImage: `linear-gradient(135deg, ${mardiGras.purple} 0%, ${mardiGras.ruby} 48%, ${mardiGras.goldDeep} 100%)`,
          boxShadow: `0 12px 26px ${alpha(mardiGras.purple, 0.28)}`,
          "&:hover": {
            boxShadow: `0 16px 30px ${alpha(mardiGras.purple, 0.34)}`
          }
        },
        outlinedPrimary: {
          borderColor: mardiGras.purple,
          color: mardiGras.purple,
          backgroundColor: alpha(mardiGras.gold, 0.12)
        }
      }
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          border: `1px solid ${alpha(mardiGras.gold, 0.58)}`,
          boxShadow: "var(--sp-stage-shadow)"
        }
      }
    }
  }
});

