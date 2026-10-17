import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, onIdTokenChanged, type User } from "firebase/auth";
import { auth } from "../lib/firebase";

type AuthState = { user: User | null; loading: boolean; version: number };

const AuthContext = createContext<AuthState>({ user: null, loading: true, version: 0 });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, version: 0 });

  useEffect(() => {
    const update = (user: User | null) =>
      setState((s) => ({ user, loading: false, version: s.version + 1 }));
    const unsubscribeAuth = onAuthStateChanged(auth, update);
    // O cadastro força a renovação do token após definir o nome, atualizando o perfil na UI.
    const unsubscribeToken = onIdTokenChanged(auth, update);
    return () => {
      unsubscribeAuth();
      unsubscribeToken();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

// Para páginas protegidas: o usuário sempre existe (garantido pelo ProtectedRoute).
export const useClientId = (): string => {
  const { user } = useAuth();
  if (!user) throw new Error("useClientId usado fora de rota autenticada");
  return user.uid;
};
