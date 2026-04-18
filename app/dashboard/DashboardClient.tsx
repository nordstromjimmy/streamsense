"use client";
import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import AddGameModal from "../components/AddGameModal";

interface Game {
  id: string;
  name: string;
  imageUrl: string | null;
  _count: { trackSessions: number };
  trackSessions: { startedAt: Date }[];
}

interface RecentSession {
  id: string;
  twitchChannel: string;
  status: string;
  startedAt: Date;
  game: { name: string };
}

interface Props {
  user: { name?: string | null; image?: string | null };
  games: Game[];
  recentSessions: RecentSession[];
  totalMessages: number;
  totalActionable: number;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function DashboardClient({
  user,
  games,
  recentSessions,
  totalMessages,
  totalActionable,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [deletingGameId, setDeletingGameId] = useState<string | null>(null);
  const router = useRouter();

  async function handleDeleteGame(e: React.MouseEvent, gameId: string) {
    e.preventDefault(); // prevent Link navigation
    if (
      !confirm("Delete this game and all its sessions? This cannot be undone.")
    )
      return;
    setDeletingGameId(gameId);
    await fetch(`/api/games/${gameId}`, { method: "DELETE" });
    setDeletingGameId(null);
    router.refresh();
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {showModal && (
        <AddGameModal
          onClose={() => setShowModal(false)}
          onAdded={() => router.refresh()}
        />
      )}

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
          <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Dashboard
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {user.image && (
            <img
              src={user.image}
              alt={user.name ?? ""}
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: "2px solid var(--border-bright)",
              }}
            />
          )}
          <span
            className="mono"
            style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}
          >
            {user.name}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              padding: "7px 14px",
              background: "transparent",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: "0.78rem",
              cursor: "pointer",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            Sign out
          </button>
          <button
            onClick={() => setShowModal(true)}
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
            Add Game
          </button>
        </div>
      </header>
      {process.env.NODE_ENV === "development" && (
        <button
          onClick={async () => {
            const res = await fetch("/api/dev/toggle-pro", { method: "POST" });
            const data = await res.json();
            alert(`Pro: ${data.isPro}`);
            router.refresh();
          }}
          style={{
            padding: "7px 14px",
            background: "transparent",
            color: "var(--purple)",
            border: "1px dashed var(--purple)",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: "0.75rem",
            cursor: "pointer",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          DEV: Toggle Pro
        </button>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px" }}>
        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {[
            { label: "Games tracked", value: games.length.toString() },
            {
              label: "Total sessions",
              value: recentSessions.length.toString(),
            },
            {
              label: "Messages captured",
              value: totalMessages.toLocaleString(),
            },
            { label: "Actionable insights", value: totalActionable.toString() },
          ].map((stat) => (
            <div
              className="card"
              key={stat.label}
              style={{ padding: "20px 24px" }}
            >
              <div
                className="mono"
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: "var(--accent)",
                  letterSpacing: "-0.04em",
                  marginBottom: 4,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Games */}
        <div
          className="mono"
          style={{
            fontSize: "0.7rem",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 16,
          }}
        >
          Your Games
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 48,
          }}
        >
          {games.length === 0 && (
            <div
              className="card"
              style={{
                padding: 32,
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "0.88rem",
              }}
            >
              No games yet. Add your first game to start tracking feedback.
            </div>
          )}
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/sessions?game=${game.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                className="card"
                style={{
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: deletingGameId === game.id ? 0.4 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 42,
                      height: 56,
                      borderRadius: 6,
                      background: "var(--border)",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {game.imageUrl ? (
                      <img
                        src={game.imageUrl}
                        alt={game.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                        }}
                      >
                        🎮
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>
                      {game.name}
                    </div>
                    <div
                      className="mono"
                      style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}
                    >
                      {game._count.trackSessions} session
                      {game._count.trackSessions !== 1 ? "s" : ""}
                      {game.trackSessions[0]
                        ? ` · last tracked ${timeAgo(game.trackSessions[0].startedAt)}`
                        : " · never tracked"}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <button
                    onClick={(e) => handleDeleteGame(e, game.id)}
                    disabled={deletingGameId === game.id}
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
                    {deletingGameId === game.id ? "Deleting..." : "Delete"}
                  </button>
                  <span style={{ color: "var(--text-dim)" }}>›</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent sessions */}
        {recentSessions.length > 0 && (
          <>
            <div
              className="mono"
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 16,
              }}
            >
              Recent Sessions
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentSessions.map((s) => (
                <Link
                  key={s.id}
                  href={`/sessions/${s.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="card"
                    style={{
                      padding: "14px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 16 }}
                    >
                      <span
                        className="mono"
                        style={{
                          color: "var(--accent)",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                        }}
                      >
                        #{s.twitchChannel}
                      </span>
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.82rem",
                        }}
                      >
                        {s.game.name}
                      </span>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 20 }}
                    >
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
                        {s.status.charAt(0) + s.status.slice(1).toLowerCase()}
                      </span>
                      <span
                        className="mono"
                        style={{ color: "var(--text-dim)", fontSize: "0.7rem" }}
                      >
                        {timeAgo(s.startedAt)}
                      </span>
                      <span style={{ color: "var(--text-dim)" }}>›</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
