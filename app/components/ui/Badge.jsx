"use client";

export default function Badge({ children, variant = "neutral", className = "" }) {
  const base = "inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full";

  const variants = {
    success: "bg-accent-muted text-accent",
    warning: "bg-warning-muted text-warning",
    error: "bg-danger-muted text-danger",
    neutral: "bg-bg-tertiary text-text-secondary",
    info: "bg-info-muted text-info",
  };

  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
