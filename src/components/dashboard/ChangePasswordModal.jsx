import { useState } from "react";
import { useI18n } from "../../i18n/I18nContext";

function ChangePasswordModal({ isOpen, onClose }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword.length < 6) {
      setError(t("passwordModal.errMin"));
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError(t("passwordModal.errMatch"));
      return;
    }

    setSuccess(t("passwordModal.success"));
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">{t("passwordModal.title")}</h2>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700" aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            type="password"
            placeholder={t("passwordModal.current")}
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
          />
          <input
            type="password"
            placeholder={t("passwordModal.new")}
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
          />
          <input
            type="password"
            placeholder={t("passwordModal.confirm")}
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t("passwordModal.cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              {t("passwordModal.update")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
