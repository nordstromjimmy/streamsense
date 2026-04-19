import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "StreamSense privacy policy — how we collect, use, and protect your data.",
  robots: { index: true, follow: false },
};

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "0 24px" }}>
      <nav
        style={{
          maxWidth: 800,
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
            fontFamily: "'Space Mono', monospace",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--text)",
            textDecoration: "none",
          }}
        >
          StreamSense
        </Link>
        <Link
          href="/"
          style={{
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            textDecoration: "none",
          }}
        >
          ← Back
        </Link>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 0" }}>
        <div
          className="mono"
          style={{
            fontSize: "0.7rem",
            color: "var(--accent)",
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Legal
        </div>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            marginBottom: 8,
          }}
        >
          Privacy Policy
        </h1>
        <p
          className="mono"
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            marginBottom: 48,
          }}
        >
          Last updated: April 1, 2026
        </p>

        {[
          {
            title: "Overview",
            content: `StreamSense is a tool that helps indie game developers collect and analyze feedback from Twitch chat. This policy explains what data we collect, how we use it, and your rights regarding that data.`,
          },
          {
            title: "Information We Collect",
            content: `When you sign in with Twitch, we receive your Twitch username, display name, profile picture, and email address. We use this only to identify your account within StreamSense. We do not receive access to your Twitch channel, stream keys, or the ability to act on your behalf.

We also store Twitch chat messages captured during your tracking sessions. These are public messages from public Twitch channels — we do not capture any private messages.`,
          },
          {
            title: "How We Use Your Data",
            content: `Your account information is used solely to authenticate you and associate your games and sessions with your account. Chat messages are stored so we can generate AI-powered summaries using Anthropic's Claude API. We do not sell, share, or use your data for advertising purposes.`,
          },
          {
            title: "Third-Party Services",
            content: `We use the following third-party services: Twitch (OAuth authentication and chat data), Anthropic Claude (AI summarization of chat messages). Chat messages captured during your sessions may be sent to Anthropic's API for processing. Anthropic's privacy policy applies to that processing.`,
          },
          {
            title: "Data Retention",
            content: `Your session data and chat messages are stored until you delete them. You can delete individual sessions or your entire game from the dashboard at any time. Deleting a game removes all associated sessions and messages permanently.`,
          },
          {
            title: "Your Rights",
            content: `You can delete your data at any time through the dashboard. If you want your account and all associated data permanently removed, contact us at the email below and we will process your request within 30 days.`,
          },
          {
            title: "Cookies",
            content: `We use a single session cookie to keep you signed in. We do not use tracking cookies or third-party analytics cookies.`,
          },
          {
            title: "Contact",
            content: `For any privacy-related questions or data deletion requests, contact us at: info@streamsenseapp.com`,
          },
        ].map((section) => (
          <div key={section.title} style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                marginBottom: 12,
                color: "var(--text)",
              }}
            >
              {section.title}
            </h2>
            {section.content.split("\n\n").map((para, i) => (
              <p
                key={i}
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                  lineHeight: 1.75,
                  margin: "0 0 12px",
                }}
              >
                {para}
              </p>
            ))}
          </div>
        ))}
      </div>

      <footer
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "24px 0",
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: 24,
        }}
      >
        <Link
          href="/terms"
          style={{
            fontSize: "0.78rem",
            color: "var(--text-dim)",
            textDecoration: "none",
          }}
        >
          Terms of Service
        </Link>
        <Link
          href="/"
          style={{
            fontSize: "0.78rem",
            color: "var(--text-dim)",
            textDecoration: "none",
          }}
        >
          Home
        </Link>
      </footer>
    </main>
  );
}
