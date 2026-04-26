"use client";

import GoogleIcon from "../icons/GoogleIcon";

export default function GoogleSignInButton({ onClick, loading = false, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center gap-3 bg-text-primary text-bg-primary font-medium text-sm
        px-6 py-3 rounded-[var(--radius-md)] cursor-pointer
        transition-opacity duration-150
        hover:opacity-90 active:opacity-80
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}`}
    >
      {loading ? (
        <svg
          className="spinner w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      ) : (
        <GoogleIcon className="w-5 h-5" />
      )}
      {loading ? "Connecting..." : "Sign in with Google"}
    </button>
  );
}
