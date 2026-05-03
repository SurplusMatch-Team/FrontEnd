import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function dashboardPathForRole(role) {
  if (role === "MARKET") return "/dashboard/market";
  return "/dashboard/ngo";
}

/**
 * Renders children only when the signed-in user has one of `allowedRoles`.
 * Otherwise redirects to the correct dashboard for their role (or login).
 */
function RoleGuard({ allowedRoles, children }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role;
  if (!allowedRoles.includes(role)) {
    return <Navigate to={dashboardPathForRole(role)} replace />;
  }

  return children;
}

export default RoleGuard;
