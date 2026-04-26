"use client";

import { useState, useEffect } from "react";
import Card from "../ui/Card";
import { Loader2 } from "lucide-react";

const SYNC_STEPS = [
  "Connecting to Gmail...",
  "Scanning for SIP emails...",
  "Extracting transaction data with AI...",
  "Processing and deduplicating...",
  "Writing to Google Sheet...",
];

const MARKET_TIPS = [
  "SIP investments smooth out market volatility over time.",
  "Diversification across fund categories reduces portfolio risk.",
  "ELSS funds can save up to ₹46,800 in taxes annually.",
  "Direct plans have lower expense ratios than regular plans.",
  "Long-term equity investments are taxed at just 10% above ₹1 lakh.",
  "Index funds have outperformed 80% of active funds over 10 years.",
  "Review your mutual fund portfolio at least once a quarter.",
  "Debt funds are suitable for short-term goals of 1-3 years.",
  "Step-up SIPs can increase your wealth accumulation by 30-40%.",
  "NAV is calculated at the end of each trading day.",
];

export default function SyncProgress() {
  const [stepIndex, setStepIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(
    Math.floor(Math.random() * MARKET_TIPS.length)
  );

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex((prev) => (prev < SYNC_STEPS.length - 1 ? prev + 1 : prev));
    }, 3000);

    const tipTimer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % MARKET_TIPS.length);
    }, 5000);

    return () => {
      clearInterval(stepTimer);
      clearInterval(tipTimer);
    };
  }, []);

  return (
    <Card padding="spacious" className="fade-in">
      <div className="flex flex-col items-center text-center py-4">
        {/* Spinner */}
        <Loader2 className="w-10 h-10 text-accent spinner mb-6" />

        {/* Current step */}
        <p className="text-text-primary font-medium text-base mb-2">
          {SYNC_STEPS[stepIndex]}
        </p>

        {/* Step indicators */}
        <div className="flex items-center gap-1.5 mb-8">
          {SYNC_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i <= stepIndex
                  ? "w-6 bg-accent"
                  : "w-3 bg-border-secondary"
              }`}
            />
          ))}
        </div>

        {/* Market tip */}
        <div className="border-t border-border-primary pt-6 max-w-md">
          <p className="text-text-tertiary text-xs uppercase tracking-widest mb-2">
            Investment Tip
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            {MARKET_TIPS[tipIndex]}
          </p>
        </div>
      </div>
    </Card>
  );
}
