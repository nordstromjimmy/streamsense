"use client";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
      }}
    >
      <style>{`
        .login-card {
          padding: 48px;
          max-width: 420px;
          width: 100%;
          text-align: center;
        }
        @media (max-width: 480px) {
          .login-card {
            padding: 28px 20px;
          }
        }
      `}</style>

      <div className="card login-card">
        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            marginBottom: 12,
          }}
        >
          Sign in to StreamSense
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.9rem",
            lineHeight: 1.6,
            marginBottom: 36,
          }}
        >
          Connect your Twitch account to start tracking chat feedback for your
          games.
        </p>
        <button
          onClick={() => signIn("twitch", { callbackUrl: "/dashboard" })}
          style={{
            width: "100%",
            padding: "14px 24px",
            background: "#9147ff",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor: "pointer",
            fontFamily: "'Space Mono', monospace",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
          </svg>
          Continue with Twitch
        </button>
        <p
          className="mono"
          style={{
            color: "var(--text-dim)",
            fontSize: "0.68rem",
            marginTop: 24,
          }}
        >
          We only read your public profile info.
        </p>
      </div>
    </main>
  );
}
