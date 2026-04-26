"use client";

import Card from "./Card";

export default function StatsCard({ icon: Icon, label, value, subtitle }) {
  return (
    <Card padding="default" hover>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-tertiary text-xs font-medium uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-2xl font-semibold text-text-primary">{value}</p>
          {subtitle && (
            <p className="text-text-tertiary text-xs mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="p-2 bg-accent-muted rounded-[var(--radius-md)]">
            <Icon className="w-5 h-5 text-accent" />
          </div>
        )}
      </div>
    </Card>
  );
}
