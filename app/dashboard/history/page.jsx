"use client";

import { useState, useEffect } from "react";
import {
  History,
  FileSpreadsheet,
  ExternalLink,
  ArrowUpDown,
  Inbox,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

const MARKET_FACTS = [
  "India is the fastest-growing major mutual fund market globally.",
  "Over 4 crore SIP accounts are active in India today.",
  "Gold ETFs are one of the safest digital gold investments.",
  "Mid-cap funds have historically outperformed large-caps over 10+ years.",
  "The Indian MF industry AUM crossed ₹60 lakh crore in 2024.",
];

function getConfidenceBadge(confidence) {
  if (confidence >= 0.8) return { variant: "success", label: "High" };
  if (confidence >= 0.5) return { variant: "warning", label: "Medium" };
  return { variant: "error", label: "Low" };
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount) {
  if (!amount) return "—";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [sheetUrl, setSheetUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [factIndex] = useState(
    Math.floor(Math.random() * MARKET_FACTS.length)
  );

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch("/api/transactions");
        const data = await res.json();
        setTransactions(data.transactions || []);
        setSheetUrl(data.sheetUrl || null);
      } catch (e) {
        console.error("Failed to fetch transactions:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <History className="w-5 h-5 text-text-tertiary" />
            Transaction History
          </h1>
          <p className="text-text-tertiary text-sm mt-1">
            All SIP transactions extracted from your emails
          </p>
        </div>
        {sheetUrl && (
          <a
            href={sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-accent text-sm font-medium no-underline hover:underline"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Open Sheet
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <Card padding="none">
          <div className="p-6 space-y-4">
            <div className="text-center mb-6">
              <p className="text-text-tertiary text-xs uppercase tracking-widest mb-2">
                Did you know?
              </p>
              <p className="text-text-secondary text-sm">
                {MARKET_FACTS[factIndex]}
              </p>
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-40 flex-1" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty state */}
      {!loading && transactions.length === 0 && (
        <Card padding="spacious">
          <EmptyState
            icon={Inbox}
            title="No transactions yet"
            description="Run a sync from the Dashboard to scan your emails and extract SIP transactions."
          />
        </Card>
      )}

      {/* Transactions table */}
      {!loading && transactions.length > 0 && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-primary">
                  <th className="text-left text-text-tertiary text-xs font-medium uppercase tracking-wider px-4 py-3">
                    Date
                  </th>
                  <th className="text-left text-text-tertiary text-xs font-medium uppercase tracking-wider px-4 py-3">
                    Fund
                  </th>
                  <th className="text-left text-text-tertiary text-xs font-medium uppercase tracking-wider px-4 py-3">
                    Type
                  </th>
                  <th className="text-right text-text-tertiary text-xs font-medium uppercase tracking-wider px-4 py-3">
                    Amount
                  </th>
                  <th className="text-right text-text-tertiary text-xs font-medium uppercase tracking-wider px-4 py-3">
                    Units
                  </th>
                  <th className="text-right text-text-tertiary text-xs font-medium uppercase tracking-wider px-4 py-3">
                    NAV
                  </th>
                  <th className="text-center text-text-tertiary text-xs font-medium uppercase tracking-wider px-4 py-3">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => {
                  const conf = getConfidenceBadge(tx.confidence);
                  return (
                    <tr
                      key={tx.message_id || i}
                      className="border-b border-border-primary last:border-b-0 hover:bg-bg-hover transition-colors duration-100"
                    >
                      <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                        {formatDate(tx.transaction_date)}
                      </td>
                      <td className="px-4 py-3 text-text-primary font-medium max-w-[240px] truncate">
                        {tx.fund_name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            tx.transaction_type === "SIP"
                              ? "success"
                              : tx.transaction_type === "Redemption"
                                ? "error"
                                : "info"
                          }
                        >
                          {tx.transaction_type || "—"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-text-primary font-medium tabular-nums">
                        {formatAmount(tx.amount)}
                      </td>
                      <td className="px-4 py-3 text-right text-text-secondary tabular-nums">
                        {tx.units ? Number(tx.units).toFixed(3) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-text-secondary tabular-nums">
                        {tx.nav ? `₹${Number(tx.nav).toFixed(2)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={conf.variant}>{conf.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-4 py-3 border-t border-border-primary flex items-center justify-between">
            <p className="text-text-tertiary text-xs">
              {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
            </p>
            {sheetUrl && (
              <a
                href={sheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent text-xs font-medium no-underline hover:underline flex items-center gap-1"
              >
                View full sheet
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
