import { Link } from "react-router-dom";

const MY_LISTINGS = [
  { id: "m1", title: "Bakery surplus mix", qty: "24 kg", status: "Live", expires: "1 day", claims: 2 },
  { id: "m2", title: "Chilled dairy pallets", qty: "3 pallets", status: "Pending review", expires: "2 days", claims: 0 },
  { id: "m3", title: "Produce end-of-day", qty: "40 boxes", status: "Completed", expires: "—", claims: 5 },
];

const statusStyles = {
  Live: "border-emerald-200 bg-emerald-50 text-emerald-800",
  "Pending review": "border-amber-200 bg-amber-50 text-amber-800",
  Completed: "border-slate-200 bg-slate-100 text-slate-700",
};

function MarketMyProducts() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Market</p>
          <h2 className="text-2xl font-bold text-slate-800">My products</h2>
          <p className="mt-1 text-sm text-slate-600">
          Demo cards below. For live API catalog use{" "}
          <Link to="/products" className="font-semibold text-cyan-700 underline hover:text-cyan-600">
            /products
          </Link>
          .
        </p>
        </div>
        <Link
          to="/dashboard/market/add-product"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-cyan-500 hover:to-teal-500"
        >
          + Add product
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MY_LISTINGS.map((item) => (
          <article
            key={item.id}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm transition hover:border-cyan-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-800 group-hover:text-cyan-800">{item.title}</h3>
              <span
                className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyles[item.status] || statusStyles.Live}`}
              >
                {item.status}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              <span className="font-medium text-slate-800">{item.qty}</span>
              <span className="mx-2 text-slate-300">·</span>
              Expires: {item.expires}
            </p>
            <p className="mt-1 text-xs text-slate-500">{item.claims} active claims</p>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Edit
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Pause
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default MarketMyProducts;
