export default function Card({ children, style, ...props }) {
  return (
    <div
      {...props}
      style={{
        background: "var(--card)",
        border: "1px solid var(--border-variant)",
        borderRadius: 20,
        padding: 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
