import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/Icon";

const navItems = [
  { to: "/admin/courts", label: "الملاعب", icon: "stadium" },
  { to: "/admin/closures", label: "الإغلاقات", icon: "event_busy" },
  { to: "/admin/bookings", label: "الحجوزات", icon: "list_alt" },
];

export default function DashboardLayout() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{
        width: 240, background: "var(--card)", borderLeft: "1px solid var(--border)",
        padding: "24px 16px", display: "flex", flexDirection: "column"
      }}>
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, color: "var(--court-deep)" }}>PadelPlay</h3>
          <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>لوحة التحكم</p>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                padding: "10px 14px", borderRadius: 10, textDecoration: "none",
                color: isActive ? "var(--court-deep)" : "var(--ink-soft)",
                background: isActive ? "rgba(204,255,0,0.3)" : "transparent",
                fontWeight: isActive ? 700 : 500,
                display: "flex", alignItems: "center", gap: 10, fontSize: 14,
              })}
            >
              <Icon name={item.icon} size={19} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 8 }}>{username}</p>
          <button onClick={handleLogout} style={{
            background: "none", border: "1px solid var(--border)",
            color: "var(--clay)", padding: "8px 14px", borderRadius: 10, width: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13,
          }}>
            <Icon name="logout" size={16} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: 32, background: "var(--surface)" }}>
        <Outlet />
      </main>
    </div>
  );
}
