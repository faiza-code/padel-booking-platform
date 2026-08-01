import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Icon from "../../components/Icon";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/admin/courts");
    } catch {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: "0 20px" }}>
      <Card>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
            <Icon name="sports_tennis" size={24} style={{ color: "var(--lime)" }} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 20, color: "var(--lime)" }}>PadelPlay</span>
          </div>
          <h2 style={{ fontSize: 20 }}>Admin Portal</h2>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: 14, borderRadius: 10, border: "1px solid var(--border-variant)" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: 14, borderRadius: 10, border: "1px solid var(--border-variant)" }}
          />
          {error && <p style={{ color: "var(--clay)", margin: 0, fontSize: 13 }}>{error}</p>}
          <Button type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
