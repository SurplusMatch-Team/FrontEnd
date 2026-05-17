import { useI18n } from "../../i18n/I18nContext";
import { categoryLabelFromProduct } from "../../utils/categoryDisplay";
import { formatExpiryDate, formatQuantity } from "../../utils/surplusDisplay";

function joinAddressParts(product) {
  const parts = [product.marketDistrict, product.marketCity, product.marketFullAddress].filter(Boolean);
  return parts.length ? [...new Set(parts.map((s) => String(s).trim()))].join(" · ") : "";
}

export function ProductCard({ product, footer }) {
  const { t, locale } = useI18n();
  const statusKey = `productCard.status.${product.status}`;
  const statusLabel = t(statusKey) === statusKey ? product.status : t(statusKey);

  const addressLine = joinAddressParts(product);

  const unitKey = `units.${product.quantityUnit || "units"}`;
  const unitLbl = t(unitKey);
  const unitForMax = unitLbl === unitKey ? product.quantityUnit || "units" : unitLbl;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:border-cyan-200/80 hover:shadow-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400 opacity-90" />
      <div className="flex flex-1 flex-col p-4 pt-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-snug text-slate-900">{product.name}</h3>
          <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
            {statusLabel}
          </span>
        </div>
        <p className="mt-1 text-xs font-medium text-cyan-700">{categoryLabelFromProduct(t, product)}</p>
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-slate-600">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t("productCard.quantity")}</dt>
            <dd className="font-medium text-slate-800">{formatQuantity(product, t)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t("productCard.useBy")}</dt>
            <dd className="font-medium text-slate-800">{formatExpiryDate(product.expiryDate, locale)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t("productCard.market")}</dt>
            <dd className="font-medium text-slate-800">{product.marketName}</dd>
          </div>
          {product.maxClaimQuantity != null && Number.isFinite(Number(product.maxClaimQuantity)) ? (
            <div className="col-span-2">
              <p className="text-sm font-medium text-emerald-800">
                {t("productCard.maxClaimPerNgo", { max: product.maxClaimQuantity, unit: unitForMax })}
              </p>
            </div>
          ) : null}
          {addressLine ? (
            <div className="col-span-2">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t("productCard.location")}</dt>
              <dd className="font-medium text-slate-800">{addressLine}</dd>
            </div>
          ) : null}
        </dl>
        {footer ? <div className="mt-4 border-t border-slate-100 pt-4">{footer}</div> : null}
      </div>
    </article>
  );
}
