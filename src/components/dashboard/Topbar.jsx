import { useMemo, useState } from "react";

function Topbar({ email, role, onLogout, onOpenChangePassword }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const roleClass = useMemo(() => {
    if (role === "MARKET") {
      return "bg-cyan-100 text-cyan-700 border-cyan-200";
    }
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }, [role]);

  const userInitial = (email || "U").charAt(0).toUpperCase();

  return (
    <header className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur p-5 md:p-6 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between relative">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-emerald-700">RePlate Dashboard</p>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Welcome back</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm text-slate-600">{email || "Unknown user"}</p>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${roleClass}`}>
            {role || "Unknown role"}
          </span>
        </div>
      </div>

      <div className="relative self-end md:self-auto">
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50 transition"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white text-sm font-semibold">
            {userInitial}
          </span>
          <span className="text-sm font-semibold text-slate-700">Profile</span>
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-lg z-20">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onOpenChangePassword();
              }}
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Change Password
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Topbar;
