"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  FileSpreadsheet,
  Mail,
  Clock,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import StatsCard from "../components/ui/StatsCard";
import SyncProgress from "../components/dashboard/SyncProgress";
import SyncResults from "../components/dashboard/SyncResults";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSync() {
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch("/api/sync/trigger", { method: "POST" });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setSyncing(false);
    }
  }

  const firstName = session?.user?.name?.split(" ")[0] || "there";
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-8 fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          Welcome back, {firstName}
        </h1>
        <p className="text-text-tertiary text-sm mt-1">{today}</p>
      </div>

      {/* Sync Section */}
      {syncing ? (
        <SyncProgress />
      ) : result ? (
        <SyncResults result={result} onDismiss={() => setResult(null)} />
      ) : (
        <Card padding="spacious" hover>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent-muted rounded-[var(--radius-md)]">
                <Mail className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-text-primary font-semibold text-base">
                  Scan Your Emails
                </h2>
                <p className="text-text-tertiary text-sm">
                  Find and extract SIP transactions from your Gmail
                </p>
              </div>
            </div>
            <Button variant="primary" size="md" onClick={handleSync}>
              <Mail className="w-4 h-4" />
              Sync Now
            </Button>
          </div>
        </Card>
      )}

      {/* Quick Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatsCard
          icon={Mail}
          label="Last Sync"
          value={result?.emailsScanned ? `${result.emailsScanned} emails` : "—"}
          subtitle={
            result?.transactionsSaved
              ? `${result.transactionsSaved} transactions found`
              : "Run a sync to see results"
          }
        />
        <StatsCard
          icon={Clock}
          label="Status"
          value={syncing ? "Syncing..." : result ? "Complete" : "Ready"}
          subtitle={syncing ? "Please wait while we scan" : "Click sync to begin"}
        />
      </div>

      {/* Google Sheet Link */}
      {result?.sheetUrl && (
        <Card padding="default" hover>
          <a
            href={result.sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between no-underline group"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-accent-muted rounded-[var(--radius-md)]">
                <FileSpreadsheet className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-text-primary font-medium text-sm group-hover:text-accent transition-colors duration-150">
                  Your Google Sheet
                </p>
                <p className="text-text-tertiary text-xs">
                  View all transactions organized on your Drive
                </p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-text-tertiary group-hover:text-accent transition-colors duration-150" />
          </a>
        </Card>
      )}

      {/* Bottom Tips */}
      <div className="border-t border-border-primary pt-6">
        <p className="text-text-tertiary text-xs text-center">
          Tip: Run sync periodically to catch new SIP confirmation emails.
          Your data is always written to the Google Sheet on your Drive.
        </p>
      </div>
    </div>
  );
}
