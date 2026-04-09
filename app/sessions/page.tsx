import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "../lib/db";
import NewSessionButton from "./NewSessionButton";

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { game: gameId } = await searchParams;
  if (!gameId) redirect("/dashboard");

  const game = await db.game.findUnique({
    where: { id: gameId, userId: session.user.id },
  });
  if (!game) redirect("/dashboard");

  const sessions = await db.trackSession.findMany({
    where: { gameId },
    include: {
      summary: {
        select: { messageCount: true, actionableCount: true, rawSummary: true },
      },
      _count: { select: { messages: true } },
    },
    orderBy: { startedAt: "desc" },
  });

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontWeight: 700,
              color: "var(--text)",
              textDecoration: "none",
            }}
          >
            📡 StreamSense
          </Link>
          <span style={{ color: "var(--text-dim)", margin: "0 4px" }}>/</span>
          <Link
            href="/dashboard"
            style={{
              color: "var(--text-muted)",
              fontSize: "0.9rem",
              textDecoration: "none",
            }}
          >
            Dashboard
          </Link>
          <span style={{ color: "var(--text-dim)", margin: "0 4px" }}>/</span>
          <span style={{ color: "var(--text)", fontSize: "0.9rem" }}>
            {game.name}
          </span>
        </div>
        <NewSessionButton gameId={gameId} />
      </header>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 32px" }}>
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 8,
            }}
          >
            {game.imageUrl && (
              <img
                src={game.imageUrl}
                alt={game.name}
                style={{
                  width: 36,
                  height: 48,
                  borderRadius: 6,
                  objectFit: "cover",
                }}
              />
            )}
            <h1
              style={{
                fontSize: "1.6rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              {game.name}
            </h1>
          </div>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.88rem",
              margin: 0,
            }}
          >
            {sessions.length} tracking session{sessions.length !== 1 ? "s" : ""}
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>📭</div>
            <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
              No sessions yet. Start tracking a stream to collect feedback.
            </p>
            <NewSessionButton gameId={gameId} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sessions.map((s) => (
              <Link
                key={s.id}
                href={`/sessions/${s.id}`}
                style={{ textDecoration: "none" }}
              >
                <div className="card" style={{ padding: "20px 24px" }}>
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
                        <span style={{ fontWeight: 700 }}>
                          #{s.twitchChannel}
                        </span>
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
                                marginRight: 5,
                              }}
                            />
                          )}
                          {s.status.charAt(0) + s.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <div
                        className="mono"
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {new Date(s.startedAt).toLocaleDateString()} ·{" "}
                        {s._count.messages} messages
                      </div>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 24 }}
                    >
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
                            style={{
                              fontSize: "0.7rem",
                              color: "var(--text-muted)",
                            }}
                          >
                            actionable
                          </div>
                        </div>
                      )}
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
        )}
      </div>
    </div>
  );
}
