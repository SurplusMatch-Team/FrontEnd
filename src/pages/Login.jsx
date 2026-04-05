import { useState } from "react";
import { loginUser } from "../api/authService";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await loginUser(form);
      console.log("Login response:", res);
      setSuccess("Giriş başarılı");
    } catch (err) {
      setError(err.response?.data?.message || "Sunucu hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-center mb-2">Giriş Yap</h2>
      <p className="text-center text-gray-500 mb-6">
        Hesabınıza giriş yapın
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-100 text-green-700 px-4 py-2 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            placeholder="ornek@mail.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Şifre</label>
          <input
            type="password"
            placeholder="Şifrenizi girin"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-300"
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
}

export default Login;