export default function Card({ children, style, ...props }) {
  return (
    <div
      {...props}
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        boxShadow: "0 4px 20px rgba(10,25,47,0.05)",
        padding: 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
