import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StreamSense — Twitch Chat Feedback for Indie Game Developers",
  description:
    "Turn Twitch chat into actionable game feedback. StreamSense captures live chat from streams of your game and uses AI to summarize bugs, UX issues, and feature requests — built for indie developers.",
  keywords: [
    "twitch",
    "game feedback",
    "indie game dev",
    "twitch chat analysis",
    "game development tools",
  ],
  metadataBase: new URL("https://streamsenseapp.com"),
  openGraph: {
    title: "StreamSense — Twitch Chat Feedback for Indie Devs",
    description:
      "Capture live Twitch chat feedback and turn it into actionable AI summaries for your game.",
    url: "https://streamsenseapp.com",
    siteName: "StreamSense",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StreamSense — Twitch Chat Feedback for Indie Devs",
    description:
      "Capture live Twitch chat feedback and turn it into actionable AI summaries for your game.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://streamsenseapp.com",
  },
};

export default function LandingPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "0 24px" }}>
      <style>{`
        .footer-link {
          font-size: 0.78rem;
          color: var(--text-dim);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-link:hover { color: var(--text-muted); }
        @media (max-width: 640px) {
          main { padding: 0 16px; }
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; padding: 48px 0 40px !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .cta-card { flex-direction: column !important; align-items: flex-start !important; }
          .footer-inner { flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 16px !important; }
          .footer-links { justify-content: center !important; }
          .footer-disclaimer { text-align: center !important; }
          .nav-title { height: 60px !important; } 
        }
      `}</style>

      {/* Nav */}
      <nav
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "24px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
          }}
        >
          <img
            src="/logo3.png"
            alt="StreamSense"
            className="nav-title"
            style={{ height: 120, width: "auto" }}
          />
        </Link>
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
      <section style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          className="hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 60,
            alignItems: "center",
            padding: "80px 0 60px",
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
                fontSize: "14px",
              }}
            >
              For indie game devs
            </div>
            <h1
              className="fade-up fade-up-2"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.4rem)",
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
              When someone streams your game on Twitch, chat is full of
              unfiltered bug reports, feature ideas, and honest reactions.
              StreamSense captures it and turns it into a clean summary you can
              actually act on.
            </p>
            <div
              className="fade-up fade-up-4"
              style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
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

          {/* Mock summary card */}
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
                  #1 Streamer · 847 messages · 23 actionable
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
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "60px 0",
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
          className="steps-grid"
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
              desc: "Register your game and connect it to its Twitch category. We'll watch for streams automatically.",
            },
            {
              n: "02",
              title: "Track a session",
              desc: "Search for a live channel streaming your game. We connect to chat in real time.",
            },
            {
              n: "03",
              title: "Get your digest",
              desc: "Stop anytime. We filter noise and generate a structured AI summary you can export.",
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

      {/* Free tier callout */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "60px 0",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div
          className="card cta-card"
          style={{
            padding: "40px 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 24,
          }}
        >
          <div>
            <div
              className="badge"
              style={{
                background: "var(--green-dim)",
                color: "var(--green)",
                border: "1px solid rgba(62,255,160,0.2)",
                display: "inline-block",
                marginBottom: 12,
              }}
            >
              Free to try
            </div>
            <h3
              style={{
                fontSize: "1.3rem",
                fontWeight: 800,
                margin: "0 0 8px",
                letterSpacing: "-0.02em",
              }}
            >
              No credit card required
            </h3>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.88rem",
                margin: 0,
                maxWidth: 400,
              }}
            >
              2 AI summaries free, unlimited session tracking, smart noise
              filtering included. Built for indie devs who ship fast.
            </p>
          </div>
          <Link
            href="/dashboard"
            style={{
              padding: "14px 28px",
              background: "var(--accent)",
              color: "#000",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: "0.9rem",
              textDecoration: "none",
              fontFamily: "'Space Mono', monospace",
              whiteSpace: "nowrap",
            }}
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "32px 0",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div
          className="footer-inner"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <span
            className="mono"
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--text-muted)",
            }}
          >
            StreamSense
          </span>
          <div
            className="footer-links"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <Link href="/privacy" className="footer-link">
              Privacy Policy
            </Link>
            <Link href="/terms" className="footer-link">
              Terms of Service
            </Link>
          </div>
          <span
            className="mono"
            style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}
          >
            © {new Date().getFullYear()} StreamSense
          </span>
        </div>
        <p
          className="footer-disclaimer"
          style={{
            marginTop: 16,
            fontSize: "0.72rem",
            color: "var(--text-dim)",
          }}
        >
          Not affiliated with or endorsed by Twitch Interactive, Inc.
        </p>
      </footer>
    </main>
  );
}
