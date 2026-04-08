import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import ChangePasswordModal from "../components/dashboard/ChangePasswordModal";
import InventoryList from "../components/dashboard/InventoryList";
import RecentActivity from "../components/dashboard/RecentActivity";
import StatCard from "../components/dashboard/StatCard";
import Topbar from "../components/dashboard/Topbar";
import { useAuth } from "../hooks/useAuth";

const MARKET_STATS = [
  { id: 1, title: "Active Listings", value: "12", hint: "3 added today", tone: "emerald" },
  { id: 2, title: "Pending Claims", value: "7", hint: "2 awaiting confirmation", tone: "cyan" },
  { id: 3, title: "Completed Transfers", value: "34", hint: "This month", tone: "teal" },
];

const NGO_STATS = [
  { id: 1, title: "Open Opportunities", value: "18", hint: "5 expiring soon", tone: "emerald" },
  { id: 2, title: "My Claims", value: "6", hint: "2 pending approval", tone: "cyan" },
  { id: 3, title: "Collected Batches", value: "21", hint: "This month", tone: "teal" },
];

const SAMPLE_ITEMS = [
  { id: 1, title: "Fresh Bread Bundle", expiresInDays: 1, quantity: "18 kg" },
  { id: 2, title: "Dairy Product Mix", expiresInDays: 2, quantity: "12 crates" },
  { id: 3, title: "Fruit Box", expiresInDays: 1, quantity: "9 boxes" },
];

const SAMPLE_ACTIVITY = [
  { id: 1, title: "Dormitory A claimed Fresh Bread Bundle", time: "10 minutes ago" },
  { id: 2, title: "Transfer for Dairy Product Mix marked complete", time: "38 minutes ago" },
  { id: 3, title: "New batch listed by Market-02", time: "1 hour ago" },
];

function Dashboard() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role || "NGO";
  const stats = role === "MARKET" ? MARKET_STATS : NGO_STATS;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 py-8 px-4 md:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#cffafe_0,#f8fafc_50%)] opacity-70" />
      <div className="absolute -top-20 left-10 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-60 w-60 rounded-full bg-violet-200/30 blur-3xl" />
      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-6">
        <Topbar
          email={user?.email}
          role={role}
          onLogout={handleLogout}
          onOpenChangePassword={() => setIsPasswordModalOpen(true)}
        />

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.id} title={stat.title} value={stat.value} hint={stat.hint} tone={stat.tone} />
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <InventoryList items={SAMPLE_ITEMS} role={role} />
          </div>
          <RecentActivity activities={SAMPLE_ACTIVITY} />
        </section>
      </div>
      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
    </main>
  );
}

export default Dashboard;
