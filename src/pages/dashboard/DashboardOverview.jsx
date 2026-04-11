import InventoryList from "../../components/dashboard/InventoryList";
import RecentActivity from "../../components/dashboard/RecentActivity";
import StatCard from "../../components/dashboard/StatCard";
import { useAuth } from "../../hooks/useAuth";

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

function DashboardOverview() {
  const { user } = useAuth();
  const role = user?.role || "NGO";
  const stats = role === "MARKET" ? MARKET_STATS : NGO_STATS;

  return (
    <>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.id} title={stat.title} value={stat.value} hint={stat.hint} tone={stat.tone} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InventoryList items={SAMPLE_ITEMS} role={role} />
        </div>
        <RecentActivity activities={SAMPLE_ACTIVITY} />
      </section>
    </>
  );
}

export default DashboardOverview;
