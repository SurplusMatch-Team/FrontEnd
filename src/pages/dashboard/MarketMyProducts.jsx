import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProductsByOwner } from "../../services/productService";
import { getClaimsByProduct, approveClaim, rejectClaim } from "../../services/claimService";

const statusStyles = {
  AVAILABLE: "border-emerald-200 bg-emerald-50 text-emerald-800",
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  CLOSED: "border-slate-200 bg-slate-100 text-slate-700",
};

function MarketMyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeProductId, setActiveProductId] = useState(null);
  const [productClaims, setProductClaims] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(false);

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    const userStr = localStorage.getItem("replate_auth_user");
    if (!userStr) return;
    const user = JSON.parse(userStr);

    try {
      setLoading(true);
      const data = await getProductsByOwner(user.id);
      setProducts(data);
    } catch (err) {
      setError(err.message || "Failed to load your products.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewClaims = async (productId) => {
    if (activeProductId === productId) {
      setActiveProductId(null);
      return;
    }
    
    setActiveProductId(productId);
    try {
      setClaimsLoading(true);
      const claims = await getClaimsByProduct(productId);
      setProductClaims(claims);
    } catch (err) {
      alert("Failed to load claims for this product.");
    } finally {
      setClaimsLoading(false);
    }
  };

  const handleApprove = async (claimId) => {
    try {
      await approveClaim(claimId);
      alert("W! Claim approved. Product quantity has been reduced.");
      handleViewClaims(activeProductId); 
      fetchMyProducts(); 
    } catch (err) {
      alert(err.message || "Failed to approve claim.");
    }
  };

  // REDDETME
  const handleReject = async (claimId) => {
    try {
      await rejectClaim(claimId);
      alert("Claim rejected.");
      handleViewClaims(activeProductId); 
    } catch (err) {
      alert(err.message || "Failed to reject claim.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Market</p>
          <h2 className="text-2xl font-bold text-slate-800">My products</h2>
          <p className="mt-1 text-sm text-slate-600">
            Manage your live surplus listings and review incoming NGO requests.
          </p>
        </div>
        <Link
          to="/dashboard/market/add-product"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-cyan-500 hover:to-teal-500"
        >
          + Add product
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-600">Loading your products...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-slate-600">You haven't listed any products yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((item) => (
            <article
              key={item.id}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm transition hover:border-cyan-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-800 group-hover:text-cyan-800">{item.name}</h3>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    statusStyles[item.status] || statusStyles.AVAILABLE
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                <span className="font-bold text-emerald-700">{item.quantity} units</span>
                <span className="mx-2 text-slate-300">·</span>
                Expires: {new Date(item.expiryDate).toLocaleDateString()}
              </p>
              <p className="mt-1 text-xs text-slate-500">Category: {item.category?.name}</p>
              
              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => handleViewClaims(item.id)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-50 hover:border-cyan-200"
                >
                  {activeProductId === item.id ? "Close Claims" : "View Claims"}
                </button>
              </div>

              {activeProductId === item.id && (
                <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Incoming Requests</h4>
                  
                  {claimsLoading ? (
                    <p className="text-xs text-slate-500">Loading claims...</p>
                  ) : productClaims.length === 0 ? (
                    <p className="text-xs text-slate-500">No pending claims for this product.</p>
                  ) : (
                    <ul className="space-y-3">
                      {productClaims.map((claim) => (
                        <li key={claim.id} className="flex flex-col gap-2 rounded-lg bg-white p-2 border border-slate-100 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {claim.claimant?.organizationName || "Unknown NGO"}
                              </p>
                              <p className="text-xs text-slate-600">
                                Wants: <span className="font-bold">{claim.requestedQuantity}</span>
                              </p>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded">
                              {claim.status}
                            </span>
                          </div>
                          
                          {/* Sadece PENDING olan taleplere buton gösteriyoruz */}
                          {claim.status === "PENDING" && (
                            <div className="flex gap-2 mt-1">
                              <button
                                onClick={() => handleApprove(claim.id)}
                                className="flex-1 rounded-md bg-emerald-600 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-500"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(claim.id)}
                                className="flex-1 rounded-md bg-red-600 py-1.5 text-xs font-bold text-white transition hover:bg-red-500"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default MarketMyProducts;