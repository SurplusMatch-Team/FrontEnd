import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function DashboardRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const target = user?.role === "MARKET" ? "/dashboard/market" : "/dashboard/ngo";
  return <Navigate to={target} replace />;
}

export default DashboardRedirect;
