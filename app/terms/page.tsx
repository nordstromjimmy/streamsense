import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "StreamSense terms of service — the rules for using our platform.",
  robots: { index: true, follow: false },
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p
          className="mono"
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            marginBottom: 48,
          }}
        >
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {[
          {
            title: "Acceptance of Terms",
            content: `By using StreamSense, you agree to these Terms of Service. If you do not agree, please do not use the Service. We reserve the right to update these terms at any time — continued use of the Service after changes constitutes acceptance.`,
          },
          {
            title: "Description of Service",
            content: `StreamSense is a tool that connects to public Twitch chat streams and uses AI to generate feedback summaries for game developers. The Service is provided as-is and may be updated, changed, or discontinued at any time.`,
          },
          {
            title: "Eligibility",
            content: `You must be at least 13 years old to use StreamSense. By using the Service, you represent that you meet this requirement. The Service is intended for game developers and creators — use for any other purpose is at your own risk.`,
          },
          {
            title: "Acceptable Use",
            content: `You agree not to use StreamSense to track private channels without authorization, to harvest personal data from Twitch users, to circumvent Twitch's Terms of Service, or to use the Service for any unlawful purpose. We reserve the right to suspend or terminate accounts that violate these terms.`,
          },
          {
            title: "Twitch Data",
            content: `StreamSense captures publicly visible Twitch chat messages from channels you specify. You are responsible for ensuring you have the right to track and analyze chat from those channels. StreamSense is not affiliated with Twitch Interactive, Inc. and use of this Service is subject to Twitch's own Terms of Service.`,
          },
          {
            title: "AI-Generated Content",
            content: `Summaries are generated using Anthropic's Claude AI. AI-generated content may contain errors, omissions, or inaccuracies. StreamSense does not warrant the accuracy of summaries and they should be used as a guide rather than a definitive record of feedback.`,
          },
          {
            title: "Free Tier Limits",
            content: `The free tier includes 3 AI summaries per day with a 30-minute cooldown between summaries. These limits may change at any time. Attempting to circumvent these limits may result in account suspension.`,
          },
          {
            title: "Disclaimer of Warranties",
            content: `The Service is provided "as is" without any warranties of any kind, express or implied. We do not guarantee that the Service will be available, error-free, or that chat data will be captured accurately at all times. Twitch API availability affects the reliability of the Service.`,
          },
          {
            title: "Limitation of Liability",
            content: `StreamSense shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability to you for any claim arising from use of the Service shall not exceed the amount you paid us in the 12 months preceding the claim.`,
          },
          {
            title: "Contact",
            content: `For questions about these terms, contact us at: info@streamsenseapp.com`,
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
          href="/privacy"
          style={{
            fontSize: "0.78rem",
            color: "var(--text-dim)",
            textDecoration: "none",
          }}
        >
          Privacy Policy
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
