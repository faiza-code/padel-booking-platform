export default function Button({ variant = "primary", children, style, ...props }) {
  const base = {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: 14,
    padding: "13px 24px",
    borderRadius: 12,
    border: "none",
    transition: "transform 0.12s ease, opacity 0.12s ease",
  };

  const variants = {
    primary: {
      background: "var(--court-deep)",
      color: "var(--court-line)",
      boxShadow: "0 4px 14px rgba(80, 102, 0, 0.18)",
    },
    accent: {
      background: "var(--ball-lime)",
      color: "var(--ball-lime-dark)",
    },
    secondary: {
      background: "var(--court-deep)",
      color: "var(--court-line)",
    },
    outline: {
      background: "transparent",
      color: "var(--ink)",
      border: "1.5px solid var(--border)",
    },
    ghost: {
      background: "transparent",
      color: "var(--ink-soft)",
    },
    danger: {
      background: "transparent",
      color: "var(--clay)",
      border: "1.5px solid var(--clay)",
    },
  };

  return (
    <button
      {...props}
      disabled={props.disabled}
      style={{
        ...base,
        ...variants[variant],
        opacity: props.disabled ? 0.5 : 1,
        cursor: props.disabled ? "not-allowed" : "pointer",
        ...style,
      }}
      onMouseDown={(e) => { if (!props.disabled) e.currentTarget.style.transform = "scale(0.97)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {children}
    </button>
  );
}
