"use client";

interface Props {
  onClose: () => void;
}

export default function UpgradeModal({ onClose }: Props) {
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
        {/* Icon */}
        <div style={{ fontSize: 36, marginBottom: 16 }}>⚡</div>

        {/* Heading */}
        <h2
          style={{
            fontSize: "1.4rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            marginBottom: 8,
          }}
        >
          You've used your free summaries
        </h2>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.88rem",
            lineHeight: 1.65,
            marginBottom: 32,
          }}
        >
          The free plan includes 2 AI summaries to get you started. Upgrade to
          Pro for unlimited summaries, priority processing, and future features.
        </p>

        {/* Comparison */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 32,
          }}
        >
          {/* Free */}
          <div
            style={{
              padding: "20px 16px",
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
              { text: "2 AI summaries", included: true },
              { text: "Unlimited tracking", included: true },
              { text: "Smart filtering", included: true },
              { text: "Unlimited summaries", included: false },
              { text: "Priority processing", included: false },
            ].map((item) => (
              <div
                key={item.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                  fontSize: "0.8rem",
                  color: item.included
                    ? "var(--text-muted)"
                    : "var(--text-dim)",
                }}
              >
                <span
                  style={{
                    color: item.included ? "var(--green)" : "var(--text-dim)",
                    flexShrink: 0,
                  }}
                >
                  {item.included ? "✓" : "✗"}
                </span>
                {item.text}
              </div>
            ))}
          </div>

          {/* Pro */}
          <div
            style={{
              padding: "20px 16px",
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
              { text: "Unlimited summaries", included: true },
              { text: "Unlimited tracking", included: true },
              { text: "Smart filtering", included: true },
              { text: "Priority processing", included: true },
              { text: "Early access features", included: true },
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
          onClick={() => {
            // Replace with your Stripe payment link when ready
            window.open(
              "mailto:hello@streamsenseapp.com?subject=StreamSense Pro",
              "_blank",
            );
            onClose();
          }}
          style={{
            width: "100%",
            padding: "14px 24px",
            background: "var(--accent)",
            color: "#000",
            border: "none",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor: "pointer",
            fontFamily: "'Space Mono', monospace",
            marginBottom: 12,
          }}
        >
          Upgrade to Pro
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
          Pricing coming soon — contact us to get early access
        </p>
      </div>
    </div>
  );
}
