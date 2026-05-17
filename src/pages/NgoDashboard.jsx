import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NgoAvailableProductsModal from "../components/dashboard/NgoAvailableProductsModal";
import Topbar from "../components/dashboard/Topbar";
import RoleGuard from "../components/common/RoleGuard";
import { ProductListSection } from "../components/surplus/ProductListSection";
import { useSurplus } from "../context/SurplusContext";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../i18n/I18nContext";
import { formatExpiryDate } from "../utils/surplusDisplay";
import { MAX_PENDING_CLAIMS_PER_NGO } from "../constants/surplusLimits";

function LeafMark({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M32 4C18 12 8 26 8 42c0 8 6 14 14 14 10 0 18-8 22-20 4 12 12 20 22 20 8 0 14-6 14-14 0-16-10-30-24-38"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="opacity-40"
      />
      <path d="M32 8v48M20 28h24" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="opacity-25" />
    </svg>
  );
}

function claimRailClass(status) {
  if (status === "PENDING") return "border-l-amber-400";
  if (status === "APPROVED") return "border-l-emerald-400";
  if (status === "REJECTED") return "border-l-rose-400";
  if (status === "WITHDRAWN") return "border-l-slate-500";
  return "border-l-slate-500";
}

function NgoDashboardInner() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, locale } = useI18n();
  const { catalogStatus, products, claims, addClaim, withdrawClaim } = useSurplus();
  const [availableModalOpen, setAvailableModalOpen] = useState(false);
  const [qtyByProduct, setQtyByProduct] = useState({});
  const [banner, setBanner] = useState({ type: "", text: "" });
  const [claimAlert, setClaimAlert] = useState({ type: "", text: "", productId: null });
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [claimBusy, setClaimBusy] = useState(false);

  const ngoUserId = user?.id != null ? Number(user.id) : NaN;

  const browseProducts = useMemo(() => products.filter((p) => p.status !== "ALLOCATED"), [products]);

  const browseProductsSorted = browseProducts;

  /** Context only loads this NGO's claims via `getClaimsByClaimant`; no client filter (API omits `claimant` in JSON). */
  const myClaims = useMemo(() => claims, [claims]);

  const myClaimsSorted = useMemo(() => {
    return [...myClaims].sort((a, b) => Number(b.id) - Number(a.id));
  }, [myClaims]);

  const pendingClaims = useMemo(() => myClaimsSorted.filter((c) => c.status === "PENDING"), [myClaimsSorted]);
  const historyClaims = useMemo(() => myClaimsSorted.filter((c) => c.status !== "PENDING"), [myClaimsSorted]);

  const [showClaimHistory, setShowClaimHistory] = useState(false);

  const loading = catalogStatus === "loading";
  const error = catalogStatus === "error";

  const openCount = browseProducts.filter((p) => p.status === "AVAILABLE").length;
  const pendingMine = myClaims.filter((c) => c.status === "PENDING").length;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const setQty = (productId, value) => {
    setQtyByProduct((prev) => ({ ...prev, [productId]: value }));
  };

  const unitLabel = (u) => {
    const key = `units.${u || "units"}`;
    const lbl = t(key);
    return lbl === key ? u || "units" : lbl;
  };

  const showClaimFeedback = (type, text, productId = null) => {
    if (availableModalOpen) {
      setClaimAlert({ type, text, productId });
      setBanner({ type: "", text: "" });
    } else {
      setBanner({ type, text });
      setClaimAlert({ type: "", text: "", productId: null });
    }
  };

  const handleClaim = async (product) => {
    setClaimAlert({ type: "", text: "", productId: null });
    setBanner({ type: "", text: "" });
    if (!Number.isFinite(ngoUserId)) {
      showClaimFeedback("err", t("login.errUser"), product.id);
      return;
    }
    const raw = qtyByProduct[product.id] ?? "";
    const requested = Number(raw);
    if (Number.isNaN(requested) || requested <= 0) {
      showClaimFeedback("err", t("ngo.errQty"), product.id);
      return;
    }
    const cap = product.maxClaimQuantity;
    if (cap != null && Number.isFinite(Number(cap)) && requested > Number(cap)) {
      showClaimFeedback(
        "err",
        t("ngo.errExceedMaxClaim", { max: cap, unit: unitLabel(product.quantityUnit) }),
        product.id,
      );
      return;
    }
    if (requested > product.quantity) {
      showClaimFeedback(
        "err",
        t("ngo.errExceed", { max: product.quantity, unit: unitLabel(product.quantityUnit) }),
        product.id,
      );
      return;
    }
    const pendingCount = myClaims.filter((c) => c.status === "PENDING").length;
    if (pendingCount >= MAX_PENDING_CLAIMS_PER_NGO) {
      showClaimFeedback("err", t("ngo.errMaxPending", { max: MAX_PENDING_CLAIMS_PER_NGO }), product.id);
      return;
    }
    const duplicatePending = myClaims.some(
      (c) => c.status === "PENDING" && Number(c.productId) === Number(product.id),
    );
    if (duplicatePending) {
      showClaimFeedback("err", t("ngo.errDuplicateProduct"), product.id);
      return;
    }
    setClaimBusy(true);
    try {
      await addClaim({ requestedQuantity: requested }, product.id);
      setQty(product.id, "");
      showClaimFeedback("ok", t("ngo.okClaim"), product.id);
    } catch (err) {
      showClaimFeedback("err", err?.message || t("ngo.claimSubmitErr"), product.id);
    } finally {
      setClaimBusy(false);
    }
  };

  const closeBrowseModal = () => {
    setAvailableModalOpen(false);
    setClaimAlert({ type: "", text: "", productId: null });
  };

  const claimStatusLabel = (s) => {
    const key = `ngo.claimStatus.${s}`;
    const lbl = t(key);
    return lbl === key ? s : lbl;
  };

  const confirmWithdraw = async () => {
    if (!withdrawTarget) return;
    try {
      await withdrawClaim(Number(withdrawTarget.id));
      setWithdrawTarget(null);
      setBanner({ type: "ok", text: t("ngo.claimWithdrawOk") });
    } catch (err) {
      setBanner({ type: "err", text: err?.message || t("ngo.claimWithdrawErr") });
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03150f] text-slate-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 100% 60% at 10% -10%, rgba(52, 211, 153, 0.22), transparent 50%), radial-gradient(ellipse 70% 50% at 90% 10%, rgba(45, 212, 191, 0.18), transparent 45%), radial-gradient(ellipse 50% 40% at 50% 100%, rgba(190, 242, 100, 0.08), transparent 50%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0px,transparent 1px)] bg-[length:100%_14px] opacity-40" />
      <div className="pointer-events-none absolute -left-32 top-1/3 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-[380px] w-[380px] rounded-full bg-teal-400/10 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-6 md:px-6 md:pb-20 md:pt-8">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-xl">
          <Topbar
            email={user?.email}
            role="NGO"
            variant="dark"
            brandTone="ngo"
            title={t("ngo.title")}
            subtitle={t("ngo.subtitle")}
            onLogout={handleLogout}
          />
        </div>

        {error && !loading ? (
          <div
            className="mt-6 rounded-2xl border border-amber-400/35 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-50 backdrop-blur-sm"
            role="alert"
          >
            {t("ngo.dashboardLoadErr")}
          </div>
        ) : null}

        {banner.text ? (
          <div
            className={`mt-8 rounded-2xl border px-4 py-3 text-sm font-medium backdrop-blur-md ${
              banner.type === "ok"
                ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-50"
                : "border-red-400/35 bg-red-500/15 text-red-100"
            }`}
          >
            {banner.text}
          </div>
        ) : null}
        
          {(user?.city || user?.address?.city) && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-sm text-teal-100 backdrop-blur-sm">
            <span className="text-xl">📍</span>
            <p>
              <strong className="text-teal-300">Showing products near you: </strong> 
              Sadece <b className="text-white">{user?.city || user?.address?.city}</b> bölgesindeki güvenli ürünler listeleniyor.
            </p>
          </div>
        )}

        <div className="mt-10 grid gap-5 lg:grid-cols-12 lg:gap-6">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-950/90 via-teal-950/80 to-[#022c1c] p-8 shadow-2xl shadow-black/40 ring-1 ring-white/5 lg:col-span-7 md:p-10">
            <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-lime-400/15 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-teal-300/10 blur-2xl" />
            <LeafMark className="pointer-events-none absolute right-6 top-6 h-24 w-24 text-lime-200/30 md:right-10 md:top-8" />

            <div className="relative">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-200/90">
                <span className="h-1.5 w-1.5 rounded-full bg-lime-400 shadow-[0_0_12px_rgba(190,242,100,0.9)]" />
                {t("ngo.livePill")}
              </p>
              <h2 className="mt-5 max-w-lg text-3xl font-bold leading-[1.12] tracking-tight text-white md:text-4xl">
                {t("ngo.boardTitle")}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-emerald-100/75 md:text-base">{t("ngo.intro")}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4 backdrop-blur-sm">
                  <p className="text-3xl font-bold tabular-nums text-white">{openCount}</p>
                  <p className="mt-1 text-xs font-medium text-emerald-200/75">{t("ngo.statOpenCaption")}</p>
                </div>
                <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 px-5 py-4 backdrop-blur-sm">
                  <p className="text-3xl font-bold tabular-nums text-amber-50">{pendingMine}</p>
                  <p className="mt-1 text-xs font-medium text-amber-100/80">{t("ngo.statPendingCaption")}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-4 lg:col-span-5">
            <div className="relative flex-1 overflow-hidden rounded-[1.75rem] border border-lime-400/25 bg-gradient-to-br from-lime-500/20 via-emerald-600/25 to-teal-700/30 p-6 shadow-lg backdrop-blur-md">
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-lime-300/20 blur-2xl" />
              <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-lime-100/90">{t("ngo.missionLabel")}</p>
              <p className="relative mt-3 text-xl font-bold leading-snug text-white">{t("ngo.missionTitle")}</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.07] p-5 text-sm leading-relaxed text-slate-300 shadow-inner backdrop-blur-md">
              <span className="font-semibold text-white">{t("ngo.noPaymentBold")}</span>
              <span className="text-slate-400">{t("ngo.noPaymentRest")}</span>
            </div>
          </div>
        </div>

        <section className="relative mt-12 overflow-hidden rounded-[2rem] p-[1px] shadow-2xl shadow-emerald-950/50">
          <div className="absolute inset-0 bg-gradient-to-r from-lime-300/50 via-emerald-400/40 to-teal-400/50 opacity-80 blur-sm" />
          <div className="relative rounded-[2rem] border border-white/10 bg-slate-950/85 px-6 py-10 text-center backdrop-blur-xl md:px-12 md:py-12">
            <div className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 max-w-md -translate-x-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-teal-300/80">{t("ngo.availableTitle")}</p>
            <h3 className="mx-auto mt-3 max-w-lg text-2xl font-bold tracking-tight text-white md:text-3xl">{t("ngo.browseHeroTitle")}</h3>
            <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">{t("ngo.browseModalHint")}</p>
            <button
              type="button"
              onClick={() => setAvailableModalOpen(true)}
              className="group relative mt-8 inline-flex items-center justify-center overflow-hidden rounded-2xl px-10 py-4 text-sm font-bold text-emerald-950 shadow-[0_0_40px_-8px_rgba(52,211,153,0.65)] transition hover:scale-[1.02] active:scale-[0.99]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-lime-300 via-emerald-300 to-teal-300 transition group-hover:brightness-110" />
              <span className="relative flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                {t("ngo.openBrowse", { n: browseProductsSorted.length })}
              </span>
            </button>
          </div>
        </section>

        <NgoAvailableProductsModal
          open={availableModalOpen}
          onClose={closeBrowseModal}
          products={browseProductsSorted}
          loading={loading}
          error={error}
          qtyByProduct={qtyByProduct}
          onQtyChange={(productId, value) => {
            setQty(productId, value);
            if (claimAlert.productId === productId) {
              setClaimAlert({ type: "", text: "", productId: null });
            }
          }}
          onClaim={handleClaim}
          claimBusy={claimBusy}
          claimAlert={claimAlert}
          onDismissClaimAlert={() => setClaimAlert({ type: "", text: "", productId: null })}
        />

        <section className="mt-14">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300/70">{t("ngo.claimsEyebrow")}</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">{t("ngo.myClaims")}</h2>
              <p className="mt-2 max-w-xl text-sm text-slate-400">{t("ngo.claimsActiveHint")}</p>
            </div>
            <div className="hidden h-px flex-1 translate-y-[-6px] bg-gradient-to-r from-teal-500/40 via-white/10 to-transparent sm:block" />
          </div>

          {loading ? (
            <ProductListSection variant="dark" loading />
          ) : error ? (
            <ProductListSection variant="dark" error />
          ) : myClaimsSorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.04] px-8 py-16 text-center text-sm text-slate-400 backdrop-blur-sm">
              {t("ngo.emptyClaims")}
            </div>
          ) : (
            <>
              {pendingClaims.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.04] px-8 py-12 text-center text-sm text-slate-400 backdrop-blur-sm">
                  {t("ngo.emptyPendingClaims")}
                </div>
              ) : (
                <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {pendingClaims.map((c) => {
                    const rail = claimRailClass(c.status);
                    return (
                      <li
                        key={c.id}
                        className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] py-4 pl-5 pr-4 shadow-lg backdrop-blur-md transition hover:border-emerald-400/25 hover:bg-white/[0.09] border-l-4 ${rail}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-white">{c.productName}</p>
                          <span className="shrink-0 rounded-full border border-white/10 bg-black/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-100/90">
                            {claimStatusLabel(c.status)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-400">
                          <span className="font-medium text-emerald-100/90">{c.marketName}</span>
                          <span className="text-slate-600"> · </span>
                          {t("ngo.useBy")} <span className="text-slate-300">{formatExpiryDate(c.expiryDate, locale)}</span>
                        </p>

                        <p className="mt-3 text-sm text-slate-300">
                          {t("ngo.askedFor")}{" "}
                          <span className="font-bold text-lime-200">{c.requestedQuantity}</span> {t("ngo.askedSuffix")}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setBanner({ type: "", text: "" });
                              setWithdrawTarget(c);
                            }}
                            className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-500/20"
                          >
                            {t("ngo.claimWithdraw")}
                          </button>
                        </div>

                        {withdrawTarget?.id === c.id ? (
                          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-950/40 px-3 py-3 backdrop-blur-sm">
                            <p className="text-sm font-semibold text-rose-100">{t("ngo.withdrawConfirmTitle")}</p>
                            <p className="mt-1 text-xs text-rose-200/80">{t("ngo.withdrawConfirmBody")}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={confirmWithdraw}
                                className="rounded-lg bg-rose-500 px-3 py-2 text-sm font-bold text-white hover:bg-rose-400"
                              >
                                {t("ngo.confirmWithdraw")}
                              </button>
                              <button
                                type="button"
                                onClick={() => setWithdrawTarget(null)}
                                className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15"
                              >
                                {t("passwordModal.cancel")}
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}

              {historyClaims.length > 0 ? (
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => setShowClaimHistory((v) => !v)}
                    className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                  >
                    {showClaimHistory
                      ? t("ngo.claimHistoryToggleHide")
                      : t("ngo.claimHistoryToggleShow", { n: historyClaims.length })}
                  </button>

                  {showClaimHistory ? (
                    <div className="mt-4">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t("ngo.claimHistoryEyebrow")}</p>
                      <ul className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {historyClaims.map((c) => {
                          const rail = claimRailClass(c.status);
                          return (
                            <li
                              key={c.id}
                              className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] py-4 pl-5 pr-4 shadow-lg backdrop-blur-md border-l-4 ${rail}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-semibold text-white">{c.productName}</p>
                                <span className="shrink-0 rounded-full border border-white/10 bg-black/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-300">
                                  {claimStatusLabel(c.status)}
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-slate-500">
                                <span className="font-medium text-emerald-200/70">{c.marketName}</span>
                                <span className="text-slate-600"> · </span>
                                {t("ngo.useBy")} <span className="text-slate-400">{formatExpiryDate(c.expiryDate, locale)}</span>
                              </p>
                              <p className="mt-3 text-sm text-slate-500">
                                {t("ngo.askedFor")}{" "}
                                <span className="font-semibold text-slate-300">{c.requestedQuantity}</span>{" "}
                                {t("ngo.askedSuffix")}
                              </p>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function NgoDashboard() {
  return (
    <RoleGuard allowedRoles={["NGO"]}>
      <NgoDashboardInner />
    </RoleGuard>
  );
}

export default NgoDashboard;
