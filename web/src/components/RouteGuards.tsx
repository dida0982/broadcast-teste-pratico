import { Navigate, Outlet } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { useAuth } from "../hooks/useAuth";

const FullPageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <CircularProgress />
  </div>
);

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const PublicOnlyRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  return user ? <Navigate to="/" replace /> : <Outlet />;
};
