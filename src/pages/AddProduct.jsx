import { useState } from "react";
import { createProduct } from "../services/productService";

const CATEGORIES = [
  { id: 1, name: "Bakery" },
  { id: 2, name: "Fruits" },
  { id: 3, name: "Vegetables" },
  { id: 4, name: "Dairy" },
  { id: 5, name: "Dry Food" },
  { id: 6, name: "Cooked Meal" },
  { id: 7, name: "Beverages" },
];

function AddProduct() {
  const today = new Date().toISOString().slice(0, 16);

  const [form, setForm] = useState({
    name: "",
    quantity: "",
    expiryDate: "",
    categoryId: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.quantity || !form.expiryDate || !form.categoryId) {
      setError("Please fill in all fields.");
      return;
    }

    const selectedDate = new Date(form.expiryDate);
    if (selectedDate < new Date()) {
      setError("You cannot select a past date. Please select a future date.");
      return;
    }

    let formattedDate = form.expiryDate;
    if (formattedDate.length === 16) {
      formattedDate += ":00";
    }

    const userString = localStorage.getItem("replate_auth_user");
    if (!userString) {
      setError("User session not found. Please login again.");
      return;
    }
    const user = JSON.parse(userString);

    setLoading(true);

    try {
      await createProduct({
        name: form.name,
        quantity: Number(form.quantity),
        expiryDate: formattedDate, 
        categoryId: Number(form.categoryId),
        ownerId: user.id,
      });

      setSuccess("Product added successfully.");
      setForm({
        name: "",
        quantity: "",
        expiryDate: "",
        categoryId: "",
      });
    } catch (err) {
      setError(err.message || "Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <h2 className="mb-4 text-2xl font-bold text-slate-800">Add Product</h2>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Product name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />

        <input
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />

        <input
          type="datetime-local"
          min={today}
          value={form.expiryDate}
          onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />

        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        >
          <option value="">Select category</option>
          {CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-cyan-600 py-3 font-semibold text-white hover:bg-cyan-500 disabled:opacity-60"
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}

export default AddProduct;