"use client";
import { useState, useEffect, useRef } from "react";

interface TwitchGame {
  id: string;
  name: string;
  box_art_url: string;
}

interface Props {
  onClose: () => void;
  onAdded: () => void;
}

export default function AddGameModal({ onClose, onAdded }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TwitchGame[]>([]);
  const [selected, setSelected] = useState<TwitchGame | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/games/search?q=${encodeURIComponent(query)}`,
        );
        const data = await res.json();
        setResults(data.results ?? []);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [query]);

  async function handleSave() {
    const name = selected?.name ?? query.trim();
    if (!name) {
      setError("Enter a game name.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          twitchGameId: selected?.id ?? null,
          imageUrl: selected
            ? selected.box_art_url
                .replace("{width}", "60")
                .replace("{height}", "80")
            : null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      onAdded();
      onClose();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 500,
          padding: 32,
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontWeight: 800, fontSize: "1.2rem", margin: 0 }}>
            Add a game
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "1.2rem",
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        {/* Search input */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <input
            autoFocus
            type="text"
            placeholder="Search for your game on Twitch..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "var(--bg)",
              border: "1px solid var(--border-bright)",
              borderRadius: 8,
              color: "var(--text)",
              fontSize: "0.9rem",
              fontFamily: "'Syne', sans-serif",
              outline: "none",
            }}
          />
          {loading && (
            <span
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
                fontSize: "0.75rem",
              }}
            >
              searching...
            </span>
          )}
        </div>

        {/* Search results */}
        {results.length > 0 && !selected && (
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 8,
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            {results.map((game) => (
              <div
                key={game.id}
                onClick={() => {
                  setSelected(game);
                  setQuery(game.name);
                  setResults([]);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
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
                <img
                  src={game.box_art_url
                    .replace("{width}", "30")
                    .replace("{height}", "40")}
                  alt={game.name}
                  style={{
                    width: 30,
                    height: 40,
                    borderRadius: 4,
                    objectFit: "cover",
                  }}
                />
                <span style={{ fontSize: "0.88rem" }}>{game.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Selected game preview */}
        {selected && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              background: "var(--accent-dim)",
              border: "1px solid var(--accent-border)",
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <img
              src={selected.box_art_url
                .replace("{width}", "30")
                .replace("{height}", "40")}
              alt={selected.name}
              style={{
                width: 30,
                height: 40,
                borderRadius: 4,
                objectFit: "cover",
              }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>
                {selected.name}
              </div>
              <div
                className="mono"
                style={{ fontSize: "0.68rem", color: "var(--accent)" }}
              >
                Found on Twitch ✓
              </div>
            </div>
            <button
              onClick={() => {
                setSelected(null);
                setQuery("");
              }}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Not on Twitch hint */}
        {query.length > 1 && results.length === 0 && !loading && !selected && (
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--text-muted)",
              marginBottom: 16,
            }}
          >
            No Twitch match found — we'll still track it by name.
          </p>
        )}

        {error && (
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--red)",
              marginBottom: 12,
            }}
          >
            {error}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || (!selected && query.trim().length < 2)}
            style={{
              padding: "10px 20px",
              background:
                saving || (!selected && query.trim().length < 2)
                  ? "var(--border)"
                  : "var(--accent)",
              color:
                saving || (!selected && query.trim().length < 2)
                  ? "var(--text-muted)"
                  : "#000",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor:
                saving || (!selected && query.trim().length < 2)
                  ? "not-allowed"
                  : "pointer",
              fontFamily: "'Space Mono', monospace",
              transition: "background 0.2s",
            }}
          >
            {saving ? "Saving..." : "Add Game"}
          </button>
        </div>
      </div>
    </div>
  );
}
