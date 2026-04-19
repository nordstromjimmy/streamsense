"use client";
import { useState } from "react";

interface Props {
  onClose: () => void;
}

export default function UpgradeModal({ onClose }: Props) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    const priceId =
      billing === "monthly"
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY;

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.8)",
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
          maxWidth: 480,
          padding: 40,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 16 }}>⚡</div>
        <h2
          style={{
            fontSize: "1.4rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            marginBottom: 8,
          }}
        >
          Upgrade to StreamSense Pro
        </h2>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.88rem",
            lineHeight: 1.65,
            marginBottom: 28,
          }}
        >
          Unlimited AI summaries for every stream of your game.
        </p>

        {/* Billing toggle */}
        <div
          style={{
            display: "flex",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 4,
            marginBottom: 28,
            gap: 4,
          }}
        >
          {(["monthly", "yearly"] as const).map((plan) => (
            <button
              key={plan}
              onClick={() => setBilling(plan)}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 7,
                border: "none",
                cursor: "pointer",
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.8rem",
                fontWeight: 700,
                transition: "all 0.15s",
                background: billing === plan ? "var(--accent)" : "transparent",
                color: billing === plan ? "#000" : "var(--text-muted)",
              }}
            >
              {plan === "monthly" ? "$9 / month" : "$79 / year"}
              {plan === "yearly" && (
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: "0.65rem",
                    background: "rgba(0,0,0,0.2)",
                    padding: "2px 5px",
                    borderRadius: 3,
                  }}
                >
                  save 27%
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Feature comparison */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              padding: "16px",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 10,
            }}
          >
            <div
              className="mono"
              style={{
                fontSize: "0.65rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 12,
              }}
            >
              Free
            </div>
            {[
              { text: "2 AI summaries", ok: true },
              { text: "Limited sessions", ok: true },
              { text: "Smart filtering", ok: true },
              { text: "Basic features", ok: true },
            ].map((item) => (
              <div
                key={item.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                  fontSize: "0.8rem",
                  color: item.ok ? "var(--text-muted)" : "var(--text-dim)",
                }}
              >
                <span
                  style={{
                    color: item.ok ? "var(--green)" : "var(--text-dim)",
                    flexShrink: 0,
                  }}
                >
                  {item.ok ? "✓" : "✗"}
                </span>
                {item.text}
              </div>
            ))}
          </div>
          <div
            style={{
              padding: "16px",
              background: "var(--accent-dim)",
              border: "1px solid var(--accent-border)",
              borderRadius: 10,
            }}
          >
            <div
              className="mono"
              style={{
                fontSize: "0.65rem",
                color: "var(--accent)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 12,
              }}
            >
              Pro
            </div>
            {[
              { text: "Unlimited summaries", ok: true },
              { text: "Unlimited Sessions", ok: true },
              { text: "Smart filtering", ok: true },
              { text: "Priority support", ok: true },
              { text: "Access to new features", ok: true },
            ].map((item) => (
              <div
                key={item.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                }}
              >
                <span style={{ color: "var(--accent)", flexShrink: 0 }}>✓</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleUpgrade}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px 24px",
            background: "var(--accent)",
            color: "#000",
            border: "none",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'Space Mono', monospace",
            marginBottom: 12,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading
            ? "Redirecting to Stripe..."
            : `Upgrade — ${billing === "monthly" ? "$9/mo" : "$79/yr"}`}
        </button>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "10px 24px",
            background: "transparent",
            color: "var(--text-muted)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          Maybe later
        </button>
        <p
          className="mono"
          style={{
            fontSize: "0.68rem",
            color: "var(--text-dim)",
            marginTop: 16,
          }}
        >
          Secure payment via Stripe · Cancel anytime
        </p>
      </div>
    </div>
  );
}
