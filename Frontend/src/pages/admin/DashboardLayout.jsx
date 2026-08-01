import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/Icon";

const navItems = [
  { to: "/admin/courts", label: "Stadiums", icon: "stadium" },
  { to: "/admin/closures", label: "Closures", icon: "event_busy" },
  { to: "/admin/bookings", label: "Bookings", icon: "list_alt" },
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
        width: 250, background: "var(--card)", borderRight: "1px solid var(--border-variant)",
        padding: "32px 20px", display: "flex", flexDirection: "column"
      }}>
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 17, color: "var(--lime)" }}>Admin Panel</h2>
          <p style={{ fontSize: 10, color: "var(--ink-soft)", marginTop: 4, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
            Padel Center Management
          </p>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                padding: "13px 16px", borderRadius: 12, textDecoration: "none",
                color: isActive ? "var(--on-lime)" : "var(--ink-soft)",
                background: isActive ? "var(--lime)" : "transparent",
                fontWeight: isActive ? 800 : 600,
                display: "flex", alignItems: "center", gap: 12, fontSize: 14,
                boxShadow: isActive ? "0 0 15px rgba(195,244,0,0.15)" : "none",
              })}
            >
              <Icon name={item.icon} size={19} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, background: "var(--card-hi)",
            borderRadius: 12, padding: "10px 12px", marginBottom: 12,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", background: "var(--lime)",
              color: "var(--on-lime)", display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 13, flexShrink: 0,
            }}>
              {(username || "?").slice(0, 1).toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontSize: 12, fontWeight: 700, margin: 0, whiteSpace: "nowrap" }}>{username}</p>
              <p style={{ fontSize: 10, color: "var(--ink-soft)", margin: 0 }}>Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            background: "none", border: "1px solid var(--border-variant)",
            color: "var(--clay)", padding: "10px 14px", borderRadius: 10, width: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, fontWeight: 700,
          }}>
            <Icon name="logout" size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: 36, background: "var(--bg)" }}>
        <Outlet />
      </main>
    </div>
  );
}
