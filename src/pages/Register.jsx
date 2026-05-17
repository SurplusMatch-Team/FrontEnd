import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { useI18n } from "../i18n/I18nContext";

function Register() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [form, setForm] = useState({
    email: "",
    password: "",
    organizationName: "",
    role: "MARKET",
    city: "",
    district: "",
    fullAddress: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const city = form.city.trim();
    const district = form.district.trim();
    const fullAddress = form.fullAddress.trim();
    if (!city || !district || !fullAddress) {
      setError(t("register.errAddress"));
      setLoading(false);
      return;
    }

    try {
      await registerUser({ ...form, city, district, fullAddress });
      setSuccess(t("register.success"));

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 700);
    } catch (err) {
      setError(err?.message || err?.response?.data?.message || t("register.errServer"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-7 md:p-9 shadow-xl">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-700 font-semibold">{t("register.kicker")}</p>
        <h2 className="text-3xl font-bold text-slate-800 mt-2 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          {t("register.title")}
        </h2>
        <p className="text-slate-600 mt-2">{t("register.subtitle")}</p>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>
      ) : null}

      {success ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
          {success}
        </div>
      ) : null}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">{t("register.email")}</label>
          <input
            type="email"
            placeholder={t("register.phEmail")}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">{t("register.password")}</label>
          <input
            type="password"
            placeholder={t("register.phPassword")}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">{t("register.orgName")}</label>
          <input
            type="text"
            placeholder={t("register.phOrg")}
            value={form.organizationName}
            onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">{t("register.orgType")}</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
          >
            <option value="NGO">{t("common.roleNgo")}</option>
            <option value="MARKET">{t("common.roleMarket")}</option>
          </select>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">{t("register.addressSection")}</p>
            <p className="mt-1 text-xs text-slate-500">{t("register.addressHint")}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">{t("common.city")}</label>
              <input
                type="text"
                required
                placeholder={t("register.phCity")}
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">{t("common.district")}</label>
              <input
                type="text"
                required
                placeholder={t("register.phDistrict")}
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">{t("common.address")}</label>
            <input
              type="text"
              required
              placeholder={t("register.phFullAddress")}
              value={form.fullAddress}
              onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-cyan-600 py-3 font-semibold text-white shadow-md transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? t("register.submitting") : t("register.submit")}
        </button>
      </form>
    </div>
  );
}

export default Register;
