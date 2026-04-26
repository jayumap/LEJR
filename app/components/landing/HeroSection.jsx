"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import GoogleSignInButton from "../ui/GoogleSignInButton";

export default function HeroSection() {
  const [loading, setLoading] = useState(false);

  function handleSignIn() {
    setLoading(true);
    signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <section className="flex flex-col items-center justify-center text-center px-6 pt-32 pb-20">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-muted text-accent text-xs font-medium rounded-full mb-8">
        <Mail className="w-3.5 h-3.5" />
        <span>AI-Powered SIP Tracking</span>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-6xl sm:text-7xl font-bold text-text-primary tracking-tight">
          LEJR
        </h1>
        <span className="w-3 h-3 bg-accent rounded-full mt-2" />
      </div>

      {/* Tagline */}
      <p className="text-xl sm:text-2xl text-text-secondary font-medium max-w-lg mb-3">
        Your SIP transactions.
        <br />
        Tracked automatically.
      </p>

      {/* Description */}
      <p className="text-text-tertiary text-sm max-w-md mb-10 leading-relaxed">
        Connect your Gmail. We scan for mutual fund emails, extract transaction
        data using AI, and log everything on a Google Sheet in your Drive.
      </p>

      {/* CTA */}
      <GoogleSignInButton onClick={handleSignIn} loading={loading} />

      {/* Privacy note */}
      <p className="text-text-tertiary text-xs mt-4 flex items-center gap-1.5">
        Read-only access
        <span className="text-border-secondary">·</span>
        No email storage
        <span className="text-border-secondary">·</span>
        Data stays on your Drive
      </p>
    </section>
  );
}
