import { NavLink } from "react-router-dom";
import Icon from "./Icon";

export default function CustomerHeader() {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 20, background: "var(--bg)",
      borderBottom: "1px solid var(--border-variant)", height: 72,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="sports_tennis" size={22} style={{ color: "var(--lime)" }} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 20, color: "var(--lime)" }}>
            PadelPlay
          </span>
        </div>
        <nav style={{ display: "flex", gap: 24 }}>
          <NavLink to="/" end style={({ isActive }) => ({
            textDecoration: "none", fontWeight: 700, fontSize: 14,
            color: isActive ? "var(--lime)" : "var(--ink-soft)",
            borderBottom: isActive ? "2px solid var(--lime)" : "2px solid transparent",
            paddingBottom: 4,
          })}>
            Home
          </NavLink>
          <NavLink to="/my-bookings" style={({ isActive }) => ({
            textDecoration: "none", fontWeight: 700, fontSize: 14,
            color: isActive ? "var(--lime)" : "var(--ink-soft)",
            borderBottom: isActive ? "2px solid var(--lime)" : "2px solid transparent",
            paddingBottom: 4,
          })}>
            My Bookings
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
