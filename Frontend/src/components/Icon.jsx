export default function Icon({ name, size = 20, style, ...props }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: size, ...style }}
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  );
}
