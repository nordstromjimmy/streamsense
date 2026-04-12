"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewSessionButton({ gameId }: { gameId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [channel, setChannel] = useState("");
  const [allChat, setAllChat] = useState(false);
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
        body: JSON.stringify({ gameId, twitchChannel: cleaned, allChat }),
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
        + New Session
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
      {/* Channel input */}
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

      {/* All Chat toggle */}
      <button
        onClick={() => setAllChat((v) => !v)}
        title="All Chat captures every message without filtering. Best for smaller streams."
        style={{
          padding: "8px 12px",
          background: allChat ? "var(--accent-dim)" : "transparent",
          border: allChat
            ? "1px solid var(--accent-border)"
            : "1px solid var(--border)",
          borderRadius: 8,
          color: allChat ? "var(--accent)" : "var(--text-muted)",
          cursor: "pointer",
          fontSize: "0.78rem",
          fontFamily: "'Space Mono', monospace",
          fontWeight: allChat ? 700 : 400,
          transition: "all 0.15s",
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: allChat ? "var(--accent)" : "var(--border-bright)",
            display: "inline-block",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
        />
        All Chat
      </button>

      {/* Start button */}
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
        {loading ? "Starting..." : "Start →"}
      </button>

      {/* Cancel */}
      <button
        onClick={() => {
          setShowForm(false);
          setChannel("");
          setAllChat(false);
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

      {/* Hint text when All Chat is on */}
      {allChat && (
        <span
          style={{
            fontSize: "0.72rem",
            color: "var(--text-muted)",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          All messages captured — best for small streams
        </span>
      )}

      {error && (
        <span style={{ fontSize: "0.78rem", color: "var(--red)" }}>
          {error}
        </span>
      )}
    </div>
  );
}
