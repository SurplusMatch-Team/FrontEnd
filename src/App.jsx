import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#d1fae5_0,#f8fafc_45%)] opacity-80" />
      <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-emerald-200/70 blur-3xl" />
      <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-cyan-100/70 blur-3xl" />

      <div className="relative z-10 min-h-screen px-4 py-8 md:px-6 md:py-12 flex items-center justify-center">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 md:p-10 flex flex-col justify-between shadow-xl">
            <div>
              <p className="inline-flex items-center rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-1.5 mb-6 text-xs font-semibold tracking-wide text-emerald-700 shadow-sm">
                RePlate Ecosystem
              </p>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-slate-800">
                Turn food surplus into
                <span className="block text-emerald-600">valuable local impact.</span>
              </h1>
              <p className="mt-5 text-slate-600 text-sm md:text-base leading-relaxed">
                RePlate connects supermarkets, restaurants, and distributors with
                NGOs, dormitories, and community organizations to reduce waste through
                fast and fair allocation.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 mb-2">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
                    <path d="M4 12h16M12 4v16" />
                  </svg>
                </span>
                <p className="text-emerald-700 font-semibold">Live Matching</p>
                <p className="text-slate-600 mt-1">Real-time notifications and claims.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700 mb-2">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
                    <path d="M4 12l5 5L20 6" />
                  </svg>
                </span>
                <p className="text-cyan-700 font-semibold">Fair Allocation</p>
                <p className="text-slate-600 mt-1">Transparent and trackable process.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700 mb-2">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
                    <path d="M6 15c2.2 0 4-1.8 4-4 0-1.4-.7-2.6-1.8-3.3M18 9c-2.2 0-4 1.8-4 4 0 1.4.7 2.6 1.8 3.3" />
                  </svg>
                </span>
                <p className="text-teal-700 font-semibold">Lower Waste</p>
                <p className="text-slate-600 mt-1">Better efficiency and social value.</p>
              </div>
            </div>
          </section>

          <section className="flex flex-col justify-center">
            {isLogin ? <Login /> : <Register />}

            <p className="text-center text-sm text-slate-600 mt-5">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-emerald-700 font-semibold hover:text-emerald-600 transition"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;