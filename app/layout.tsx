import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";

export const metadata: Metadata = {
  title: "StreamSense — Twitch Feedback for Indie Devs",
  description: "Turn Twitch chat into actionable game feedback.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div
          className="blob"
          style={{
            width: 600,
            height: 600,
            background: "var(--accent)",
            top: -200,
            right: -200,
          }}
        />
        <div
          className="blob"
          style={{
            width: 400,
            height: 400,
            background: "var(--purple)",
            bottom: -100,
            left: -100,
            animationDelay: "-7s",
          }}
        />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
