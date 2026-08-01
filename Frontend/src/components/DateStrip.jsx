const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function dateToStr(d) {
  return d.toISOString().slice(0, 10);
}

export default function DateStrip({ value, onChange, days = 14 }) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
      {dates.map((d) => {
        const str = dateToStr(d);
        const active = str === value;
        return (
          <button
            key={str}
            onClick={() => onChange(str)}
            style={{
              flexShrink: 0, width: 72, height: 92, borderRadius: 14,
              border: active ? "none" : "1px solid var(--border-variant)",
              background: active ? "var(--lime)" : "var(--card)",
              boxShadow: active ? "0 0 15px rgba(195,244,0,0.2)" : "none",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: active ? "var(--on-lime)" : "var(--ink-soft)" }}>
              {MONTHS[d.getMonth()]}
            </span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 900, lineHeight: 1, margin: "4px 0", color: active ? "var(--on-lime)" : "var(--ink)" }}>
              {d.getDate()}
            </span>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: active ? "var(--on-lime)" : "var(--ink-soft)" }}>
              {DAYS[d.getDay()]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
