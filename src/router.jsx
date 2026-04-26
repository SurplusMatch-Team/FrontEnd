import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import LandingPage from "./pages/LandingPage";
import DashboardRedirect from "./pages/DashboardRedirect";
import MarketDashboard from "./pages/MarketDashboard";
import NgoDashboard from "./pages/NgoDashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "/login", element: <AuthPage mode="login" /> },
      { path: "/register", element: <AuthPage mode="register" /> },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/market",
        element: (
          <ProtectedRoute>
            <MarketDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/ngo",
        element: (
          <ProtectedRoute>
            <NgoDashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
