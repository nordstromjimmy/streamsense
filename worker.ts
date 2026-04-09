import { Client, ChatUserstate } from "tmi.js";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Map of sessionId -> disconnect function
const activeConnections = new Map<string, () => void>();

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

async function connectToSession(sessionId: string, channel: string) {
  console.log(`[worker] Connecting to #${channel} for session ${sessionId}`);

  const client = new Client({
    channels: [channel],
    options: { debug: false },
  });

  try {
    await client.connect();
  } catch (err) {
    console.error(`[worker] Failed to connect to #${channel}:`, err);
    await db.trackSession.update({
      where: { id: sessionId },
      data: { status: "FAILED" },
    });
    return;
  }

  client.on("message", async (_ch, tags: ChatUserstate, message, self) => {
    if (self) return;
    const username = tags["display-name"] || tags.username || "unknown";
    if (isBot(username) || isNoise(message)) return;

    try {
      await db.chatMessage.create({
        data: { sessionId, username, message: message.trim() },
      });
    } catch (err) {
      console.error("[worker] Failed to save message:", err);
    }
  });

  activeConnections.set(sessionId, () => {
    client.disconnect();
    activeConnections.delete(sessionId);
    console.log(`[worker] Disconnected from #${channel}`);
  });
}

async function poll() {
  try {
    // Find active sessions not yet connected
    const activeSessions = await db.trackSession.findMany({
      where: { status: "ACTIVE" },
    });

    for (const session of activeSessions) {
      if (!activeConnections.has(session.id)) {
        await connectToSession(session.id, session.twitchChannel);
      }
    }

    // Disconnect any sessions that are no longer active
    for (const [sessionId, disconnect] of activeConnections) {
      const session = await db.trackSession.findUnique({
        where: { id: sessionId },
      });
      if (!session || session.status !== "ACTIVE") {
        disconnect();
      }
    }
  } catch (err) {
    console.error("[worker] Poll error:", err);
  }
}

console.log("[worker] Starting StreamSense chat worker...");
poll();
setInterval(poll, 5000);
