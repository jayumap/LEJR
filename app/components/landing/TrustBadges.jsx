"use client";

import { ShieldCheck, HardDrive, EyeOff } from "lucide-react";

const BADGES = [
  {
    icon: EyeOff,
    label: "Read-only access",
    detail: "We never modify or send emails",
  },
  {
    icon: HardDrive,
    label: "Data on your Drive",
    detail: "Google Sheet lives in your account",
  },
  {
    icon: ShieldCheck,
    label: "No email storage",
    detail: "Emails are processed and discarded",
  },
];

export default function TrustBadges() {
  return (
    <section className="px-6 py-16 border-t border-border-primary">
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
        {BADGES.map(({ icon: Icon, label, detail }) => (
          <div key={label} className="flex items-start gap-3">
            <div className="p-1.5 bg-bg-tertiary rounded-[var(--radius-sm)] mt-0.5">
              <Icon className="w-4 h-4 text-text-tertiary" />
            </div>
            <div>
              <p className="text-text-primary text-sm font-medium">{label}</p>
              <p className="text-text-tertiary text-xs mt-0.5">{detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
