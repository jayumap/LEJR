"use client";

import { useState } from "react";
import Button from "../ui/Button";
import { Mail } from "lucide-react";

export default function SyncButton({ onSync }) {
  return (
    <Button variant="primary" size="lg" onClick={onSync}>
      <Mail className="w-5 h-5" />
      Sync Mutual Fund Emails
    </Button>
  );
}
