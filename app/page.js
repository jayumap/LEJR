"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import HeroSection from "./components/landing/HeroSection";
import HowItWorks from "./components/landing/HowItWorks";
import TrustBadges from "./components/landing/TrustBadges";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (session) {
      router.replace("/dashboard");
    }
  }, [session, router]);

  // Loading state
  if (status === "loading" || session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-text-primary tracking-tight">
            LEJR
          </span>
          <span className="w-2 h-2 bg-accent rounded-full spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <HeroSection />

      {/* How it Works */}
      <HowItWorks />

      {/* Trust Section */}
      <TrustBadges />

      {/* Footer */}
      <footer className="border-t border-border-primary px-6 py-8 text-center">
        <p className="text-text-tertiary text-xs">
          LEJR — Built for tracking SIP investments.
          <br />
          Your emails are never stored. All data stays in your Google Drive.
        </p>
      </footer>
    </div>
  );
}