import { useState } from "react";
import { registerUser } from "../api/authService";

function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "NGO",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await registerUser(form);
      console.log("Register response:", res);
      setSuccess("Registration successful");
    } catch (err) {
      setError(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Register</h2>

      <form onSubmit={handleRegister}>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />
        </div>

        <div style={{ marginTop: "10px" }}>
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
        </div>

        <div style={{ marginTop: "10px" }}>
          <select
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
          >
            <option value="NGO">NGO</option>
            <option value="MARKET">Market</option>
          </select>
        </div>

        <div style={{ marginTop: "10px" }}>
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Register"}
          </button>
        </div>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}

export default Register;