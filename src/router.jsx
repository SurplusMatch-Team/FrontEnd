import { Navigate, createBrowserRouter } from "react-router-dom";
import App from "./App";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RequireRole from "./components/common/RequireRole";
import AuthPage from "./pages/AuthPage";
import AddProduct from "./pages/AddProduct";
import DashboardLayout from "./pages/DashboardLayout";
import ProductList from "./pages/ProductList";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import MarketMyProducts from "./pages/dashboard/MarketMyProducts";
import NgoBrowseOffers from "./pages/dashboard/NgoBrowseOffers";

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
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <DashboardOverview /> },
          {
            path: "market/add-product",
            element: (
              <RequireRole role="MARKET">
                <AddProduct />
              </RequireRole>
            ),
          },
          {
            path: "market/my-products",
            element: (
              <RequireRole role="MARKET">
                <MarketMyProducts />
              </RequireRole>
            ),
          },
          {
            path: "ngo/browse-offers",
            element: (
              <RequireRole role="NGO">
                <NgoBrowseOffers />
              </RequireRole>
            ),
          },
        ],
      },
      {
        path: "/add-product",
        element: (
          <ProtectedRoute>
            <RequireRole role="MARKET">
              <AddProduct />
            </RequireRole>
          </ProtectedRoute>
        ),
      },
      {
        path: "/products",
        element: (
          <ProtectedRoute>
            <ProductList />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
