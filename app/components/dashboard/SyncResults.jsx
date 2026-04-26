"use client";

import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import {
  CheckCircle2,
  Mail,
  FileSpreadsheet,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

export default function SyncResults({ result, onDismiss }) {
  if (!result) return null;

  const isError = !!result.error;

  return (
    <Card padding="spacious" className="fade-in">
      {isError ? (
        /* Error state */
        <div className="flex flex-col items-center text-center py-4">
          <div className="p-3 bg-danger-muted rounded-full mb-4">
            <AlertTriangle className="w-6 h-6 text-danger" />
          </div>
          <h3 className="text-text-primary font-semibold text-lg mb-1">
            Sync Failed
          </h3>
          <p className="text-text-tertiary text-sm mb-6 max-w-sm">
            {result.error}
          </p>
          <Button variant="secondary" size="sm" onClick={onDismiss}>
            Dismiss
          </Button>
        </div>
      ) : (
        /* Success state */
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-accent-muted rounded-full">
              <CheckCircle2 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-text-primary font-semibold text-base">
                Sync Complete
              </h3>
              <p className="text-text-tertiary text-xs">
                All transactions have been processed
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-bg-tertiary rounded-[var(--radius-md)] p-4 text-center">
              <Mail className="w-4 h-4 text-text-tertiary mx-auto mb-1.5" />
              <p className="text-xl font-semibold text-text-primary">
                {result.emailsScanned}
              </p>
              <p className="text-text-tertiary text-xs">Emails scanned</p>
            </div>
            <div className="bg-bg-tertiary rounded-[var(--radius-md)] p-4 text-center">
              <FileSpreadsheet className="w-4 h-4 text-accent mx-auto mb-1.5" />
              <p className="text-xl font-semibold text-text-primary">
                {result.transactionsSaved}
              </p>
              <p className="text-text-tertiary text-xs">Saved</p>
            </div>
            <div className="bg-bg-tertiary rounded-[var(--radius-md)] p-4 text-center">
              <AlertTriangle className="w-4 h-4 text-warning mx-auto mb-1.5" />
              <p className="text-xl font-semibold text-text-primary">
                {result.needsReview}
              </p>
              <p className="text-text-tertiary text-xs">Needs review</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {result.sheetUrl && (
              <a
                href={result.sheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-accent text-bg-primary font-medium text-sm px-4 py-2 rounded-[var(--radius-md)] no-underline transition-colors duration-150 hover:bg-accent-hover"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Open Google Sheet
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <Button variant="ghost" size="md" onClick={onDismiss}>
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
