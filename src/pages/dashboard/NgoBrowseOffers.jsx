import { useState, useEffect } from "react";
import { createClaim } from "../../services/claimService";
import { getUrgentProducts } from "../../services/productService";

const filters = ["All", "Expiring soon", "Near me"];

function NgoBrowseOffers() {
  const [activeFilter, setActiveFilter] = useState("Expiring soon"); 
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [claimQuantities, setClaimQuantities] = useState({});

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const data = await getUrgentProducts();
        const productList = Array.isArray(data) ? data : [];
        const availableOffers = productList.filter(
          (product) => product.status === "AVAILABLE"
        );

      setOffers(availableOffers);
      } catch (err) {
        setError(err.message || "Failed to fetch offers.");
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const handleQuantityChange = (productId, value) => {
    setClaimQuantities(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const handleClaim = async (offer) => {
    const userString = localStorage.getItem("replate_auth_user");
    if (!userString) {
      alert("Session expired. Please login again.");
      return;
    }
    const user = JSON.parse(userString);
    
    const reqQuantity = claimQuantities[offer.id];
    if (!reqQuantity || reqQuantity <= 0) {
      alert("Please enter a valid quantity you want to claim.");
      return;
    }

    if (reqQuantity > offer.quantity) {
      alert(`You cannot request more than the available quantity (${offer.quantity}).`);
      return;
    }

    try {
      await createClaim({
        productId: offer.id,
        claimantId: user.id,
        requestedQuantity: Number(reqQuantity),
      });

      alert(`Claim request submitted successfully for ${offer.name}!`);
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
          Live surplus listings from markets in the network. Claim what fits your capacity.
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

      {loading ? (
         <p className="text-slate-600">Loading urgent offers...</p>
      ) : error ? (
         <p className="text-red-600">{error}</p>
      ) : offers.length === 0 ? (
         <p className="text-slate-600">No available offers at the moment.</p>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <article
              key={offer.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-emerald-50/30 p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {offer.owner?.organizationName || "Unknown Market"}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-800">{offer.name}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  <span className="font-semibold text-emerald-700">{offer.quantity} available</span>
                  <span className="mx-2 text-slate-300">·</span>
                  <span className="font-medium text-amber-700">
                    Expires: {new Date(offer.expiryDate).toLocaleString()}
                  </span>
                  <span className="mx-2 text-slate-300">·</span>
                  Category: {offer.category?.name || "-"}
                </p>
              </div>
              
              <div className="flex shrink-0 flex-wrap items-center gap-3 md:flex-col">
                <input 
                  type="number"
                  placeholder="Qty"
                  min="1"
                  max={offer.quantity}
                  value={claimQuantities[offer.id] || ""}
                  onChange={(e) => handleQuantityChange(offer.id, e.target.value)}
                  className="w-20 rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleClaim(offer)}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                >
                  Request claim
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default NgoBrowseOffers;