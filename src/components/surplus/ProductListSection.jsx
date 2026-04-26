import { useI18n } from "../../i18n/I18nContext";

function CenteredPanel({ children, className = "", variant = "light" }) {
  const base =
    variant === "dark"
      ? "border-dashed border-white/15 bg-slate-950/50 text-slate-300"
      : "border-dashed border-slate-200 bg-slate-50/80";
  return (
    <div className={`rounded-2xl border px-6 py-14 text-center ${base} ${className}`}>{children}</div>
  );
}

export function ProductListSection({
  loading,
  error,
  isEmpty,
  children,
  loadingMessage,
  errorMessage,
  emptyMessage,
  errorHint,
  variant = "light",
}) {
  const { t } = useI18n();
  const lm = loadingMessage ?? t("productList.loading");
  const em = errorMessage ?? t("productList.error");
  const zm = emptyMessage ?? t("productList.empty");
  const eh = errorHint ?? t("productList.errorHint");
  const isDark = variant === "dark";

  if (loading) {
    return (
      <CenteredPanel variant={variant}>
        <div
          className={`mx-auto mb-4 h-10 w-10 rounded-full border-2 animate-spin ${
            isDark ? "border-white/15 border-t-cyan-400" : "border-slate-200 border-t-cyan-600"
          }`}
        />
        <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>{lm}</p>
      </CenteredPanel>
    );
  }

  if (error) {
    return (
      <CenteredPanel variant={variant} className={isDark ? "border-red-400/30 bg-red-950/40" : "border-red-100 bg-red-50/50"}>
        <p className={`text-sm font-semibold ${isDark ? "text-red-200" : "text-red-800"}`}>{em}</p>
        <p className={`mt-2 text-xs ${isDark ? "text-red-300/90" : "text-red-600/90"}`}>{eh}</p>
      </CenteredPanel>
    );
  }

  if (isEmpty) {
    return (
      <CenteredPanel variant={variant}>
        <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>{zm}</p>
      </CenteredPanel>
    );
  }

  return children;
}
