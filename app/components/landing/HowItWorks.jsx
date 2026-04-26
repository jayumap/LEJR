"use client";

import { Mail, Cpu, FileSpreadsheet } from "lucide-react";
import Card from "../ui/Card";

const STEPS = [
  {
    icon: Mail,
    step: "01",
    title: "Connect Gmail",
    description:
      "Sign in with Google. We request read-only access to scan for mutual fund emails only.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Extracts Data",
    description:
      "Gemini AI reads each email and extracts fund name, amount, units, NAV, and more.",
  },
  {
    icon: FileSpreadsheet,
    step: "03",
    title: "View on Google Sheets",
    description:
      "All transactions are logged to a Google Sheet on your Drive — organized and ready.",
  },
];

export default function HowItWorks() {
  return (
    <section className="px-6 py-20 max-w-5xl mx-auto">
      <h2 className="text-center text-text-tertiary text-xs font-medium uppercase tracking-widest mb-12">
        How it works
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map(({ icon: Icon, step, title, description }, i) => (
          <Card
            key={step}
            padding="spacious"
            hover
            className={`step-in-${i + 1}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent-muted rounded-[var(--radius-md)]">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <span className="text-text-tertiary text-xs font-mono">{step}</span>
            </div>
            <h3 className="text-text-primary font-semibold text-base mb-2">
              {title}
            </h3>
            <p className="text-text-tertiary text-sm leading-relaxed">
              {description}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
