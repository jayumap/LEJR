"use client";

export default function Card({
  children,
  className = "",
  hover = false,
  padding = "default",
  ...props
}) {
  const base =
    "bg-bg-secondary border border-border-primary rounded-[var(--radius-lg)]";

  const paddings = {
    none: "",
    compact: "p-4",
    default: "p-6",
    spacious: "p-8",
  };

  const hoverClass = hover
    ? "transition-colors duration-150 hover:border-border-secondary"
    : "";

  return (
    <div
      className={`${base} ${paddings[padding]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
