import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Alert, Snackbar } from "@mui/material";

type Severity = "success" | "error" | "info";
type Notify = (message: string, severity?: Severity) => void;

const FeedbackContext = createContext<Notify>(() => {});

export const FeedbackProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<{ message: string; severity: Severity; key: number } | null>(null);

  const notify = useCallback<Notify>(
    (message, severity = "success") => setToast({ message, severity, key: Date.now() }),
    [],
  );

  return (
    <FeedbackContext.Provider value={notify}>
      {children}
      <Snackbar
        key={toast?.key}
        open={toast !== null}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast?.severity ?? "info"} variant="filled" onClose={() => setToast(null)}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </FeedbackContext.Provider>
  );
};

export const useNotify = () => useContext(FeedbackContext);

// Executa uma ação assíncrona com estado de carregamento e feedback padronizado.
export const useAsyncAction = () => {
  const notify = useNotify();
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async (action: () => Promise<unknown>, success?: string): Promise<boolean> => {
      setPending(true);
      try {
        await action();
        if (success) notify(success);
        return true;
      } catch (error) {
        console.error(error);
        notify("Não foi possível concluir a operação.", "error");
        return false;
      } finally {
        setPending(false);
      }
    },
    [notify],
  );

  return { pending, run };
};
