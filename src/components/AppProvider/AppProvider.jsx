import React, { createContext, useContext, useEffect, useReducer } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import { indigo, red } from "@mui/material/colors";

const Context = createContext();
const { Provider } = Context;

// ---------------- Reducer ----------------
const reducer = (state, action) => {
  switch (action.type) {
    case "direction":
      return { ...state, direction: state.direction === "ltr" ? "rtl" : "ltr" };
    default:
      return state;
  }
};

// --------------- RTL Support ---------------
const createEmotionCache = (dir) =>
  createCache({
    key: dir === "rtl" ? "mui-rtl" : "mui",
    stylisPlugins: dir === "rtl" ? [rtlPlugin] : [],
  });

// ---------------- Provider ----------------
const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    mode: "light",
    direction: "ltr",
  });

  const theme = createTheme({
    direction: state.direction,
    palette: {
      mode: "light",
      primary: { main: "#3b82f6", light: "#eff6ff" }, // blue with light soft shade
      secondary: { main: "#8b5cf6", light: "#f5f3ff" }, // purple with light soft shade
      background: {
        default: "#ffffff",
        paper: "#ffffff",
      },
      text: {
        primary: "#1e293b",
        secondary: "#64748b",
      },
    },
    typography: {
      fontFamily: "'Outfit', 'Inter', sans-serif",
      h1: { fontWeight: 700, letterSpacing: "-0.025em" },
      h2: { fontWeight: 700, letterSpacing: "-0.025em" },
      h3: { fontWeight: 600, letterSpacing: "-0.025em" },
      h4: { fontWeight: 600, letterSpacing: "-0.025em" },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 600, letterSpacing: "0.02em" },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
            color: "#1e293b",
            transition: "all 0.3s ease",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: "#ffffff", // completely white theme
            color: "#1e293b",
            boxShadow: "none",
            borderBottom: "1px solid rgba(226, 232, 240, 0.8)", // soft border
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            transition: "all 0.3s ease",
            boxShadow: "none",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
            },
          },
          containedPrimary: {
            background: "#3b82f6",
            color: "#ffffff",
            "&:hover": {
              background: "#2563eb",
            }
          },
          outlinedPrimary: {
            borderColor: "rgba(59, 130, 246, 0.4)",
            backgroundColor: "#eff6ff", // soft light color
            "&:hover": {
              backgroundColor: "#dbeafe",
            }
          }
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: "#ffffff",
            boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
            border: "1px solid rgba(226, 232, 240, 0.6)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 15px 35px rgba(59, 130, 246, 0.08)",
              border: "1px solid rgba(59, 130, 246, 0.2)", // soft blended color outline
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            color: "#334155",
            borderBottom: "1px solid rgba(226, 232, 240, 0.6)",
            backgroundColor: "transparent",
            padding: "16px",
          },
          head: {
            fontWeight: 600,
            fontSize: "0.85rem",
            color: "#475569",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            backgroundColor: "#f8fafc", // extremely soft solid shade
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#eff6ff !important", // solid light blue shade blending well
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: "#ffffff",
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "#f8fafc", // soft light shade
            },
            "&.Mui-focused": {
              backgroundColor: "#ffffff",
              boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.15)", // soft glow
            }
          },
          notchedOutline: {
            borderColor: "rgba(203, 213, 225, 0.6)",
          }
        }
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            transition: "all 0.2s ease",
            borderRadius: "8px",
            margin: "4px 8px",
            width: "auto",
            "&:hover": {
              backgroundColor: "#eff6ff", // soft light color blend
              color: "#2563eb",
            }
          }
        }
      }
    },
  });

  const cache = createEmotionCache(state.direction);

  useEffect(() => {
    document.body.dir = state.direction;
    document.body.style.background = "#ffffff";
    document.body.style.minHeight = "100vh";
    document.body.style.margin = "0";
  }, [state.direction]);

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Provider value={[state, dispatch]}>{children}</Provider>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default AppProvider;

export const useAppState = () => useContext(Context);
