import { Navigate, createBrowserRouter } from "react-router-dom";
import App from "./App";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: "/login", element: <AuthPage mode="login" /> },
      { path: "/register", element: <AuthPage mode="register" /> },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
