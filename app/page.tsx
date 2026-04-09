import Link from "next/link";

export default function LandingPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "0 24px" }}>
      {/* Nav */}
      <nav
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "28px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontWeight: 700,
            fontSize: "1rem",
          }}
        >
          📡 StreamSense
        </span>
        <Link
          href="/dashboard"
          style={{
            padding: "8px 20px",
            background: "var(--accent)",
            color: "#000",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: "0.85rem",
            textDecoration: "none",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          Dashboard
        </Link>
      </nav>

      {/* Hero */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "100px 0 80px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          alignItems: "center",
        }}
      >
        <div>
          <div
            className="badge fade-up fade-up-1"
            style={{
              background: "var(--accent-dim)",
              color: "var(--accent)",
              border: "1px solid var(--accent-border)",
              display: "inline-block",
              marginBottom: 24,
            }}
          >
            For indie game devs
          </div>
          <h1
            className="fade-up fade-up-2"
            style={{
              fontSize: "clamp(2.4rem, 5vw, 3.4rem)",
              fontWeight: 800,
              lineHeight: 1.08,
              margin: "0 0 24px",
              letterSpacing: "-0.03em",
            }}
          >
            Your players are
            <br />
            <span style={{ color: "var(--accent)" }}>already giving</span>
            <br />
            you feedback.
          </h1>
          <p
            className="fade-up fade-up-3"
            style={{
              color: "var(--text-muted)",
              fontSize: "1.05rem",
              lineHeight: 1.65,
              maxWidth: 460,
              margin: "0 0 36px",
            }}
          >
            When someone streams your game on Twitch, chat is full of unfiltered
            bug reports, feature ideas, and honest reactions. StreamSense
            captures it and turns it into a clean summary you can actually act
            on.
          </p>
          <div
            className="fade-up fade-up-4"
            style={{ display: "flex", gap: 12 }}
          >
            <Link
              href="/dashboard"
              style={{
                padding: "13px 26px",
                background: "var(--accent)",
                color: "#000",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: "0.9rem",
                textDecoration: "none",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              Start tracking
            </Link>
            <a
              href="#how-it-works"
              style={{
                padding: "13px 26px",
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontWeight: 600,
                fontSize: "0.9rem",
                textDecoration: "none",
              }}
            >
              How it works
            </a>
          </div>
        </div>

        {/* Mock summary preview card */}
        <div className="card fade-up fade-up-3" style={{ padding: 28 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                Cave Explorer Demo
              </div>
              <div
                className="mono"
                style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}
              >
                shroud · 847 msgs · 23 actionable
              </div>
            </div>
            <span
              className="badge"
              style={{
                background: "var(--green-dim)",
                color: "var(--green)",
                border: "1px solid rgba(62,255,160,0.2)",
              }}
            >
              Complete
            </span>
          </div>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              lineHeight: 1.6,
              marginBottom: 20,
              paddingBottom: 20,
              borderBottom: "1px solid var(--border)",
            }}
          >
            Positive reception on art style. Main friction points around torch
            mechanics and unclear objectives.
          </p>
          {[
            {
              label: "Bugs",
              color: "var(--red)",
              bg: "var(--red-dim)",
              items: [
                "Torch randomly extinguishes mid-puzzle",
                "Fall-through collision near level 2 exit",
              ],
            },
            {
              label: "UX Issues",
              color: "var(--blue)",
              bg: "var(--blue-dim)",
              items: [
                "Objective unclear after skipping cutscene",
                "No indicator for climbable walls",
              ],
            },
            {
              label: "Feature Requests",
              color: "var(--accent)",
              bg: "var(--accent-dim)",
              items: ["Controller support", "Minimap for larger caves"],
            },
          ].map((section) => (
            <div key={section.label} style={{ marginBottom: 16 }}>
              <div
                className="badge"
                style={{
                  background: section.bg,
                  color: section.color,
                  display: "inline-block",
                  marginBottom: 8,
                }}
              >
                {section.label}
              </div>
              {section.items.map((item) => (
                <div
                  key={item}
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-muted)",
                    padding: "5px 0",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <span style={{ color: section.color }}>›</span>
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "80px 0",
          borderTop: "1px solid var(--border)",
        }}
      >
        <h2
          style={{
            fontSize: "1.8rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            marginBottom: 48,
          }}
        >
          Three steps to better feedback
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {[
            {
              n: "01",
              title: "Add your game",
              desc: "Register your game and connect it to its Twitch category.",
            },
            {
              n: "02",
              title: "Track a session",
              desc: "Paste any channel URL while they're live. We connect to chat instantly.",
            },
            {
              n: "03",
              title: "Get your digest",
              desc: "Stop anytime. We filter noise and generate a structured AI summary.",
            },
          ].map((step) => (
            <div className="card" key={step.n} style={{ padding: 28 }}>
              <div
                className="mono"
                style={{
                  fontSize: "0.7rem",
                  color: "var(--accent)",
                  marginBottom: 14,
                  fontWeight: 700,
                }}
              >
                {step.n}
              </div>
              <h3
                style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 10 }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
