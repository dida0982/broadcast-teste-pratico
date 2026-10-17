import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, StyledEngineProvider, ThemeProvider } from "@mui/material";
import { theme } from "./theme";
import { AuthProvider } from "./hooks/useAuth";
import { FeedbackProvider } from "./hooks/useFeedback";
import { App } from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* injectFirst: os estilos do MUI entram antes, permitindo que o Tailwind os sobrescreva */}
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <FeedbackProvider>
              <App />
            </FeedbackProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </StyledEngineProvider>
  </StrictMode>,
);
