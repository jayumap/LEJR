"use client";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center font-medium transition-colors duration-150 cursor-pointer border rounded-[var(--radius-md)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

  const variants = {
    primary:
      "bg-accent text-bg-primary border-accent hover:bg-accent-hover hover:border-accent-hover",
    secondary:
      "bg-transparent text-text-primary border-border-secondary hover:border-text-tertiary hover:bg-bg-hover",
    danger:
      "bg-transparent text-danger border-danger/30 hover:bg-danger-muted hover:border-danger/50",
    ghost:
      "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-hover",
  };

  const sizes = {
    sm: "text-[13px] px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-6 py-3 gap-2.5",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${
        isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
      } ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg
          className="spinner w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      )}
      {children}
    </button>
  );
}
