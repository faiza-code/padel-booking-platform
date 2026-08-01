const MONTHS_AR = ["ينا", "فبر", "مار", "أبر", "ماي", "يون", "يول", "أغس", "سبت", "أكت", "نوف", "ديس"];
const DAYS_AR = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

export default function DateStrip({ value, onChange, days = 14 }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
      {dates.map((d) => {
        const str = toDateStr(d);
        const active = str === value;
        return (
          <button
            key={str}
            onClick={() => onChange(str)}
            style={{
              flexShrink: 0, width: 66, height: 78, borderRadius: 12,
              border: active ? "2px solid var(--court-deep)" : "1px solid var(--border)",
              background: active ? "rgba(204,255,0,0.25)" : "white",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)" }}>{MONTHS_AR[d.getMonth()]}</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>{d.getDate()}</span>
            <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>{DAYS_AR[d.getDay()]}</span>
          </button>
        );
      })}
    </div>
  );
}
