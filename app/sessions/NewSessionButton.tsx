"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewSessionButton({ gameId }: { gameId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [channel, setChannel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleStart() {
    const cleaned = channel.trim().toLowerCase().replace(/^#/, "");
    if (!cleaned) {
      setError("Enter a channel name.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, twitchChannel: cleaned }),
      });
      if (!res.ok) throw new Error();
      const { session } = await res.json();
      router.push(`/sessions/${session.id}`);
    } catch {
      setError("Failed to start session. Try again.");
      setLoading(false);
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        style={{
          padding: "8px 18px",
          background: "var(--accent)",
          color: "#000",
          border: "none",
          borderRadius: 8,
          fontWeight: 700,
          fontSize: "0.82rem",
          cursor: "pointer",
          fontFamily: "'Space Mono', monospace",
        }}
      >
        New Session
      </button>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      <div style={{ position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.85rem",
          }}
        >
          #
        </span>
        <input
          autoFocus
          type="text"
          placeholder="channelname"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleStart()}
          style={{
            padding: "8px 12px 8px 24px",
            background: "var(--bg-card)",
            border: error
              ? "1px solid var(--red)"
              : "1px solid var(--border-bright)",
            borderRadius: 8,
            color: "var(--text)",
            fontSize: "0.85rem",
            fontFamily: "'Space Mono', monospace",
            outline: "none",
            width: 180,
          }}
        />
      </div>
      <button
        onClick={handleStart}
        disabled={loading}
        style={{
          padding: "8px 16px",
          background: "var(--accent)",
          color: "#000",
          border: "none",
          borderRadius: 8,
          fontWeight: 700,
          fontSize: "0.82rem",
          cursor: "pointer",
          fontFamily: "'Space Mono', monospace",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Starting..." : "Start "}
      </button>
      <button
        onClick={() => {
          setShowForm(false);
          setChannel("");
          setError("");
        }}
        style={{
          padding: "8px 12px",
          background: "transparent",
          border: "1px solid var(--border)",
          borderRadius: 8,
          color: "var(--text-muted)",
          cursor: "pointer",
          fontSize: "0.82rem",
        }}
      >
        Cancel
      </button>
      {error && (
        <span style={{ fontSize: "0.78rem", color: "var(--red)" }}>
          {error}
        </span>
      )}
    </div>
  );
}
