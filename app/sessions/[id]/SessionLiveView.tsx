"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  username: string;
  message: string;
  capturedAt: string;
}

interface Summary {
  bugs: string;
  uiUxIssues: string;
  featureRequests: string;
  positives: string;
  rawSummary: string;
  messageCount: number;
  actionableCount: number;
}

interface Props {
  session: {
    id: string;
    twitchChannel: string;
    status: string;
    autoStoppedReason?: string | null;
    startedAt: Date;
    game: { id: string; name: string; imageUrl: string | null };
    summary: Summary | null;
    _count: { messages: number };
  };
}

function parseSummaryField(val: string): string[] {
  try {
    return JSON.parse(val);
  } catch {
    return [];
  }
}

function AutoRefresh({
  sessionId,
  onSummary,
}: {
  sessionId: string;
  onSummary: (summary: Summary) => void;
}) {
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/sessions/${sessionId}/messages`);
      const data = await res.json();
      if (data.summary) {
        onSummary(data.summary);
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [sessionId, onSummary]);

  return (
    <span
      className="mono"
      style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}
    >
      checking...
    </span>
  );
}

export default function SessionLiveView({ session }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState(session.status);
  const [summary, setSummary] = useState<Summary | null>(session.summary);
  const [summarizing, setSummarizing] = useState(false);
  const lastIdRef = useRef<string | undefined>(undefined);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const [limitError, setLimitError] = useState<string | null>(null);
  const [usageInfo, setUsageInfo] = useState<{
    usedToday: number;
    limit: number;
  } | null>(null);

  // Poll for new messages
  useEffect(() => {
    if (status !== "ACTIVE") return;

    async function fetchMessages() {
      const url = `/api/sessions/${session.id}/messages${lastIdRef.current ? `?after=${lastIdRef.current}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();

      if (data.messages?.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newMessages = data.messages.filter(
            (m: Message) => !existingIds.has(m.id),
          );
          return [...prev, ...newMessages];
        });
        lastIdRef.current = data.messages[data.messages.length - 1].id;
      }

      if (data.status !== "ACTIVE") {
        setStatus(data.status);
        if (data.summary) setSummary(data.summary);
      }
    }

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [session.id, status]);

  // Load initial messages for completed sessions
  useEffect(() => {
    if (status !== "ACTIVE") {
      fetch(`/api/sessions/${session.id}/messages`)
        .then((r) => r.json())
        .then((data) => {
          if (data.messages) {
            setMessages((prev) => {
              const existingIds = new Set(prev.map((m) => m.id));
              const newMessages = data.messages.filter(
                (m: Message) => !existingIds.has(m.id),
              );
              return [...prev, ...newMessages];
            });
          }
          if (data.summary) setSummary(data.summary);
        });
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetch("/api/sessions/usage")
      .then((r) => r.json())
      .then((data) => {
        if (!data.isPro) {
          setUsageInfo({ usedToday: data.usedToday, limit: data.limit });
        }
      });
  }, []);

  async function handleStop() {
    setSummarizing(true);
    setLimitError(null);
    // Just stop — don't summarize yet
    const res = await fetch(`/api/sessions/${session.id}`, { method: "PATCH" });
    const data = await res.json();

    if (res.status === 429) {
      setLimitError(data.error);
      setSummarizing(false);
      return;
    }

    setStatus("COMPLETED");
    if (data.usedToday !== undefined) {
      setUsageInfo({ usedToday: data.usedToday, limit: data.limit });
    }
    setSummarizing(false);
  }

  async function handleSummarize() {
    setSummarizing(true);
    setLimitError(null);
    try {
      const res = await fetch(`/api/sessions/${session.id}/summarize`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.status === 429) {
        setLimitError(data.error);
        setSummarizing(false);
        return;
      }

      // Poll until summary appears
      const interval = setInterval(async () => {
        const r = await fetch(`/api/sessions/${session.id}/messages`);
        const d = await r.json();
        if (d.summary) {
          setSummary(d.summary);
          setSummarizing(false);
          clearInterval(interval);
        }
      }, 2000);
    } catch {
      setLimitError("Something went wrong. Try again.");
      setSummarizing(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        "Delete this session and all its messages? This cannot be undone.",
      )
    )
      return;
    setDeleting(true);
    await fetch(`/api/sessions/${session.id}`, { method: "DELETE" });
    router.push(`/sessions?game=${session.game.id}`);
  }

  const bugs = summary ? parseSummaryField(summary.bugs) : [];
  const uiUxIssues = summary ? parseSummaryField(summary.uiUxIssues) : [];
  const featureRequests = summary
    ? parseSummaryField(summary.featureRequests)
    : [];
  const positives = summary ? parseSummaryField(summary.positives) : [];

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link
            href="/"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontWeight: 700,
              color: "var(--text)",
              textDecoration: "none",
            }}
          >
            StreamSense
          </Link>
          <span style={{ color: "var(--text-dim)", margin: "0 4px" }}>/</span>
          <Link
            href="/dashboard"
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              textDecoration: "none",
            }}
          >
            Dashboard
          </Link>
          <span style={{ color: "var(--text-dim)", margin: "0 4px" }}>/</span>
          <Link
            href={`/sessions?game=${session.game.id}`}
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              textDecoration: "none",
            }}
          >
            {session.game.name}
          </Link>
          <span style={{ color: "var(--text-dim)", margin: "0 4px" }}>/</span>
          <span
            className="mono"
            style={{ color: "var(--text)", fontSize: "0.85rem" }}
          >
            #{session.twitchChannel}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Usage indicator */}
          {usageInfo && status === "ACTIVE" && (
            <span
              className="mono"
              style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}
            >
              {usageInfo.limit - usageInfo.usedToday}/{usageInfo.limit}{" "}
              summaries left today
            </span>
          )}

          <span
            className="badge"
            style={{
              background:
                status === "COMPLETED"
                  ? "var(--green-dim)"
                  : status === "ACTIVE"
                    ? "var(--accent-dim)"
                    : "var(--red-dim)",
              color:
                status === "COMPLETED"
                  ? "var(--green)"
                  : status === "ACTIVE"
                    ? "var(--accent)"
                    : "var(--red)",
              border: `1px solid ${status === "COMPLETED" ? "rgba(62,255,160,0.15)" : status === "ACTIVE" ? "var(--accent-border)" : "rgba(255,77,106,0.2)"}`,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {status === "ACTIVE" && (
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
            {status === "ACTIVE"
              ? "Live"
              : status.charAt(0) + status.slice(1).toLowerCase()}
          </span>

          {status === "ACTIVE" && (
            <button
              onClick={handleStop}
              disabled={summarizing}
              style={{
                padding: "8px 18px",
                background: "var(--red)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                fontFamily: "'Space Mono', monospace",
                opacity: summarizing ? 0.6 : 1,
              }}
            >
              {summarizing ? "Stopping..." : "Stop & Summarize"}
            </button>
          )}

          {status === "COMPLETED" && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                padding: "8px 18px",
                background: "transparent",
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: "0.82rem",
                cursor: "pointer",
                fontFamily: "'Space Mono', monospace",
                opacity: deleting ? 0.6 : 1,
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--red)";
                e.currentTarget.style.color = "var(--red)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              {deleting ? "Deleting..." : "Delete Session"}
            </button>
          )}
        </div>
      </header>

      {/* Auto-stop notice */}
      {session.autoStoppedReason && status === "COMPLETED" && (
        <div
          style={{
            padding: "10px 24px",
            background: "var(--accent-dim)",
            borderBottom: "1px solid var(--accent-border)",
            fontSize: "0.82rem",
            color: "var(--accent)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>⚡</span>
          <span>
            Session auto-stopped: <strong>{session.autoStoppedReason}</strong>
          </span>
        </div>
      )}

      {limitError && (
        <div
          style={{
            padding: "12px 24px",
            background: "var(--red-dim)",
            borderBottom: "1px solid rgba(255,77,106,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "0.85rem", color: "var(--red)" }}>
            ⚠ {limitError}
          </span>
          <button
            onClick={() => setLimitError(null)}
            style={{
              background: "none",
              border: "none",
              color: "var(--red)",
              cursor: "pointer",
              fontSize: "1rem",
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>
      )}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns:
            status === "COMPLETED" && summary ? "1fr 380px" : "1fr",
          gap: 0,
          overflow: "hidden",
          height: "100%", //
        }}
      >
        {/* Chat feed */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderRight: summary ? "1px solid var(--border)" : "none",
            overflow: "hidden",
            height: "100%",
          }}
        >
          {/* Sticky header — always visible */}
          <div
            style={{
              padding: "12px 20px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <span
              className="mono"
              style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}
            >
              {messages.length} messages captured
            </span>
            {status === "ACTIVE" && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                }}
              >
                <span
                  className="pulse-dot"
                  style={{
                    display: "inline-block",
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--green)",
                  }}
                />
                collecting
              </span>
            )}
          </div>

          {/* Scrollable messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              minHeight: 0,
            }}
          >
            {messages.length === 0 && status === "ACTIVE" && (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--text-dim)",
                  fontSize: "0.85rem",
                  marginTop: 48,
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 12 }}>⏳</div>
                Waiting for chat messages...
                <br />
                <span style={{ fontSize: "0.75rem" }}>
                  Make sure the worker is running in a separate terminal
                </span>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{ display: "flex", gap: 10, alignItems: "baseline" }}
              >
                <span
                  className="mono"
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--accent)",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {msg.username}
                </span>
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    lineHeight: 1.5,
                  }}
                >
                  {msg.message}
                </span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Summary panel */}
        {status === "COMPLETED" && summary && (
          <div style={{ overflowY: "auto", padding: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <div
                className="mono"
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 8,
                }}
              >
                AI Summary
              </div>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {summary.rawSummary}
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <div
                className="card"
                style={{ padding: "12px 16px", flex: 1, textAlign: "center" }}
              >
                <div
                  className="mono"
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: "var(--accent)",
                  }}
                >
                  {summary.actionableCount}
                </div>
                <div
                  style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}
                >
                  actionable
                </div>
              </div>
              <div
                className="card"
                style={{ padding: "12px 16px", flex: 1, textAlign: "center" }}
              >
                <div
                  className="mono"
                  style={{ fontSize: "1.3rem", fontWeight: 700 }}
                >
                  {summary.messageCount}
                </div>
                <div
                  style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}
                >
                  messages
                </div>
              </div>
            </div>

            {[
              {
                label: "Bugs",
                items: bugs,
                color: "var(--red)",
                bg: "var(--red-dim)",
              },
              {
                label: "UX Issues",
                items: uiUxIssues,
                color: "var(--blue)",
                bg: "var(--blue-dim)",
              },
              {
                label: "Feature Requests",
                items: featureRequests,
                color: "var(--accent)",
                bg: "var(--accent-dim)",
              },
              {
                label: "What Players Loved",
                items: positives,
                color: "var(--green)",
                bg: "var(--green-dim)",
              },
            ].map((section) =>
              section.items.length > 0 ? (
                <div key={section.label} style={{ marginBottom: 20 }}>
                  <div
                    className="badge"
                    style={{
                      background: section.bg,
                      color: section.color,
                      display: "inline-block",
                      marginBottom: 10,
                    }}
                  >
                    {section.label}
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    {section.items.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "flex-start",
                          fontSize: "0.82rem",
                          color: "var(--text-muted)",
                          lineHeight: 1.5,
                        }}
                      >
                        <span
                          style={{
                            color: section.color,
                            flexShrink: 0,
                            marginTop: 1,
                          }}
                        >
                          ›
                        </span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null,
            )}
          </div>
        )}

        {/* Waiting for summary */}
        {status === "COMPLETED" && !summary && (
          <div
            style={{
              padding: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 12,
              color: "var(--text-muted)",
            }}
          >
            <div style={{ fontSize: 24 }}>✅</div>
            <p style={{ fontSize: "0.85rem", textAlign: "center", margin: 0 }}>
              Session complete — ready to summarize.
            </p>
            <p
              style={{
                fontSize: "0.78rem",
                textAlign: "center",
                color: "var(--text-dim)",
                margin: 0,
              }}
            >
              {usageInfo &&
                `${usageInfo.limit - usageInfo.usedToday} of ${usageInfo.limit} summaries remaining today`}
            </p>
            <button
              onClick={handleSummarize}
              disabled={summarizing}
              style={{
                padding: "10px 24px",
                background: "var(--accent)",
                color: "#000",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: "0.88rem",
                cursor: summarizing ? "not-allowed" : "pointer",
                fontFamily: "'Space Mono', monospace",
                opacity: summarizing ? 0.6 : 1,
              }}
            >
              {summarizing ? "Generating..." : "✦ Summarize Session"}
            </button>
            {limitError && (
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--red)",
                  margin: 0,
                  textAlign: "center",
                }}
              >
                {limitError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
