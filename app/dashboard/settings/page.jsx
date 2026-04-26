"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Settings,
  User,
  FileSpreadsheet,
  ExternalLink,
  LogOut,
  Shield,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [sheetUrl, setSheetUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSheetInfo() {
      try {
        const res = await fetch("/api/transactions");
        const data = await res.json();
        setSheetUrl(data.sheetUrl || null);
      } catch (e) {
        console.error("Failed to fetch sheet info:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchSheetInfo();
  }, []);

  return (
    <div className="space-y-6 fade-in max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-text-primary flex items-center gap-2">
          <Settings className="w-5 h-5 text-text-tertiary" />
          Settings
        </h1>
        <p className="text-text-tertiary text-sm mt-1">
          Account information and preferences
        </p>
      </div>

      {/* Account Info */}
      <Card padding="default">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-text-tertiary" />
          <h2 className="text-text-primary text-sm font-semibold">Account</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border-primary">
            <span className="text-text-tertiary text-sm">Name</span>
            <span className="text-text-primary text-sm font-medium">
              {session?.user?.name || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border-primary">
            <span className="text-text-tertiary text-sm">Email</span>
            <span className="text-text-primary text-sm font-medium">
              {session?.user?.email || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-text-tertiary text-sm">Provider</span>
            <span className="text-text-primary text-sm font-medium">
              Google
            </span>
          </div>
        </div>
      </Card>

      {/* Google Sheet */}
      <Card padding="default">
        <div className="flex items-center gap-2 mb-4">
          <FileSpreadsheet className="w-4 h-4 text-text-tertiary" />
          <h2 className="text-text-primary text-sm font-semibold">
            Google Sheet
          </h2>
        </div>
        {loading ? (
          <p className="text-text-tertiary text-sm">Loading...</p>
        ) : sheetUrl ? (
          <div className="flex items-center justify-between">
            <p className="text-text-secondary text-sm">
              Your transaction sheet is active on Google Drive
            </p>
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-accent text-sm font-medium no-underline hover:underline"
            >
              Open Sheet
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <p className="text-text-tertiary text-sm">
            No sheet created yet. Run a sync from the Dashboard to create one.
          </p>
        )}
      </Card>

      {/* Permissions */}
      <Card padding="default">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-text-tertiary" />
          <h2 className="text-text-primary text-sm font-semibold">
            Permissions
          </h2>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-text-secondary text-sm">Gmail</span>
            <span className="text-text-tertiary text-xs">Read-only</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-text-secondary text-sm">Google Sheets</span>
            <span className="text-text-tertiary text-xs">Read & Write</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-text-secondary text-sm">Google Drive</span>
            <span className="text-text-tertiary text-xs">
              Files created by LEJR only
            </span>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card
        padding="default"
        className="border-danger/20"
      >
        <div className="flex items-center gap-2 mb-4">
          <LogOut className="w-4 h-4 text-danger" />
          <h2 className="text-danger text-sm font-semibold">Sign Out</h2>
        </div>
        <p className="text-text-tertiary text-sm mb-4">
          Sign out of your account. Your data will remain in your Google Sheet.
        </p>
        <Button
          variant="danger"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="w-4 h-4" />
          Sign out of LEJR
        </Button>
      </Card>
    </div>
  );
}
