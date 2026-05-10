import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../i18n/I18nContext";
import Login from "./Login";
import Register from "./Register";

function AuthPage({ mode = "login" }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useI18n();
  const isLoginRoute = mode === "login";

  const handleDemoEnter = (role) => {
    login({
      token: `demo-token-${role.toLowerCase()}`,
      user: {
        /** Placeholder ids for UI demo; use real login for API-backed data. */
        id: role === "MARKET" ? 90001 : 90002,
        email: role === "MARKET" ? "market-demo@replate.local" : "ngo-demo@replate.local",
        role,
        organizationName: role === "MARKET" ? "Sunrise Market Co-op" : "Community Plate NGO",
      },
    });
    navigate(role === "MARKET" ? "/dashboard/market" : "/dashboard/ngo", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 relative overflow-hidden">
      <Link
        to="/"
        className="absolute left-4 top-4 z-30 inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1.5 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur transition hover:border-emerald-200 hover:text-emerald-800 md:left-6 md:top-6"
      >
        {t("authPage.backHome")}
      </Link>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#d1fae5_0,#f8fafc_45%)] opacity-80" />
      <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-emerald-200/70 blur-3xl" />
      <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-cyan-100/70 blur-3xl" />

      <div className="relative z-10 min-h-screen px-4 py-8 md:px-6 md:py-12 flex items-center justify-center">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 md:p-10 flex flex-col justify-between shadow-xl">
            <div>
              <p className="inline-flex items-center rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-1.5 mb-6 text-xs font-semibold tracking-wide text-emerald-700 shadow-sm">
                {t("authPage.badge")}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-slate-800">
                {t("authPage.headline")}
                <span className="block text-emerald-600">{t("authPage.headlineAccent")}</span>
              </h1>
              <p className="mt-5 text-slate-600 text-sm md:text-base leading-relaxed">{t("authPage.body")}</p>
            </div>
          </section>

          <section className="flex flex-col justify-center">
            {isLoginRoute ? <Login /> : <Register />}

            <p className="text-center text-sm text-slate-600 mt-5">
              {isLoginRoute ? t("authPage.toggleToRegister") : t("authPage.toggleToLogin")}{" "}
              <Link
                className={`font-semibold transition ${
                  isLoginRoute ? "text-cyan-700 hover:text-cyan-600" : "text-emerald-700 hover:text-emerald-600"
                }`}
                to={isLoginRoute ? "/register" : "/login"}
              >
                {isLoginRoute ? t("authPage.linkRegister") : t("authPage.linkLogin")}
              </Link>
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoEnter("NGO")}
                className="w-full rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition"
              >
                {t("authPage.demoNgo")}
              </button>
              <button
                type="button"
                onClick={() => handleDemoEnter("MARKET")}
                className="w-full rounded-xl border border-cyan-200 bg-cyan-50 py-3 text-sm font-semibold text-cyan-700 hover:bg-cyan-100 transition"
              >
                {t("authPage.demoMarket")}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
