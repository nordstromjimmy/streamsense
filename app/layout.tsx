import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";

export const metadata: Metadata = {
  title: {
    default: "StreamSense — Twitch Chat Feedback for Indie Game Developers",
    template: "%s | StreamSense",
  },
  description:
    "Turn Twitch chat into actionable game feedback. Capture live streams of your game and get AI-powered summaries of bugs, UX issues, and feature requests.",
  metadataBase: new URL("https://streamsenseapp.com"),
  openGraph: {
    title: "StreamSense — Twitch Chat Feedback for Indie Devs",
    description: "Turn Twitch chat into actionable game feedback.",
    url: "https://streamsenseapp.com",
    siteName: "StreamSense",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "StreamSense — Twitch Chat Feedback for Indie Devs",
    description: "Turn Twitch chat into actionable game feedback.",
    creator: "@streamsenseapp", // add your Twitter handle if you have one
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "https://streamsenseapp.com",
  },
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
