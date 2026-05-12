import { useMemo } from "react";

function levelFromPoints(points) {
  if (points >= 150) return "gold";
  if (points >= 50) return "silver";
  return "bronze";
}

/**
 * Demo green score from approved claims on this market's products (until API provides a field).
 */
export function MarketGreenScorePanel({ claims, myProducts, t }) {
  const { points, level } = useMemo(() => {
    const myIds = new Set(
      myProducts.map((p) => Number(p.id)).filter((n) => Number.isFinite(n)),
    );
    const approved = claims.filter(
      (c) => String(c.status || "").toUpperCase() === "APPROVED" && myIds.has(Number(c.productId)),
    );
    let pts = 0;
    for (const c of approved) {
      const q = Number(c.requestedQuantity);
      pts += 10 + (Number.isFinite(q) ? Math.min(q, 40) : 0);
    }
    return { points: pts, level: levelFromPoints(pts) };
  }, [claims, myProducts]);

  const levelLabel =
    level === "gold"
      ? t("market.greenLevelGold")
      : level === "silver"
        ? t("market.greenLevelSilver")
        : t("market.greenLevelBronze");

  return (
    <div className="rounded-2xl border border-emerald-400/35 bg-gradient-to-br from-emerald-500/20 via-teal-900/40 to-slate-950/80 px-5 py-4 shadow-lg backdrop-blur-sm ring-1 ring-emerald-400/15">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-200/90">{t("market.greenScoreEyebrow")}</p>
      <p className="mt-2 text-lg font-bold text-white">{t("market.greenScoreTitle")}</p>
      <p className="mt-1 text-xs leading-relaxed text-emerald-100/75">{t("market.greenScoreBody")}</p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-black tabular-nums text-emerald-200">{points}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-300/80">{t("market.greenScorePointsLabel")}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-white">{levelLabel}</p>
          <p className="text-[10px] text-emerald-200/80">{t("market.greenScoreLevelLabel")}</p>
        </div>
      </div>
      <p className="mt-3 border-t border-white/10 pt-2 text-[10px] leading-snug text-slate-400">{t("market.greenScoreDemoNote")}</p>
    </div>
  );
}
