import { useMemo, useState } from "react";
import { FOOD_CATEGORY_SLUGS, CATEGORY_DB_NAME_TO_SLUG } from "../../data/categories";
import { datetimeLocalToApi } from "../../utils/surplusApi";
import { PRODUCT_UNIT_VALUES } from "../../constants/productUnits";
import { useI18n } from "../../i18n/I18nContext";
import { categoryLabelFromProduct } from "../../utils/categoryDisplay";
import { formatExpiryDate, formatQuantity, sumPendingRequestedForProduct } from "../../utils/surplusDisplay";
import { ProductListSection } from "../surplus/ProductListSection";

function isoToDatetimeLocal(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

function inferCategorySlug(product, t) {
  if (product.categorySlug && FOOD_CATEGORY_SLUGS.includes(product.categorySlug)) return product.categorySlug;
  const fromDb = product.categoryName && CATEGORY_DB_NAME_TO_SLUG[product.categoryName];
  if (fromDb) return fromDb;
  const match = FOOD_CATEGORY_SLUGS.find((slug) => t(`categories.${slug}`) === product.categoryName);
  return match || FOOD_CATEGORY_SLUGS[0];
}

/** Edit: block only while the listing waits on a pending NGO request (partial approve → still editable). */
function isProductEditLocked(product, claims) {
  if (product.status === "PENDING") return true;
  return (claims || []).some((c) => {
    const pending = String(c.status || "").toUpperCase() === "PENDING";
    return pending && Number(c.productId) === Number(product.id);
  });
}

/** Delete: only block while a claim still needs market action (pending NGO request). */
function isProductDeleteLocked(product, claims) {
  if (product.status === "PENDING") return true;
  return (claims || []).some((c) => {
    const pending = String(c.status || "").toUpperCase() === "PENDING";
    return pending && Number(c.productId) === Number(product.id);
  });
}

function MarketMyProductsModal({
  open,
  onClose,
  products,
  claims = [],
  loading,
  error,
  onUpdate,
  onDelete,
}) {
  const { t, locale } = useI18n();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [toast, setToast] = useState({ type: "", text: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const statusLabel = (status) => {
    const key = `productCard.status.${status}`;
    const lbl = t(key);
    return lbl === key ? status : lbl;
  };

  const startEdit = (p) => {
    setToast({ type: "", text: "" });
    if (isProductEditLocked(p, claims)) {
      setToast({ type: "err", text: t("market.editLocked") });
      return;
    }
    setEditingId(p.id);
    setEditForm({
      name: p.name,
      quantity: String(p.quantity),
      quantityUnit: p.quantityUnit || "kg",
      maxClaimQuantity:
        p.maxClaimQuantity != null && Number.isFinite(Number(p.maxClaimQuantity))
          ? String(p.maxClaimQuantity)
          : "",
      expiryDate: isoToDatetimeLocal(p.expiryDate),
      categorySlug: inferCategorySlug(p, t),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = async (productId) => {
    if (!editForm) return;
    const qty = Number(editForm.quantity);

    if (!editForm.name.trim() || !editForm.expiryDate || Number.isNaN(qty) || qty <= 0) {
      setToast({ type: "err", text: t("market.editErrValidation") });
      return;
    }

    const selectedDate = new Date(editForm.expiryDate);
    const now = new Date();
    if (selectedDate <= now) {
      setToast({ type: "err", text: t("market.editErrExpiryPast") });
      return;
    }

    const maxRaw = String(editForm.maxClaimQuantity ?? "").trim();
    let maxClaimQuantity;
    if (maxRaw !== "") {
      const maxClaim = Number(maxRaw);
      if (!Number.isInteger(maxClaim) || maxClaim < 1 || maxClaim > qty) {
        setToast({ type: "err", text: t("market.formErrMaxClaim") });
        return;
      }
      maxClaimQuantity = maxClaim;
    }

    const catLabel = t(`categories.${editForm.categorySlug}`);
    const categoryName = catLabel === `categories.${editForm.categorySlug}` ? t("market.categoryGeneral") : catLabel;
    try {
      const patch = {
        name: editForm.name.trim(),
        quantity: qty,
        quantityUnit: editForm.quantityUnit,
        expiryDate: datetimeLocalToApi(editForm.expiryDate),
        categorySlug: editForm.categorySlug,
        categoryName,
      };
      if (maxClaimQuantity != null) {
        patch.maxClaimQuantity = maxClaimQuantity;
      }
      await onUpdate(productId, patch);
      setToast({ type: "ok", text: t("market.updateOk") });
      cancelEdit();
    } catch (err) {
      setToast({ type: "err", text: err?.message || t("market.saveFailed") });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    try {
      await onDelete(id);
      if (editingId === id) cancelEdit();
      setDeleteTarget(null);
      setToast({ type: "ok", text: t("market.deleteOk") });
    } catch (err) {
      setToast({ type: "err", text: err?.message || t("market.deleteErr") });
    }
  };

  const sorted = useMemo(() => {
    return [...products].sort((a, b) => {
      const tb = new Date(b.createdAt || 0).getTime();
      const ta = new Date(a.createdAt || 0).getTime();
      return tb - ta;
    });
  }, [products]);

  const handleClose = () => {
    setEditingId(null);
    setEditForm(null);
    setDeleteTarget(null);
    setToast({ type: "", text: "" });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-3 py-6 sm:px-4">
      <button
        type="button"
        aria-label={t("market.modalClose")}
        className="absolute inset-0 bg-[#020c12]/82 backdrop-blur-md"
        onClick={handleClose}
      />
      <div
        className="relative z-10 flex max-h-[min(90vh,760px)] w-full max-w-lg flex-col overflow-hidden rounded-[1.5rem] border border-cyan-500/20 bg-gradient-to-b from-slate-950 via-cyan-950/90 to-[#041820] text-slate-100 shadow-[0_0_60px_-12px_rgba(34,211,238,0.32)] ring-1 ring-white/10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="market-products-modal-title"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
          <div>
            <h2 id="market-products-modal-title" className="text-lg font-bold tracking-tight text-white">
              {t("market.productsModalTitle")}
            </h2>
            <p className="mt-1 text-xs text-cyan-100/65 sm:text-sm">{t("market.productsModalHint")}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            {t("market.modalClose")}
          </button>
        </div>

        {toast.text ? (
          <div
            className={`mx-4 mt-3 shrink-0 rounded-xl border px-3 py-2 text-sm sm:mx-5 ${
              toast.type === "ok"
                ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
                : "border-red-400/40 bg-red-500/15 text-red-100"
            }`}
          >
            {toast.text}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          <ProductListSection
            variant="dark"
            loading={loading}
            error={error}
            isEmpty={!loading && !error && sorted.length === 0}
          >
            <ul className="space-y-3">
              {sorted.map((p) => {
                const pendingReserved = sumPendingRequestedForProduct(claims, p.id);
                const editLocked = isProductEditLocked(p, claims);
                return (
                <li key={p.id} className="rounded-2xl border border-white/10 bg-slate-950/55 p-3 ring-1 ring-white/5 sm:p-4">
                  {editingId === p.id && editForm ? (
                    <div className="space-y-3">
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={editForm.categorySlug}
                          onChange={(e) => setEditForm((f) => ({ ...f, categorySlug: e.target.value }))}
                          className="rounded-lg border border-white/15 bg-slate-900 px-2 py-2 text-sm text-white"
                        >
                          {FOOD_CATEGORY_SLUGS.map((slug) => (
                            <option key={slug} value={slug}>
                              {t(`categories.${slug}`)}
                            </option>
                          ))}
                        </select>
                        <input
                          type="datetime-local"
                          value={editForm.expiryDate}
                          onChange={(e) => setEditForm((f) => ({ ...f, expiryDate: e.target.value }))}
                          className="rounded-lg border border-white/15 bg-slate-900 px-2 py-2 text-sm text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          min={1}
                          value={editForm.quantity}
                          onChange={(e) => setEditForm((f) => ({ ...f, quantity: e.target.value }))}
                          className="rounded-lg border border-white/15 bg-slate-900 px-2 py-2 text-sm text-white"
                        />
                        <select
                          value={editForm.quantityUnit}
                          onChange={(e) => setEditForm((f) => ({ ...f, quantityUnit: e.target.value }))}
                          className="rounded-lg border border-white/15 bg-slate-900 px-2 py-2 text-sm text-white"
                        >
                          {PRODUCT_UNIT_VALUES.map((u) => (
                            <option key={u} value={u}>
                              {t(`units.${u}`)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          {t("market.formMaxClaim")}
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={editForm.maxClaimQuantity}
                          onChange={(e) => setEditForm((f) => ({ ...f, maxClaimQuantity: e.target.value }))}
                          className="mt-1 w-full rounded-lg border border-white/15 bg-slate-900 px-2 py-2 text-sm text-white"
                          placeholder={t("market.formMaxClaimPh")}
                        />
                        <p className="mt-1 text-[10px] leading-snug text-slate-500">{t("market.formMaxClaimHint")}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(p.id)}
                          className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2 text-sm font-bold text-slate-950 shadow-md transition hover:brightness-110"
                        >
                          {t("market.save")}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-lg border border-white/20 px-3 py-1.5 text-sm font-semibold text-slate-200 hover:bg-white/5"
                        >
                          {t("market.cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-white">{p.name}</p>
                          <p className="text-xs text-cyan-300/90">{categoryLabelFromProduct(t, p)}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {formatQuantity(p, t)} · {t("productCard.useBy")}{" "}
                            {formatExpiryDate(p.expiryDate, locale)}
                          </p>
                          {p.maxClaimQuantity != null && Number.isFinite(Number(p.maxClaimQuantity)) ? (
                            <p className="mt-1 text-[11px] text-emerald-200/85">
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
                          {pendingReserved > 0 ? (
                            <p className="mt-1.5 text-[11px] leading-snug text-amber-200/85">
                              {t("market.pendingReservedHint", { n: pendingReserved })}
                            </p>
                          ) : null}
                        </div>
                        <span className="shrink-0 self-start rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-300">
                          {statusLabel(p.status)}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={editLocked}
                          title={editLocked ? t("market.editLocked") : undefined}
                          onClick={() => startEdit(p)}
                          className={`rounded-lg border border-cyan-400/40 bg-cyan-500/15 px-3 py-1.5 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/25 ${
                            editLocked ? "cursor-not-allowed opacity-40 hover:bg-cyan-500/15" : ""
                          }`}
                        >
                          {t("market.edit")}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (isProductDeleteLocked(p, claims)) {
                              setToast({ type: "err", text: t("market.deleteLocked") });
                              return;
                            }
                            setDeleteTarget(p);
                          }}
                          className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-1.5 text-sm font-semibold text-red-200 hover:bg-red-500/20"
                        >
                          {t("market.delete")}
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
              })}
            </ul>
          </ProductListSection>
        </div>

        {deleteTarget ? (
          <div className="shrink-0 border-t border-white/10 bg-slate-950/90 px-4 py-4 sm:px-5">
            <p className="text-sm font-semibold text-white">{t("market.deleteConfirmTitle")}</p>
            <p className="mt-1 text-xs text-slate-400">{t("market.deleteConfirmBody")}</p>
            <p className="mt-2 text-sm text-slate-300">&ldquo;{deleteTarget.name}&rdquo;</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-400"
              >
                {t("market.confirmDelete")}
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5"
              >
                {t("market.cancel")}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default MarketMyProductsModal;
