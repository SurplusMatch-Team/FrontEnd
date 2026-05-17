import { useMemo } from "react";

function levelFromPoints(points) {
  if (points >= 150) return "gold";
  if (points >= 50) return "silver";
  return "bronze";
}

/** Green score from all approved claims for this market (includes closed/deleted listings). */
export function MarketGreenScorePanel({ claims, t }) {
  const { points, level } = useMemo(() => {
    const approved = claims.filter((c) => String(c.status || "").toUpperCase() === "APPROVED");
    let pts = 0;
    for (const c of approved) {
      const q = Number(c.requestedQuantity);
      pts += 10 + (Number.isFinite(q) ? Math.min(q, 40) : 0);
    }
    return { points: pts, level: levelFromPoints(pts) };
  }, [claims]);

  const levelLabel =
    level === "gold"
      ? t("market.greenLevelGold")
      : level === "silver"
        ? t("market.greenLevelSilver")
        : t("market.greenLevelBronze");

  const tooltip = `${t("market.greenScoreBody")} ${t("market.greenScoreDemoNote")}`;

  return (
    <div 
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-5 py-4 backdrop-blur-sm"
      title={tooltip}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200/85">{t("market.greenScoreEyebrow")}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums leading-none text-emerald-50">{points}</p>
      <p className="mt-1 min-w-0 truncate text-xs font-medium text-emerald-100/80">{t("market.greenScoreTitle")}</p>
      <p className="mt-0.5 min-w-0 truncate text-[11px] font-semibold text-white/90">{levelLabel}</p>
    </div>
  );
}
