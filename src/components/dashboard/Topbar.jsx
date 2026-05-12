import { useMemo, useState } from "react";
import { LanguageSwitch } from "../common/LanguageSwitch";
import { useI18n } from "../../i18n/I18nContext";

function Topbar({
  email,
  role,
  onLogout,
  onOpenChangePassword,
  showChangePassword = false,
  variant = "light",
  brandTone = "default",
  title,
  subtitle,
}) {
  const { t } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const roleClass = useMemo(() => {
    if (role === "MARKET") {
      return variant === "dark"
        ? "bg-cyan-500/15 text-cyan-100 border-cyan-400/30"
        : "bg-cyan-100 text-cyan-700 border-cyan-200";
    }
    return variant === "dark"
      ? "bg-emerald-500/15 text-emerald-100 border-emerald-400/30"
      : "bg-emerald-100 text-emerald-700 border-emerald-200";
  }, [role, variant]);

  const userInitial = (email || "U").charAt(0).toUpperCase();

  const kicker =
    brandTone === "ngo" ? t("topbar.kickerNgo") : role === "MARKET" ? t("topbar.kickerMarket") : t("topbar.kickerDefault");

  const shell =
    variant === "dark"
      ? "border-white/10 bg-slate-900/70 text-slate-100 shadow-xl backdrop-blur"
      : "border-slate-200/80 bg-white/95 text-slate-800 shadow-md backdrop-blur";

  const kickerClass =
    variant === "dark"
      ? brandTone === "ngo"
        ? "text-emerald-300/90"
        : "text-cyan-300/90"
      : "text-emerald-700";

  const titleClass = variant === "dark" ? "text-white" : "text-slate-900";
  const emailClass = variant === "dark" ? "text-slate-300" : "text-slate-600";
  const subClass = variant === "dark" ? "text-slate-400" : "text-slate-500";

  const menuBtn =
    variant === "dark"
      ? "border-white/15 bg-white/5 hover:bg-white/10 text-slate-100"
      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700";

  const avatarRing = variant === "dark" ? "bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-950" : "bg-slate-800 text-white";

  const dropdown = variant === "dark" ? "border-white/10 bg-slate-950 text-slate-100" : "border-slate-200 bg-white";

  const roleLabel =
    role === "MARKET" ? t("common.roleMarket") : role === "NGO" ? t("common.roleNgo") : role || t("common.roleMember");

  return (
    <header
      className={`rounded-3xl border p-5 md:p-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between relative ${shell}`}
    >
      <div className="space-y-2 max-w-2xl">
        <p className={`text-[11px] uppercase tracking-[0.22em] font-semibold ${kickerClass}`}>{kicker}</p>
        {title ? (
          <h1 className={`text-2xl md:text-3xl font-bold tracking-tight ${titleClass}`}>{title}</h1>
        ) : null}
        {subtitle ? <p className={`text-sm leading-relaxed ${subClass}`}>{subtitle}</p> : null}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <p className={`text-sm ${emailClass}`}>{email || t("common.unknownUser")}</p>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${roleClass}`}>{roleLabel}</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2 self-end md:self-auto md:flex-row md:items-center">
        <LanguageSwitch variant={variant} />
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className={`inline-flex items-center gap-3 rounded-xl border px-3 py-2 transition ${menuBtn}`}
          >
            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${avatarRing}`}>
              {userInitial}
            </span>
            <span className="text-sm font-semibold">{t("topbar.menu")}</span>
          </button>

          {isMenuOpen ? (
            <div className={`absolute right-0 mt-2 w-52 rounded-xl border p-2 shadow-lg z-20 ${dropdown}`}>
              {showChangePassword && typeof onOpenChangePassword === "function" ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenChangePassword();
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                    variant === "dark" ? "text-slate-200 hover:bg-white/10" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {t("topbar.changePassword")}
                </button>
              ) : null}
              <button
                type="button"
                onClick={onLogout}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-500 hover:bg-red-500/10 transition"
              >
                {t("topbar.signOut")}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
