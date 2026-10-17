import { useState, type FormEvent } from "react";
import { Alert, Button, Paper, Tab, Tabs, TextField, Typography } from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import { authErrorMessage, signIn, signUp } from "../services/auth";

type Mode = "signin" | "signup";

export const LoginPage = () => {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (mode === "signup" && !name.trim()) return setError("Informe seu nome.");
    setError(null);
    setPending(true);
    try {
      await (mode === "signin" ? signIn(email, password) : signUp(name, email, password));
    } catch (err) {
      setError(authErrorMessage(err));
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-sky-50 px-4">
      <Paper className="w-full max-w-sm p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center gap-1">
          <CampaignIcon color="primary" sx={{ fontSize: 44 }} />
          <Typography variant="h5" fontWeight={700}>Broadcast</Typography>
          <Typography variant="body2" color="text.secondary">
            Envie mensagens para seus contatos
          </Typography>
        </div>

        <Tabs value={mode} onChange={(_, v: Mode) => { setMode(v); setError(null); }} variant="fullWidth" className="mb-4">
          <Tab value="signin" label="Entrar" />
          <Tab value="signup" label="Criar conta" />
        </Tabs>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          {mode === "signup" && (
            <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          )}
          <TextField label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <TextField
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            helperText={mode === "signup" ? "Mínimo de 6 caracteres" : undefined}
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" size="large" disabled={pending}>
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </Button>
        </form>
      </Paper>
    </div>
  );
};
