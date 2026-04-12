import { useState } from "react";
import { createClaim } from "../../services/claimService";

const OFFERS = [
  { id: 1, org: "GreenLeaf Market", title: "Mixed bakery trays", qty: "18 kg", expires: "Today", distance: "2.4 km" },
  { id: 2, org: "Northside Wholesale", title: "Dairy assortment", qty: "12 crates", expires: "Tomorrow", distance: "5.1 km" },
  { id: 3, org: "Campus Co-op", title: "Fruit boxes", qty: "9 boxes", expires: "1 day", distance: "0.8 km" },
  { id: 4, org: "FreshMart", title: "Prepared salads", qty: "30 units", expires: "2 days", distance: "3.2 km" },
];

const filters = ["All", "Expiring soon", "Near me"];

function NgoBrowseOffers() {
  const [activeFilter, setActiveFilter] = useState("All");

  const handleClaim = async (offer) => {
  try {
    await createClaim({
      productId: offer.id,
      claimantId: 2,
    });

    alert(`A claim request has been submitted for ${offer.title}`);
  } catch (err) {
    alert(err.message || "Claim failed.");
  }
};

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">NGO</p>
        <h2 className="text-2xl font-bold text-slate-800">Browse offers</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Live surplus listings from markets in the network. Claim what fits your capacity and routing.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActiveFilter(f)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              activeFilter === f
                ? "border-emerald-600 bg-emerald-600 text-white shadow-md"
                : "border-emerald-100 bg-emerald-50/80 text-emerald-900 hover:border-emerald-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {OFFERS.map((offer) => (
          <article
            key={offer.id}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-emerald-50/30 p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{offer.org}</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-800">{offer.title}</h3>
              <p className="mt-1 text-sm text-slate-600">
                {offer.qty}
                <span className="mx-2 text-slate-300">·</span>
                <span className="font-medium text-amber-700">Expires {offer.expires}</span>
                <span className="mx-2 text-slate-300">·</span>
                {offer.distance}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2 md:flex-col">
              <button
                type="button"
                onClick={() => handleClaim(offer)}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
              >
                Request claim
              </button>
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Details
              </button>
            </div>
          </article>
        ))}
      </div>

      <p className="text-center text-xs text-slate-500">
        Filter “{activeFilter}” is UI-only for now; hook to API filters later.
      </p>
    </div>
  );
}

export default NgoBrowseOffers;
