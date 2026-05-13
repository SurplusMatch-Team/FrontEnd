import { useI18n } from "../../i18n/I18nContext";

/**
 * @param {{ variant?: "light" | "dark" }} props
 */
export function LanguageSwitch({ variant = "light" }) {
  const { locale, setLocale, t } = useI18n();
  const isDark = variant === "dark";
  const shell = isDark
    ? "border-white/15 bg-white/[0.06] text-slate-200"
    : "border-slate-200/90 bg-white/90 text-slate-700 shadow-sm";
  const active = isDark
    ? "bg-cyan-500/25 text-white ring-1 ring-cyan-400/40"
    : "bg-emerald-600 text-white shadow-sm";
  const idle = isDark ? "text-slate-400 hover:bg-white/10" : "text-slate-600 hover:bg-slate-100";

  return (
    <div className={`inline-flex rounded-xl border p-0.5 ${shell}`} role="group" aria-label={t("topbar.langSwitch")}>
      <button
        type="button"
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
        className={`rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wide transition sm:px-3 ${
          locale === "en" ? active : idle
        }`}
      >
        EN
      </button>
      <button
        type="button"
        aria-pressed={locale === "tr"}
        onClick={() => setLocale("tr")}
        className={`rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wide transition sm:px-3 ${
          locale === "tr" ? active : idle
        }`}
      >
        TR
      </button>
    </div>
  );
}
