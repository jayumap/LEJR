"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
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

  if (status === "loading") {
    return <div style={{ padding: "40px" }}>Loading...</div>;
  }

  if (session) {
    return (
      <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
        <h2>✅ Signed in as {session.user.email}</h2>

        <button
          onClick={handleSync}
          disabled={syncing}
          style={{ 
            marginTop: "20px", 
            padding: "12px 24px", 
            fontSize: "16px",
            cursor: syncing ? "not-allowed" : "pointer",
            background: syncing ? "#ccc" : "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "6px"
          }}
        >
          {syncing ? "Scanning your emails..." : "Sync Mutual Fund Emails"}
        </button>

        {result && (
          <div style={{ 
            marginTop: "20px", 
            padding: "16px", 
            background: result.error ? "#fee" : "#efe",
            borderRadius: "6px"
          }}>
            {result.error ? (
              <p>❌ Error: {result.error}</p>
            ) : (
              <>
                <p>✅ Scanned {result.emailsScanned} emails</p>
                <p>💾 Saved {result.transactionsSaved} transactions</p>
                {result.needsReview > 0 && (
                  <p>⚠️ {result.needsReview} need review (low confidence)</p>
                )}
              </>
            )}
          </div>
        )}

        <br />
        <button onClick={() => signOut()} style={{ marginTop: "16px" }}>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>MF Tracker</h1>
      <p>Connect your Gmail to auto-track mutual fund transactions.</p>
      <p style={{ fontSize: "13px", color: "#666" }}>
        We only read emails matching mutual fund keywords. 
        Your data stays in your Google Drive. We never store your emails.
      </p>
      <button
        onClick={() => signIn("google")}
        style={{ marginTop: "16px", padding: "10px 20px", cursor: "pointer" }}
      >
        Sign in with Google
      </button>
    </div>
  );
}