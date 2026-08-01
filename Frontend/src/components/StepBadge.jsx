export default function StepBadge({ number }) {
  return (
    <span
      style={{
        width: 32, height: 32, borderRadius: "50%",
        background: "var(--court-deep)", color: "var(--court-line)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, flexShrink: 0,
      }}
    >
      {number}
    </span>
  );
}
