import { useState } from "react";
import { useI18n } from "../../i18n/I18nContext";

export function ClaimantAddressToggle({ addressLine }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const line = addressLine != null ? String(addressLine).trim() : "";
  if (!line) return null;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-500/20"
      >
        {open ? t("market.hideNgoAddress") : t("market.viewNgoAddress")}
      </button>
      {open ? (
        <div
          className="mt-2 max-w-md rounded-lg border border-white/15 bg-slate-950/80 px-3 py-2 text-xs leading-relaxed text-slate-200"
          role="region"
          aria-label={t("market.ngoAddressLabel")}
        >
          {line}
        </div>
      ) : null}
    </div>
  );
}
