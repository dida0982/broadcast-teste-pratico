import { Link as RouterLink, Outlet } from "react-router-dom";
import { AppBar, Avatar, Button, Toolbar, Typography } from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../hooks/useAuth";
import { signOut } from "../services/auth";

const initials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");

export const Layout = () => {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email || "";

  return (
    <div className="min-h-screen">
      <AppBar position="sticky" color="inherit" className="border-b border-slate-200 shadow-none">
        <Toolbar className="mx-auto w-full max-w-5xl gap-3">
          <RouterLink to="/" className="flex items-center gap-2 text-inherit no-underline">
            <CampaignIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>Broadcast</Typography>
          </RouterLink>
          <div className="flex-1" />
          <div className="hidden items-center gap-2 sm:flex">
            <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>{initials(displayName)}</Avatar>
            <Typography variant="body2" color="text.secondary">{displayName}</Typography>
          </div>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={() => signOut()}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};
