import { Client, ChatUserstate } from "tmi.js";
import { db } from "./db";

const KNOWN_BOTS = new Set([
  "nightbot",
  "streamelements",
  "streamlabs",
  "moobot",
  "fossabot",
  "sery_bot",
  "commanderroot",
  "wizebot",
  "deepbot",
]);

const NOISE_PATTERNS = [
  /^[A-Z\s!]{1,6}$/,
  /(.)\1{4,}/,
  /^[\p{Emoji}\s]+$/u,
  /^!/,
];

function isNoise(message: string): boolean {
  if (message.length < 5) return true;
  return NOISE_PATTERNS.some((p) => p.test(message.trim()));
}

function isBot(username: string): boolean {
  return (
    KNOWN_BOTS.has(username.toLowerCase()) ||
    username.toLowerCase().endsWith("bot")
  );
}

// Get an app access token using client credentials
export async function getAppAccessToken(): Promise<string> {
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID!,
      client_secret: process.env.TWITCH_CLIENT_SECRET!,
      grant_type: "client_credentials",
    }),
  });
  const data = await res.json();
  return data.access_token;
}

// Search Twitch for games matching a query
export async function searchTwitchGames(
  query: string,
): Promise<{ id: string; name: string; box_art_url: string }[]> {
  const token = await getAppAccessToken();
  const res = await fetch(
    `https://api.twitch.tv/helix/search/categories?query=${encodeURIComponent(query)}&first=6`,
    {
      headers: {
        "Client-Id": process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.data ?? [];
}

export async function startTrackingSession(
  sessionId: string,
  channel: string,
): Promise<() => void> {
  const client = new Client({
    channels: [channel],
    options: { debug: false },
  });

  await client.connect();

  client.on("message", async (_ch, tags: ChatUserstate, message, self) => {
    if (self) return;
    const username = tags["display-name"] || tags.username || "unknown";
    if (isBot(username) || isNoise(message)) return;

    await db.chatMessage.create({
      data: { sessionId, username, message: message.trim() },
    });
  });

  return () => {
    client.disconnect();
  };
}
