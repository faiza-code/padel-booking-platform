export default function Button({ variant = "primary", children, style, ...props }) {
  const base = {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: 13,
    letterSpacing: "0.03em",
    textTransform: "uppercase",
    padding: "14px 24px",
    borderRadius: 12,
    border: "none",
    transition: "transform 0.12s ease, opacity 0.12s ease, filter 0.12s ease",
  };

  const variants = {
    primary: {
      background: "var(--lime)",
      color: "var(--on-lime)",
      boxShadow: "0 8px 20px rgba(195, 244, 0, 0.15)",
    },
    accent: {
      background: "var(--lime)",
      color: "var(--on-lime)",
    },
    secondary: {
      // زر "معكوس" (فاتح فوق غامق) - يطابق أزرار "Weekly Hours" بالتصميم
      background: "var(--ink)",
      color: "var(--bg)",
    },
    outline: {
      background: "transparent",
      color: "var(--ink)",
      border: "1.5px solid var(--border-variant)",
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
        opacity: props.disabled ? 0.4 : 1,
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
