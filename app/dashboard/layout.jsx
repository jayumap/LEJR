"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "../components/Navbar";

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  // Loading state with market fact
  if (status === "loading") {
    return <DashboardLoading />;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}

/* ----------------------------------------
   Loading screen with market facts
   ---------------------------------------- */

const MARKET_FACTS = [
  "The first mutual fund was established in the Netherlands in 1774.",
  "SIP investments in India crossed ₹18,000 crore monthly in 2024.",
  "Warren Buffett recommends index funds for most investors.",
  "The BSE Sensex was first compiled in 1986 with a base value of 100.",
  "Rupee cost averaging through SIPs can reduce the impact of volatility.",
  "India has over 44 Asset Management Companies managing mutual funds.",
  "The power of compounding is often called the eighth wonder of the world.",
  "ELSS funds offer tax benefits under Section 80C with a 3-year lock-in.",
  "The NSE Nifty 50 has delivered ~12% CAGR since inception.",
  "Systematic investing removes the need to time the market.",
];

function DashboardLoading() {
  const fact = MARKET_FACTS[Math.floor(Math.random() * MARKET_FACTS.length)];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="flex items-center gap-2 mb-8">
        <span className="text-2xl font-bold text-text-primary tracking-tight">
          LEJR
        </span>
        <span className="w-2 h-2 bg-accent rounded-full spinner" />
      </div>

      <div className="max-w-sm text-center">
        <p className="text-text-tertiary text-xs uppercase tracking-widest mb-3">
          Did you know?
        </p>
        <p className="text-text-secondary text-sm leading-relaxed">{fact}</p>
      </div>
    </div>
  );
}
