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

// Token cache — reuse until it expires
let cachedToken: { token: string; expiresAt: number } | null = null;

// Get an app access token using client credentials
export async function getAppAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

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
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.token;
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

export async function getStreamInfo(channel: string): Promise<{
  game_id: string;
  game_name: string;
  user_name: string;
  title: string;
} | null> {
  const token = await getAppAccessToken();
  const res = await fetch(
    `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(channel.toLowerCase())}`,
    {
      headers: {
        "Client-Id": process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    console.error(
      `[twitch] getStreamInfo failed: ${res.status} ${await res.text()}`,
    );
    return null;
  }

  const data = await res.json();
  /*   console.log(
    `[twitch] getStreamInfo for #${channel}:`,
    JSON.stringify(data.data),
  ); */
  return data.data?.[0] ?? null;
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
