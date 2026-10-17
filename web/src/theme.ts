import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#4f46e5" },
    secondary: { main: "#0ea5e9" },
    background: { default: "#f8fafc" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { border: "1px solid #e2e8f0" } } },
    MuiAppBar: { styleOverrides: { root: { border: "none" } } },
    MuiDialog: { styleOverrides: { paper: { border: "none" } } },
    MuiTextField: { defaultProps: { fullWidth: true, size: "small" } },
  },
});
