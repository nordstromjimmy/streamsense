import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { Client, ChatUserstate } from "tmi.js";
import { PrismaClient } from "@prisma/client";
import { getStreamInfo } from "./app/lib/twitch";

const db = new PrismaClient();

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

// Limits
const MAX_MESSAGES_PER_SESSION = 2000;
const MAX_MESSAGES_PER_USER = 20;

// --- Relevance filter ---
// A message must match at least one keyword group to be saved.
// Groups are intentionally broad to avoid missing valid feedback.

const RELEVANCE_PATTERNS: RegExp[] = [
  // Bug / broken behaviour
  /\b(bug|bugs|buggy|glitch|glitchy|crash|crashed|crashing|broken|breaks|broke|freeze|froze|frozen|stuck|softlock|infinite)\b/i,

  // Something not working
  /\b(not working|doesn't work|doesnt work|won't work|wont work|stopped working|fails|failed|error)\b/i,

  // UX / feel complaints
  /\b(controls?|camera|movement|clunky|sluggish|stiff|slow|too fast|too slow|laggy|lag|delay|input|hitbox|collision)\b/i,

  // Feels like / feels off
  /\b(feels?|feeling)\b.{0,30}\b(weird|off|wrong|bad|good|great|smooth|rough|awkward|natural|responsive|heavy|floaty)\b/i,

  // Difficulty / balance
  /\b(too hard|too easy|unfair|overpowered|op|underpowered|unbalanced|impossible|trivial|difficulty|hard mode|easy mode)\b/i,

  // Confusion / clarity
  /\b(confus|unclear|don't understand|dont understand|where (do|am|is)|what (do|am|is)|how (do|am|is)|lost|no idea|no clue|tutorial|explain)\b/i,

  // Feature requests
  /\b(add|please add|needs?|should (have|be|get)|would (be|love)|wish|want|missing|lacks?|why (no|isn't|isnt|don't|dont)|could you|can you add|option to)\b/i,

  // Praise / what they love
  /\b(love|loved|loving|amazing|incredible|awesome|brilliant|fantastic|favourite|favorite|best part|really like|great job|well done|nice work|good job|keep|don't change|dont change)\b/i,

  // Game elements — signals the person is talking about the game
  /\b(level|map|boss|enemy|enemies|character|player|spawn|checkpoint|save|inventory|ui|menu|hud|quest|objective|mission|item|weapon|ability|skill|jump|attack|dodge|run|walk|shoot|spell)\b/i,

  // Performance
  /\b(fps|frame|frames|stutter|performance|optimize|optimized|optimisation|optimization|resolution|graphics|settings?)\b/i,

  // Audio
  /\b(sound|audio|music|sfx|effect|loud|quiet|mute|volume|hear|noise)\b/i,
];

function isRelevant(message: string): boolean {
  return RELEVANCE_PATTERNS.some((pattern) => pattern.test(message));
}

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

function hasUrl(message: string): boolean {
  return /https?:\/\/\S+/.test(message);
}

async function connectToSession(sessionId: string, channel: string) {
  console.log(`[worker] Connecting to #${channel} for session ${sessionId}`);

  const client = new Client({
    channels: [channel],
    options: { debug: false },
  });

  // Fetch session + game info
  const sessionRecord = await db.trackSession.findUnique({
    where: { id: sessionId },
    include: { game: true },
  });

  const allChat = sessionRecord?.allChat ?? false;
  const expectedGameId = sessionRecord?.game?.twitchGameId ?? null;

  if (allChat) {
    console.log(
      `[worker] Session ${sessionId} is in All Chat mode — filters disabled`,
    );
  }

  if (expectedGameId) {
    console.log(
      `[worker] Will monitor game changes for session ${sessionId} (expected game ID: ${expectedGameId})`,
    );
  } else {
    console.log(
      `[worker] Game has no Twitch ID — game change detection disabled for session ${sessionId}`,
    );
  }

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

  let sessionMessageCount = await db.chatMessage.count({
    where: { sessionId },
  });
  const userMessageCounts = new Map<string, number>();

  client.on("message", async (_ch, tags: ChatUserstate, message, self) => {
    if (self) return;

    const username = (
      tags["display-name"] ||
      tags.username ||
      "unknown"
    ).toLowerCase();

    if (allChat) {
      if (isBot(username)) return;
      if (isNoise(message)) return;
    } else {
      if (isBot(username)) return;
      if (isNoise(message)) return;
      if (hasUrl(message)) return;
      if (message.trim().split(/\s+/).length < 4) return;
      if (!isRelevant(message)) return;
    }

    if (sessionMessageCount >= MAX_MESSAGES_PER_SESSION) {
      console.log(`[worker] Session ${sessionId} hit message cap`);
      return;
    }

    const userCount = userMessageCounts.get(username) ?? 0;
    if (userCount >= MAX_MESSAGES_PER_USER) return;

    try {
      await db.chatMessage.create({
        data: { sessionId, username, message: message.trim() },
      });
      sessionMessageCount++;
      userMessageCounts.set(username, userCount + 1);
    } catch (err) {
      console.error("[worker] Failed to save message:", err);
    }
  });

  // Game change detection — poll every 60 seconds
  let gameCheckInterval: NodeJS.Timeout | null = null;
  let consecutiveNullCount = 0;
  const NULL_THRESHOLD = 3; // require 3 consecutive nulls before auto-stopping

  if (expectedGameId) {
    gameCheckInterval = setInterval(async () => {
      try {
        const current = await db.trackSession.findUnique({
          where: { id: sessionId },
          select: { status: true },
        });
        if (!current || current.status !== "ACTIVE") {
          if (gameCheckInterval) clearInterval(gameCheckInterval);
          return;
        }

        const streamInfo = await getStreamInfo(channel);

        if (!streamInfo) {
          consecutiveNullCount++;
          console.log(
            `[worker] #${channel} returned null stream info (${consecutiveNullCount}/${NULL_THRESHOLD}) — verifying channel name and credentials`,
          );

          if (consecutiveNullCount >= NULL_THRESHOLD) {
            console.log(
              `[worker] #${channel} confirmed offline — auto-stopping session ${sessionId}`,
            );
            await db.trackSession.update({
              where: { id: sessionId },
              data: {
                status: "COMPLETED",
                endedAt: new Date(),
                autoStoppedReason: "Stream went offline",
              },
            });
            if (gameCheckInterval) clearInterval(gameCheckInterval);
            disconnect();
          }
          return;
        }

        // Stream is live — reset null counter
        consecutiveNullCount = 0;

        if (streamInfo.game_id !== expectedGameId) {
          console.log(
            `[worker] Game changed on #${channel} to "${streamInfo.game_name}" — auto-stopping session ${sessionId}`,
          );
          await db.trackSession.update({
            where: { id: sessionId },
            data: {
              status: "COMPLETED",
              endedAt: new Date(),
              autoStoppedReason: `Streamer switched to "${streamInfo.game_name}"`,
            },
          });
          if (gameCheckInterval) clearInterval(gameCheckInterval);
          disconnect();
        }
      } catch (err) {
        console.error("[worker] Game check error:", err);
        // Don't increment null count on exceptions — only on confirmed null responses
      }
    }, 60_000);
  }

  const disconnect = () => {
    client.disconnect();
    if (gameCheckInterval) clearInterval(gameCheckInterval);
    activeConnections.delete(sessionId);
    console.log(`[worker] Disconnected from #${channel}`);
  };

  activeConnections.set(sessionId, disconnect);
}

async function poll() {
  try {
    const activeSessions = await db.trackSession.findMany({
      where: { status: "ACTIVE" },
    });

    for (const session of activeSessions) {
      if (!activeConnections.has(session.id)) {
        await connectToSession(session.id, session.twitchChannel);
      }
    }

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
