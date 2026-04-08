function RecentActivity({ activities }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
          +
        </span>
        Recent Activity
      </h3>
      <ul className="mt-4 space-y-3">
        {activities.map((activity, index) => (
          <li key={activity.id} className="rounded-xl border border-slate-200 bg-gradient-to-r from-violet-50/40 to-white p-3">
            <div className="flex items-start gap-2">
              <span className="mt-1 inline-block h-2 w-2 rounded-full bg-violet-500" />
              <div>
                <p className="text-sm font-medium text-slate-800">{activity.title}</p>
                <p className="text-xs text-slate-600 mt-1">
                  {activity.time} {index === 0 ? "• newest" : ""}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RecentActivity;
