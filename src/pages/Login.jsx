import { useState } from "react";
import { loginUser } from "../api/authService";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await loginUser(form);
      console.log("Login response:", res);
      setSuccess("Login successful.");
    } catch (err) {
      setError(err.response?.data?.message || "Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-7 md:p-9 shadow-xl">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">
          Welcome Back
        </p>
        <h2 className="text-3xl font-bold text-slate-800 mt-2 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
              <path d="M15 8l4 4-4 4M5 12h14" />
            </svg>
          </span>
          Sign In
        </h2>
        <p className="text-slate-600 mt-2">
          Access your account and manage your active listings quickly.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Email</label>
          <input
            type="email"
            placeholder="example@mail.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white shadow-md transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default Login;