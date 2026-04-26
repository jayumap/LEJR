"use client";

export default function Skeleton({ className = "", variant = "rect" }) {
  const base = "skeleton";

  if (variant === "circle") {
    return <div className={`${base} rounded-full ${className}`} />;
  }

  return <div className={`${base} ${className}`} />;
}
