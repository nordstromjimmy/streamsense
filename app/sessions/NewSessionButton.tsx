"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface TwitchChannel {
  broadcaster_login: string;
  display_name: string;
  thumbnail_url: string;
  game_name: string;
  title: string;
}

export default function NewSessionButton({ gameId }: { gameId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [channel, setChannel] = useState("");
  const [allChat, setAllChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<TwitchChannel[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<TwitchChannel | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    if (channel.length < 2 || selected) {
      setResults([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/twitch/channels?q=${encodeURIComponent(channel)}`,
        );
        const data = await res.json();
        setResults(data.results ?? []);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [channel, selected]);

  async function handleStart() {
    const cleaned = (selected?.broadcaster_login ?? channel)
      .trim()
      .toLowerCase()
      .replace(/^#/, "");
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

  function handleSelect(ch: TwitchChannel) {
    setSelected(ch);
    setChannel(ch.display_name);
    setResults([]);
  }

  function handleReset() {
    setShowForm(false);
    setChannel("");
    setAllChat(false);
    setError("");
    setResults([]);
    setSelected(null);
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
        flexDirection: "column",
        gap: 6,
        alignItems: "flex-start",
      }}
    >
      <style>{`
        .nsb-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: nowrap;
        }
        .nsb-input {
          width: 220px;
        }
        .nsb-dropdown {
          position: absolute;
          margin-top: 38px;
          width: 280px;
          background: var(--bg-card);
          border: 1px solid var(--border-bright);
          border-radius: 8px;
          overflow: hidden;
          z-index: 50;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .nsb-allchat-label {
          display: inline;
        }
        @media (max-width: 640px) {
          .nsb-row {
            flex-wrap: wrap;
            gap: 8px;
          }
          .nsb-input {
            width: 160px;
          }
          .nsb-dropdown {
            width: calc(100vw - 40px);
            max-width: 320px;
          }
          .nsb-allchat-label {
            display: none;
          }
        }
      `}</style>

      {/* Button row */}
      <div className="nsb-row">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ position: "relative" }}>
            {!selected && (
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.85rem",
                  pointerEvents: "none",
                }}
              >
                #
              </span>
            )}
            <input
              autoFocus
              type="text"
              placeholder="search live channels..."
              value={channel}
              onChange={(e) => {
                setChannel(e.target.value);
                setSelected(null);
              }}
              onKeyDown={(e) =>
                e.key === "Enter" && results.length === 0 && handleStart()
              }
              className="nsb-input"
              style={{
                padding: selected ? "8px 12px" : "8px 12px 8px 24px",
                background: selected ? "var(--accent-dim)" : "var(--bg-card)",
                border: error
                  ? "1px solid var(--red)"
                  : selected
                    ? "1px solid var(--accent-border)"
                    : "1px solid var(--border-bright)",
                borderRadius: 8,
                color: selected ? "var(--accent)" : "var(--text)",
                fontSize: "0.85rem",
                fontFamily: "'Space Mono', monospace",
                outline: "none",
                transition: "all 0.15s",
              }}
            />
            {searching && (
              <span
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "0.68rem",
                  color: "var(--text-dim)",
                }}
              >
                searching...
              </span>
            )}
          </div>

          {/* Dropdown */}
          {results.length > 0 && (
            <div className="nsb-dropdown">
              {results.map((ch) => (
                <div
                  key={ch.broadcaster_login}
                  onClick={() => handleSelect(ch)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    cursor: "pointer",
                    borderBottom: "1px solid var(--border)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-card-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {ch.thumbnail_url ? (
                    <img
                      src={ch.thumbnail_url}
                      alt={ch.display_name}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "var(--border)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        fontFamily: "'Space Mono', monospace",
                        color: "var(--accent)",
                      }}
                    >
                      #{ch.broadcaster_login}
                    </div>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ch.game_name || "No category"}
                    </div>
                  </div>
                  <div style={{ marginLeft: "auto", flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        color: "var(--green)",
                        fontFamily: "'Space Mono', monospace",
                        background: "var(--green-dim)",
                        padding: "2px 6px",
                        borderRadius: 4,
                      }}
                    >
                      LIVE
                    </span>
                  </div>
                </div>
              ))}
              <div
                style={{
                  padding: "8px 14px",
                  fontSize: "0.7rem",
                  color: "var(--text-dim)",
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                Only showing live channels
              </div>
            </div>
          )}
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
          <span className="nsb-allchat-label">All Chat</span>
        </button>

        {/* Start */}
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
          {loading ? "Starting..." : "Start"}
        </button>

        {/* Cancel */}
        <button
          onClick={handleReset}
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
      </div>

      {/* Hint and error — always below row */}
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
