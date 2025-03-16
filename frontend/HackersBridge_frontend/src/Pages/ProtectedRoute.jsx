import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Components/dashboard/AuthContext/AuthContext";

const ProtectedRoute = () => {
  const { token, loading } = useAuth();

  if (loading) return null; // ✅ Wait for auth check before rendering

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;




const PublicRoute = () => {
  const { token, loading } = useAuth();

  if (loading) return null; // ✅ Prevents flickering during auth check

  return token ? <Navigate to="/batches" replace /> : <Outlet />;
};

export {PublicRoute};