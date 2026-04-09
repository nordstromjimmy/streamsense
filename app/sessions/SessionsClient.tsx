"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Session {
  id: string;
  twitchChannel: string;
  status: string;
  startedAt: Date;
  _count: { messages: number };
  summary: {
    messageCount: number;
    actionableCount: number;
    rawSummary: string;
  } | null;
}

export default function SessionsClient({ sessions }: { sessions: Session[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(e: React.MouseEvent, sessionId: string) {
    e.preventDefault();
    if (
      !confirm(
        "Delete this session and all its messages? This cannot be undone.",
      )
    )
      return;
    setDeletingId(sessionId);
    await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {sessions.map((s) => (
        <Link
          key={s.id}
          href={`/sessions/${s.id}`}
          style={{ textDecoration: "none" }}
        >
          <div
            className="card"
            style={{
              padding: "20px 24px",
              opacity: deletingId === s.id ? 0.4 : 1,
              transition: "opacity 0.2s",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: s.summary ? 12 : 0,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontWeight: 700 }}>#{s.twitchChannel}</span>
                  <span
                    className="badge"
                    style={{
                      background:
                        s.status === "COMPLETED"
                          ? "var(--green-dim)"
                          : s.status === "ACTIVE"
                            ? "var(--accent-dim)"
                            : "var(--red-dim)",
                      color:
                        s.status === "COMPLETED"
                          ? "var(--green)"
                          : s.status === "ACTIVE"
                            ? "var(--accent)"
                            : "var(--red)",
                      border: `1px solid ${s.status === "COMPLETED" ? "rgba(62,255,160,0.15)" : s.status === "ACTIVE" ? "var(--accent-border)" : "rgba(255,77,106,0.2)"}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    {s.status === "ACTIVE" && (
                      <span
                        className="pulse-dot"
                        style={{
                          display: "inline-block",
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "var(--accent)",
                        }}
                      />
                    )}
                    {s.status.charAt(0) + s.status.slice(1).toLowerCase()}
                  </span>
                </div>
                <div
                  className="mono"
                  style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}
                >
                  {new Date(s.startedAt).toLocaleDateString()} ·{" "}
                  {s._count.messages} messages
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {s.summary && (
                  <div style={{ textAlign: "right" }}>
                    <div
                      className="mono"
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "var(--accent)",
                      }}
                    >
                      {s.summary.actionableCount}
                    </div>
                    <div
                      style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}
                    >
                      actionable
                    </div>
                  </div>
                )}
                <button
                  onClick={(e) => handleDelete(e, s.id)}
                  disabled={deletingId === s.id}
                  style={{
                    padding: "6px 12px",
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    color: "var(--text-dim)",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontFamily: "'Space Mono', monospace",
                    transition: "border-color 0.2s, color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--red)";
                    e.currentTarget.style.color = "var(--red)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--text-dim)";
                  }}
                >
                  {deletingId === s.id ? "Deleting..." : "Delete"}
                </button>
                <span style={{ color: "var(--text-dim)" }}>›</span>
              </div>
            </div>
            {s.summary?.rawSummary && (
              <p
                style={{
                  margin: 0,
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                  lineHeight: 1.6,
                  paddingTop: 12,
                  borderTop: "1px solid var(--border)",
                }}
              >
                {s.summary.rawSummary}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
