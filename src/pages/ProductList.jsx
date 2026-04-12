import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import { createClaim } from "../services/claimService";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claimSuccess, setClaimSuccess] = useState("");
  const [claimError, setClaimError] = useState("");

  const fetchProducts = async () => {
    try {
      setError("");
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleClaim = async (productId) => {
  try {
    setClaimSuccess("");
    setClaimError("");

    const user = JSON.parse(localStorage.getItem("replate_auth_user"));

    await createClaim({
      productId,
      claimantId: user.id,
    });

    setClaimSuccess("Claim created successfully.");
  } catch (err) {
    setClaimError(err.message || "Failed to create claim.");
  }
};

  return (
    <div className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <h2 className="mb-4 text-2xl font-bold text-slate-800">Product List</h2>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {claimError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {claimError}
        </div>
      )}

      {claimSuccess && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {claimSuccess}
        </div>
      )}

      {loading ? (
        <p className="text-slate-600">Loading products...</p>
      ) : error ? (
        <p className="text-slate-600">Products could not be loaded.</p>
      ) : products.length === 0 ? (
        <p className="text-slate-600">No products found.</p>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <h3 className="text-lg font-semibold text-slate-800">
                {product.name}
              </h3>
              <p className="text-slate-600">Quantity: {product.quantity}</p>
              <p className="text-slate-600">
                Category ID: {product.categoryId ?? product.category?.id ?? "-"}
              </p>
              <p className="text-slate-600">
                Expiry Date: {product.expiryDate}
              </p>

              <button
                onClick={() => handleClaim(product.id)}
                className="mt-3 rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500"
              >
                Claim
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductList;