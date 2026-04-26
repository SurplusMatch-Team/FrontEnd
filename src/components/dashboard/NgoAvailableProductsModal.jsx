import { useMemo, useState } from "react";
import { useI18n } from "../../i18n/I18nContext";
import { ProductCard } from "../surplus/ProductCard";
import { ProductListSection } from "../surplus/ProductListSection";

const ALL = "__all__";

function NgoAvailableProductsModal({
  open,
  onClose,
  products,
  loading,
  error,
  qtyByProduct,
  onQtyChange,
  onClaim,
}) {
  const { t } = useI18n();
  const [tagFilter, setTagFilter] = useState(ALL);

  const handleClose = () => {
    setTagFilter(ALL);
    onClose();
  };

  const tags = useMemo(() => {
    const names = products.map((p) => p.categoryName).filter(Boolean);
    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filtered = useMemo(() => {
    if (tagFilter === ALL) return products;
    return products.filter((p) => p.categoryName === tagFilter);
  }, [products, tagFilter]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-3 py-6 sm:px-4">
      <button
        type="button"
        aria-label={t("market.modalClose")}
        className="absolute inset-0 bg-[#021910]/80 backdrop-blur-md"
        onClick={handleClose}
      />
      <div
        className="relative z-10 flex max-h-[min(90vh,760px)] w-full max-w-2xl flex-col overflow-hidden rounded-[1.5rem] border border-emerald-500/20 bg-gradient-to-b from-slate-950 via-emerald-950/95 to-[#041910] text-slate-100 shadow-[0_0_60px_-12px_rgba(16,185,129,0.35)] ring-1 ring-white/10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ngo-browse-modal-title"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-400/40 to-transparent" />

        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
          <div>
            <h2 id="ngo-browse-modal-title" className="text-lg font-bold tracking-tight text-white">
              {t("ngo.browseModalTitle")}
            </h2>
            <p className="mt-1 text-xs text-emerald-200/70 sm:text-sm">{t("ngo.browseModalHint")}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            {t("market.modalClose")}
          </button>
        </div>

        <div className="shrink-0 border-b border-white/10 px-4 py-3 sm:px-5">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-teal-300/80">{t("ngo.filterByTag")}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTagFilter(ALL)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                tagFilter === ALL
                  ? "bg-gradient-to-r from-lime-400 to-emerald-400 text-emerald-950 shadow-md ring-2 ring-lime-300/40"
                  : "border border-white/15 bg-white/5 text-slate-200 hover:border-emerald-400/40 hover:bg-emerald-500/10"
              }`}
            >
              {t("ngo.filterAll")}
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setTagFilter(tag)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                  tagFilter === tag
                    ? "bg-teal-500 text-white shadow-md ring-2 ring-teal-300/50"
                    : "border border-white/15 bg-white/5 text-slate-200 hover:border-teal-400/40 hover:bg-teal-500/15"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          {loading ? (
            <ProductListSection variant="dark" loading />
          ) : error ? (
            <ProductListSection variant="dark" error />
          ) : products.length === 0 ? (
            <ProductListSection variant="dark" isEmpty />
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.04] px-6 py-12 text-center text-sm text-slate-400">
              {t("ngo.browseEmptyFilter")}
            </div>
          ) : (
            <ul className="space-y-4">
              {filtered.map((p) => (
                <li key={p.id} className="rounded-2xl ring-1 ring-white/5">
                  <ProductCard
                    product={p}
                    footer={
                      p.status === "AVAILABLE" ? (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                          <div className="flex-1">
                            <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                              {t("ngo.reqQty")}
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={qtyByProduct[p.id] ?? ""}
                              onChange={(e) => onQtyChange(p.id, e.target.value)}
                              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                              placeholder={`${p.quantity}`}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => onClaim(p)}
                            className="shrink-0 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-110"
                          >
                            {t("ngo.claim")}
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-amber-900/90">{t("ngo.claimBlocked")}</p>
                      )
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default NgoAvailableProductsModal;
