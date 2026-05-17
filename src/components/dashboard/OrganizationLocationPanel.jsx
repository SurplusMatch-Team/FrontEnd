import { useI18n } from "../../i18n/I18nContext";
import { formatOrganizationAddressLine } from "../../utils/organizationAddress";

export function OrganizationLocationPanel({ user, variant = "dark", hintKey = "dashboard.myLocationHint" }) {
  const { t } = useI18n();
  const addressLine = formatOrganizationAddressLine(user);
  if (!addressLine) return null;

  const isDark = variant === "dark";

  return (
    <div
      className={
        isDark
          ? "mt-6 rounded-2xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-50 backdrop-blur-sm"
          : "mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
      }
    >
      <p className={`text-xs font-bold uppercase tracking-wide ${isDark ? "text-cyan-200/90" : "text-slate-500"}`}>
        {t("dashboard.myLocation")}
      </p>
      <p className={`mt-1 font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{addressLine}</p>
      {hintKey ? <p className={`mt-1 text-xs ${isDark ? "text-cyan-100/70" : "text-slate-500"}`}>{t(hintKey)}</p> : null}
    </div>
  );
}
