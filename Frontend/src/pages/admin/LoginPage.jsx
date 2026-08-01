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
      setError("اسم المستخدم أو كلمة المرور غير صحيحة.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: "0 20px" }}>
      <Card>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
            <Icon name="sports_tennis" size={24} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--court-deep)" }}>PadelPlay</span>
          </div>
          <h2>لوحة التحكم</h2>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <input
            placeholder="اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: 12, borderRadius: 8, border: "1px solid var(--border)" }}
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: 12, borderRadius: 8, border: "1px solid var(--border)" }}
          />
          {error && <p style={{ color: "var(--clay)", margin: 0 }}>{error}</p>}
          <Button type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "جارٍ الدخول..." : "تسجيل الدخول"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
