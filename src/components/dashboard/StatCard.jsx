function StatCard({ title, value, hint, tone = "emerald" }) {
  const toneClasses = {
    emerald: "border-emerald-200 bg-gradient-to-br from-emerald-100 via-emerald-50 to-white",
    cyan: "border-cyan-200 bg-gradient-to-br from-cyan-100 via-cyan-50 to-white",
    teal: "border-teal-200 bg-gradient-to-br from-teal-100 via-teal-50 to-white",
  };

  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${toneClasses[tone] || toneClasses.emerald}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">{title}</p>
      <p className="mt-3 text-3xl font-bold text-slate-800">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{hint}</p>
    </article>
  );
}

export default StatCard;
