import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MarketMyProductsModal from "../components/dashboard/MarketMyProductsModal";
import { MarketGreenScorePanel } from "../components/dashboard/MarketGreenScorePanel";
import Topbar from "../components/dashboard/Topbar";
import { OrganizationLocationPanel } from "../components/dashboard/OrganizationLocationPanel";
import { ClaimantAddressToggle } from "../components/dashboard/ClaimantAddressToggle";
import RoleGuard from "../components/common/RoleGuard";
import { ProductListSection } from "../components/surplus/ProductListSection";
import { FOOD_CATEGORY_SLUGS } from "../data/categories";
import { useSurplus } from "../context/SurplusContext";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../i18n/I18nContext";
import { datetimeLocalToApi, coerceId } from "../utils/surplusApi";
import { PRODUCT_UNIT_VALUES } from "../constants/productUnits";

function StoreMark({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M8 28V52h48V28M8 28l8-16h32l8 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        className="opacity-35"
      />
      <path d="M16 36h10v10H16zm22 0h10v10H38zM16 48h32" stroke="currentColor" strokeWidth="1" className="opacity-25" />
    </svg>
  );
}

function MarketDashboardInner() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const { catalogStatus, products, claims, addProduct, updateProduct, deleteProduct, resolveClaim } = useSurplus();
  const [productsModalOpen, setProductsModalOpen] = useState(false);
  const [inboxMsg, setInboxMsg] = useState({ type: "", text: "" });
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    maxClaimQuantity: "",
    quantityUnit: "kg",
    expiryDate: "",
    categorySlug: FOOD_CATEGORY_SLUGS[0] || "bakery",
  });
  const [formMsg, setFormMsg] = useState({ type: "", text: "" });

  const ownerKey = user?.email || "";
  const marketUserId = user?.id != null ? Number(user.id) : NaN;

  const myProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.status === "CLOSED") return false;
      if (Number.isFinite(marketUserId) && p.ownerId != null) {
        return Number(p.ownerId) === marketUserId;
      }
      return p.ownerKey === ownerKey;
    });
  }, [products, ownerKey, marketUserId]);

  const myProductsSorted = useMemo(() => {
    return [...myProducts].sort((a, b) => {
      const tb = new Date(b.createdAt || 0).getTime();
      const ta = new Date(a.createdAt || 0).getTime();
      return tb - ta;
    });
  }, [myProducts]);

  const incomingClaims = useMemo(() => {
    const myIds = new Set(
      myProducts.map((p) => coerceId(p.id)).filter((id) => id != null),
    );
    return claims.filter((c) => {
      const pid = coerceId(c.productId);
      const pending = String(c.status || "").toUpperCase() === "PENDING";
      return pid != null && myIds.has(pid) && pending;
    });
  }, [claims, myProducts]);

  const metrics = useMemo(() => {
    const open = myProducts.filter((p) => p.status === "AVAILABLE" || p.status === "PENDING").length;
    return {
      liveListings: myProducts.length,
      openSlots: open,
      inbox: incomingClaims.length,
    };
  }, [myProducts, incomingClaims]);

  const loading = catalogStatus === "loading";
  const error = catalogStatus === "error";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleResolveClaim = async (claimId, resolution) => {
    setInboxMsg({ type: "", text: "" });
    try {
      await resolveClaim(claimId, resolution);
      setInboxMsg({
        type: "ok",
        text: resolution === "APPROVED" ? t("market.resolveApproveOk") : t("market.resolveRejectOk"),
      });
    } catch (err) {
      const msg = err?.message || t("market.resolveFail");
      const low = String(msg).toLowerCase();
      const stockHint =
        resolution === "APPROVED" &&
        (low.includes("insufficient") || low.includes("exceed") || low.includes("quantity"));
      setInboxMsg({
        type: "err",
        text: stockHint ? t("market.resolveStockFail") : msg,
      });
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setFormMsg({ type: "", text: "" });
    const qty = Number(form.quantity);

    if (!form.name.trim() || !form.expiryDate || Number.isNaN(qty) || qty <= 0) {
      setFormMsg({ type: "err", text: t("market.formErr") });
      return;
    }

    const selectedDate = new Date(form.expiryDate);
    const now = new Date();
    if (selectedDate <= now) {
      setFormMsg({ type: "err", text: t("market.errExpiryPast") });
      return;
    }

    const maxRaw = String(form.maxClaimQuantity ?? "").trim();
    if (maxRaw !== "") {
      const maxClaim = Number(maxRaw);
      if (!Number.isInteger(maxClaim) || maxClaim < 1 || maxClaim > qty) {
        setFormMsg({ type: "err", text: t("market.formErrMaxClaim") });
        return;
      }
    }

    const catLabel = t(`categories.${form.categorySlug}`);
    const categoryName = catLabel === `categories.${form.categorySlug}` ? t("market.categoryGeneral") : catLabel;
    try {
      await addProduct({
        name: form.name.trim(),
        categorySlug: form.categorySlug,
        categoryName,
        quantity: qty,
        quantityUnit: form.quantityUnit,
        expiryDate: datetimeLocalToApi(form.expiryDate),
        maxClaimQuantity: String(form.maxClaimQuantity ?? "").trim() === "" ? null : Number(form.maxClaimQuantity),
      });
      setFormMsg({ type: "ok", text: t("market.formOk") });
      setForm((f) => ({
        ...f,
        name: "",
        quantity: "",
        maxClaimQuantity: "",
        expiryDate: "",
      }));
    } catch (err) {
      setFormMsg({ type: "err", text: err?.message || t("market.formErr") });
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#051017] text-slate-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 100% 55% at 8% -8%, rgba(34, 211, 238, 0.2), transparent 52%), radial-gradient(ellipse 65% 45% at 92% 8%, rgba(45, 212, 191, 0.16), transparent 48%), radial-gradient(ellipse 55% 38% at 50% 100%, rgba(56, 189, 248, 0.07), transparent 52%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0px,transparent_1px)] bg-[length:100%_14px] opacity-35" />
      <div className="pointer-events-none absolute -left-28 top-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/12 blur-[110px]" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-[360px] w-[360px] rounded-full bg-teal-500/10 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-6 md:px-6 md:pb-20 md:pt-8">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-xl">
          <Topbar
            email={user?.email}
            role="MARKET"
            variant="dark"
            title={t("market.title")}
            subtitle={t("market.subtitle")}
            onLogout={handleLogout}
          />
        </div>

        {error && !loading ? (
          <div
            className="mt-6 rounded-2xl border border-amber-400/35 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-50 backdrop-blur-sm"
            role="alert"
          >
            {t("market.dashboardLoadErr")}
          </div>
        ) : null}

        <OrganizationLocationPanel user={user} variant="dark" hintKey="dashboard.myLocationHintMarket" />

        <div className="mt-10 grid gap-5 lg:grid-cols-12 lg:gap-6">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/95 via-cyan-950/75 to-[#061c24] p-8 shadow-2xl shadow-black/40 ring-1 ring-white/5 lg:col-span-7 md:p-10">
            <div className="pointer-events-none absolute -right-12 top-0 h-52 w-52 rounded-full bg-cyan-400/18 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-36 w-36 rounded-full bg-sky-400/12 blur-2xl" />
            <StoreMark className="pointer-events-none absolute right-6 top-6 h-24 w-24 text-cyan-200/35 md:right-10 md:top-8" />

            <div className="relative">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200/90">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.85)]" />
                {t("market.livePill")}
              </p>
              <h2 className="mt-5 max-w-lg text-3xl font-bold leading-[1.12] tracking-tight text-white md:text-4xl">{t("market.heroTitle")}</h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-cyan-100/70 md:text-base">{t("market.heroBody")}</p>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-black/25 px-5 py-4 backdrop-blur-sm">
                  <p className="text-3xl font-bold tabular-nums text-white">{metrics.liveListings}</p>
                  <p className="mt-1 text-xs font-medium text-cyan-100/75">{t("market.statListingsCaption")}</p>
                </div>
                <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-5 py-4 backdrop-blur-sm">
                  <p className="text-3xl font-bold tabular-nums text-emerald-50">{metrics.openSlots}</p>
                  <p className="mt-1 text-xs font-medium text-emerald-100/80">{t("market.statOpenCaption")}</p>
                </div>
                <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 px-5 py-4 backdrop-blur-sm">
                  <p className="text-3xl font-bold tabular-nums text-amber-50">{metrics.inbox}</p>
                  <p className="mt-1 text-xs font-medium text-amber-100/80">{t("market.statInboxCaption")}</p>
                </div>
                <MarketGreenScorePanel claims={claims} myProducts={myProducts} t={t} />
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-4 lg:col-span-5">
            <div className="relative flex-1 overflow-hidden rounded-[1.75rem] border border-cyan-400/30 bg-gradient-to-br from-cyan-500/25 via-sky-600/20 to-teal-800/35 p-6 shadow-lg backdrop-blur-md">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-cyan-300/25 blur-2xl" />
              <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/90">{t("market.cardNext")}</p>
              <p className="relative mt-3 text-xl font-bold leading-snug text-white">{t("market.cardNextTitle")}</p>
              <p className="relative mt-2 text-sm leading-relaxed text-cyan-50/85">{t("market.cardNextBody")}</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.07] p-5 text-sm leading-relaxed text-slate-300 shadow-inner backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t("market.cardFairTitle")}</p>
              <p className="mt-2 font-medium text-white">{t("market.cardFairBody")}</p>
            </div>
          </div>
        </div>

        <section className="relative mt-12 overflow-hidden rounded-[2rem] p-[1px] shadow-2xl shadow-cyan-950/40">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-300/45 via-sky-400/35 to-teal-400/45 opacity-75 blur-sm" />
          <div className="relative rounded-[2rem] border border-white/10 bg-slate-950/88 px-6 py-10 text-center backdrop-blur-xl md:px-12 md:py-12">
            <div className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 max-w-md -translate-x-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300/85">{t("market.productsHeroEyebrow")}</p>
            <h3 className="mx-auto mt-3 max-w-lg text-2xl font-bold tracking-tight text-white md:text-3xl">{t("market.productsHeroTitle")}</h3>
            <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">{t("market.productsModalHint")}</p>
            <button
              type="button"
              onClick={() => setProductsModalOpen(true)}
              className="group relative mt-8 inline-flex items-center justify-center overflow-hidden rounded-2xl px-10 py-4 text-sm font-bold text-slate-950 shadow-[0_0_40px_-8px_rgba(34,211,238,0.55)] transition hover:scale-[1.02] active:scale-[0.99]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-300 via-sky-300 to-teal-300 transition group-hover:brightness-110" />
              <span className="relative flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 10h16M4 14h10" strokeLinecap="round" />
                </svg>
                {t("market.openMyProducts", { n: myProducts.length })}
              </span>
            </button>
          </div>
        </section>

        <MarketMyProductsModal
          open={productsModalOpen}
          onClose={() => setProductsModalOpen(false)}
          products={myProductsSorted}
          claims={claims}
          loading={loading}
          error={error}
          onUpdate={(productId, patch) => updateProduct(productId, patch)}
          onDelete={(productId) => deleteProduct(productId)}
        />

        <section className="mt-12">
          <div className="mx-auto max-w-xl space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300/70">{t("market.addEyebrow")}</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-white md:text-2xl">{t("market.addTitle")}</h2>
              <p className="mt-1 text-sm text-slate-400">{t("market.addHint")}</p>
            </div>
            <form
              onSubmit={handleAddProduct}
              className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5 shadow-lg backdrop-blur-md md:p-6 space-y-4 ring-1 ring-white/[0.04]"
            >
              {formMsg.text ? (
                <div
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    formMsg.type === "ok"
                      ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                      : "border-red-400/40 bg-red-500/10 text-red-100"
                  }`}
                >
                  {formMsg.text}
                </div>
              ) : null}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">{t("market.formName")}</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none ring-cyan-500/0 transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/30"
                  placeholder={t("market.formNamePh")}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {t("market.formCategory")}
                  </label>
                  <select
                    value={form.categorySlug}
                    onChange={(e) => setForm((f) => ({ ...f, categorySlug: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
                  >
                    {FOOD_CATEGORY_SLUGS.map((slug) => (
                      <option key={slug} value={slug}>
                        {t(`categories.${slug}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">{t("market.formUseBy")}</label>
                  <input
                    required
                    type="datetime-local"
                    value={form.expiryDate}
                    onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">{t("market.formQty")}</label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
                    placeholder={t("market.formQtyPh")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">{t("market.formUnit")}</label>
                  <select
                    value={form.quantityUnit}
                    onChange={(e) => setForm((f) => ({ ...f, quantityUnit: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
                  >
                    {PRODUCT_UNIT_VALUES.map((u) => (
                      <option key={u} value={u}>
                        {t(`units.${u}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t("market.formMaxClaim")}
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.maxClaimQuantity}
                  onChange={(e) => setForm((f) => ({ ...f, maxClaimQuantity: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
                  placeholder={t("market.formMaxClaimPh")}
                />
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{t("market.formMaxClaimHint")}</p>
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-3 text-sm font-semibold text-slate-950 shadow-lg transition hover:brightness-110"
              >
                {t("market.publish")}
              </button>
            </form>
          </div>
        </section>

        <section className="mt-14 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300/70">{t("market.incomingEyebrow")}</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">{t("market.incoming")}</h2>
            </div>
            <p className="max-w-xl text-sm text-slate-400 md:text-right">{t("market.incomingHint")}</p>
          </div>

          {inboxMsg.text ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                inboxMsg.type === "ok"
                  ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-50"
                  : "border-red-400/35 bg-red-500/15 text-red-100"
              }`}
            >
              {inboxMsg.text}
            </div>
          ) : null}

          {loading ? (
            <ProductListSection variant="dark" loading />
          ) : error ? (
            <ProductListSection variant="dark" error />
          ) : incomingClaims.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.04] px-8 py-16 text-center text-sm text-slate-400 backdrop-blur-sm">
              {t("market.noPending")}
            </div>
          ) : (
            <ul className="space-y-3">
              {incomingClaims.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 border-l-4 border-l-cyan-400 bg-white/[0.06] py-4 pl-5 pr-4 shadow-lg backdrop-blur-md md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{c.productName}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {t("market.requestedBy")} <span className="text-slate-200">{c.ngoName}</span>
                      <span className="text-slate-500"> · </span>
                      <span className="text-cyan-200/90">{t("market.requestedUnits", { n: c.requestedQuantity })}</span>
                    </p>
                    <ClaimantAddressToggle addressLine={c.ngoAddressLine} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleResolveClaim(c.id, "APPROVED")}
                      className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                    >
                      {t("market.approve")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolveClaim(c.id, "REJECTED")}
                      className="rounded-xl border border-white/20 bg-transparent px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/5"
                    >
                      {t("market.reject")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function MarketDashboard() {
  return (
    <RoleGuard allowedRoles={["MARKET"]}>
      <MarketDashboardInner />
    </RoleGuard>
  );
}

export default MarketDashboard;
