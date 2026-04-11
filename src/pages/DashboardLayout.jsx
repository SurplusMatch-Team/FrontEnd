import { useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import ChangePasswordModal from "../components/dashboard/ChangePasswordModal";
import DashboardNav from "../components/dashboard/DashboardNav";
import Topbar from "../components/dashboard/Topbar";
import { useAuth } from "../hooks/useAuth";

function DashboardLayout() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const role = user?.role || "NGO";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 py-8 text-slate-800 md:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#cffafe_0,#f8fafc_50%)] opacity-70" />
      <div className="absolute -top-20 left-10 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-60 w-60 rounded-full bg-violet-200/30 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-6 px-4">
        <Topbar
          email={user?.email}
          role={role}
          onLogout={handleLogout}
          onOpenChangePassword={() => setIsPasswordModalOpen(true)}
        />

        <DashboardNav role={role} />

        <Outlet />
      </div>

      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
    </main>
  );
}

export default DashboardLayout;
