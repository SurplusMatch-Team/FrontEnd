function InventoryList({ items, role }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            *
          </span>
          Available Batches
        </h3>
        <span className="rounded-full bg-gradient-to-r from-slate-100 to-cyan-50 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
          {items.length} items
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <article
            key={item.id}
            className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-3 flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-cyan-100 text-cyan-700 text-xs font-bold">
                {index + 1}
              </span>
              <div>
                <p className="font-semibold text-slate-800">{item.title}</p>
                <p className="text-sm text-slate-600 mt-1">
                  Expires in <span className="font-semibold text-amber-600">{item.expiresInDays} day(s)</span> •{" "}
                  {item.quantity}
                </p>
              </div>
            </div>
            <button
              type="button"
              className={`rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-sm transition ${
                role === "MARKET" ? "bg-cyan-600 hover:bg-cyan-500" : "bg-emerald-600 hover:bg-emerald-500"
              }`}
            >
              {role === "MARKET" ? "Manage" : "Claim"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default InventoryList;
