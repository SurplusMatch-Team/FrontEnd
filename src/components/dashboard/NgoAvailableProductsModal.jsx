import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../i18n/I18nContext";
import { categoryLabelFromProduct } from "../../utils/categoryDisplay";
import { ProductCard } from "../surplus/ProductCard";
import { ProductListSection } from "../surplus/ProductListSection";
import { findNgoClaimForProduct, ngoClaimGate } from "../../utils/ngoClaimGate";

const ALL = "__all__";

function NgoAvailableProductsModal({
  open,
  onClose,
  products,
  myClaims = [],
  loading,
  error,
  qtyByProduct,
  onQtyChange,
  onClaim,
  claimBusy = false,
  claimAlert = { type: "", text: "", productId: null },
  onDismissClaimAlert,
}) {
  const { t } = useI18n();
  const [tagFilter, setTagFilter] = useState(ALL);

  const claimStatusLabel = (status) => {
    const key = `ngo.claimStatus.${status}`;
    const lbl = t(key);
    return lbl === key ? status : lbl;
  };

  const handleClose = () => {
    setTagFilter(ALL);
    onClose();
  };

  const tags = useMemo(() => {
    const slugs = products.map((p) => p.categorySlug).filter(Boolean);
    const unique = [...new Set(slugs)];
    return unique.sort((a, b) =>
      categoryLabelFromProduct(t, { categorySlug: a }).localeCompare(
        categoryLabelFromProduct(t, { categorySlug: b }),
        undefined,
        { sensitivity: "base" },
      ),
    );
  }, [products, t]);

  const filtered = useMemo(() => {
    if (tagFilter === ALL) return products;
    return products.filter((p) => p.categorySlug === tagFilter);
  }, [products, tagFilter]);

  useEffect(() => {
    if (!claimAlert.text || !onDismissClaimAlert) return undefined;
    const ms = claimAlert.type === "ok" ? 4000 : 6500;
    const id = window.setTimeout(onDismissClaimAlert, ms);
    return () => window.clearTimeout(id);
  }, [claimAlert.text, claimAlert.type, onDismissClaimAlert]);

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
            {tags.map((slug) => (
              <button
                key={slug}
                type="button"
                onClick={() => setTagFilter(slug)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                  tagFilter === slug
                    ? "bg-teal-500 text-white shadow-md ring-2 ring-teal-300/50"
                    : "border border-white/15 bg-white/5 text-slate-200 hover:border-teal-400/40 hover:bg-teal-500/15"
                }`}
              >
                {categoryLabelFromProduct(t, {
                  categorySlug: slug,
                  categoryName: products.find((p) => p.categorySlug === slug)?.categoryName,
                })}
              </button>
            ))}
          </div>
        </div>

        {claimAlert.text ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center px-4 sm:bottom-5"
            aria-live="polite"
          >
            <div
              role="alert"
              className={`pointer-events-auto flex max-w-[min(100%,22rem)] items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium shadow-[0_12px_40px_-8px_rgba(0,0,0,0.55)] backdrop-blur-md ${
                claimAlert.type === "ok"
                  ? "border-emerald-400/45 bg-emerald-950/95 text-emerald-50"
                  : "border-red-400/50 bg-red-950/95 text-red-50"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  claimAlert.type === "ok" ? "bg-emerald-500/30 text-emerald-100" : "bg-red-500/35 text-red-100"
                }`}
                aria-hidden
              >
                {claimAlert.type === "ok" ? "✓" : "!"}
              </span>
              <span className="min-w-0 flex-1 leading-snug">{claimAlert.text}</span>
              {onDismissClaimAlert ? (
                <button
                  type="button"
                  onClick={onDismissClaimAlert}
                  className="shrink-0 rounded-lg px-1.5 py-0.5 text-base leading-none text-white/70 hover:bg-white/10 hover:text-white"
                  aria-label={t("market.modalClose")}
                >
                  ×
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-20 sm:px-5 sm:py-5 sm:pb-24">
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
            <>
              <p className="mb-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] leading-relaxed text-slate-400">
                {t("ngo.browseQuantityNote")}
              </p>
              <ul className="space-y-4">
                {filtered.map((p) => {
                  const isAlertTarget =
                    claimAlert.text && claimAlert.productId != null && Number(claimAlert.productId) === Number(p.id);
                  const existingClaim = findNgoClaimForProduct(p.id, myClaims);
                  const gate = ngoClaimGate(existingClaim);
                  const claimFormLocked = !gate.canClaim;
                  return (
                    <li
                      key={p.id}
                      className={`rounded-2xl ring-1 transition ${
                        isAlertTarget && claimAlert.type === "err"
                          ? "ring-2 ring-red-400/60 ring-offset-2 ring-offset-[#041910]"
                          : isAlertTarget && claimAlert.type === "ok"
                            ? "ring-2 ring-emerald-400/50 ring-offset-2 ring-offset-[#041910]"
                            : "ring-white/5"
                      }`}
                    >
                      <ProductCard
                        product={p}
                        footer={
                          gate.kind === "resolved" ? (
                            <p className="text-sm font-medium text-slate-600">
                              {t("ngo.alreadyEvaluatedClaim", {
                                status: claimStatusLabel(gate.status),
                              })}
                            </p>
                          ) : gate.kind === "pending" ? (
                            <p className="text-sm text-amber-900/90">{t("ngo.claimBlocked")}</p>
                          ) : p.status === "AVAILABLE" ? (
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                              <div className="flex-1">
                                <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                  {t("ngo.reqQty")}
                                </label>
                                {p.maxClaimQuantity != null && Number.isFinite(Number(p.maxClaimQuantity)) ? (
                                  <p className="mt-0.5 text-[11px] font-medium text-emerald-800">
                                    {t("productCard.maxClaimPerNgo", {
                                      max: p.maxClaimQuantity,
                                      unit:
                                        t(`units.${p.quantityUnit || "units"}`) ===
                                        `units.${p.quantityUnit || "units"}`
                                          ? p.quantityUnit || "units"
                                          : t(`units.${p.quantityUnit || "units"}`),
                                    })}
                                  </p>
                                ) : null}
                                <input
                                  type="number"
                                  min={1}
                                  disabled={claimBusy || claimFormLocked}
                                  value={qtyByProduct[p.id] ?? ""}
                                  onChange={(e) => onQtyChange(p.id, e.target.value)}
                                  className={`mt-1 w-full rounded-xl border bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                                    isAlertTarget && claimAlert.type === "err"
                                      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                                      : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-100"
                                  }`}
                                  placeholder={`${p.quantity}`}
                                />
                              </div>
                              <button
                                type="button"
                                disabled={claimBusy || claimFormLocked}
                                onClick={() => void onClaim(p)}
                                className="shrink-0 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
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
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NgoAvailableProductsModal;
