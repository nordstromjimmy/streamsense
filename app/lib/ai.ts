import Anthropic from "@anthropic-ai/sdk";
import { db } from "./db";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const MIN_WORD_COUNT = 4;
const MAX_DUPLICATE_RATIO = 5; // if a message appears this many times, keep only one

function cleanMessages(
  messages: { username: string; message: string }[],
): { username: string; message: string }[] {
  // 1. Word count filter
  const wordFiltered = messages.filter(
    (m) => m.message.trim().split(/\s+/).length >= MIN_WORD_COUNT,
  );

  // 2. Deduplicate — count occurrences of each message text
  const messageCounts = new Map<string, number>();
  for (const m of wordFiltered) {
    const key = m.message.toLowerCase().trim();
    messageCounts.set(key, (messageCounts.get(key) ?? 0) + 1);
  }

  // 3. Keep only first occurrence if it appears MAX_DUPLICATE_RATIO+ times
  const seenDuplicates = new Set<string>();
  const deduped = wordFiltered.filter((m) => {
    const key = m.message.toLowerCase().trim();
    const count = messageCounts.get(key) ?? 1;
    if (count >= MAX_DUPLICATE_RATIO) {
      if (seenDuplicates.has(key)) return false;
      seenDuplicates.add(key);
    }
    return true;
  });

  // 4. Per-user cap — max 20 messages per user in what gets sent to Claude
  const userCounts = new Map<string, number>();
  const userCapped = deduped.filter((m) => {
    const count = userCounts.get(m.username) ?? 0;
    if (count >= 20) return false;
    userCounts.set(m.username, count + 1);
    return true;
  });

  return userCapped;
}

const SUMMARY_PROMPT = (gameName: string, messages: string) => `
You are analyzing Twitch chat messages from a live stream of the game "${gameName}".
Extract actionable feedback a game developer can act on. Return ONLY valid JSON, no other text.

Chat messages:
${messages}

Respond with this exact JSON shape:
{
  "bugs": ["specific bug report"],
  "uiUxIssues": ["specific UX complaint"],
  "featureRequests": ["specific feature request"],
  "positives": ["specific thing players praised"],
  "rawSummary": "2-3 sentence plain English overview"
}

Rules:
- Be specific, not vague. Consolidate duplicates into one entry.
- Ignore hype, spam, and emote-only messages.
- Empty array [] if nothing found in a category.
- Do not include your reasoning. Only return the JSON.
`;

export async function summarizeSession(sessionId: string): Promise<void> {
  const rawMessages = await db.chatMessage.findMany({
    where: { sessionId, isBot: false },
    orderBy: { capturedAt: "asc" },
  });

  if (rawMessages.length === 0) throw new Error("No messages to summarize");

  const session = await db.trackSession.findUnique({
    where: { id: sessionId },
    include: { game: true },
  });
  if (!session) throw new Error("Session not found");

  // Run cleanup pass before sending to Claude
  const cleaned = cleanMessages(rawMessages);

  console.log(
    `[ai] Session ${sessionId}: ${rawMessages.length} raw → ${cleaned.length} after cleanup`,
  );

  if (cleaned.length === 0) {
    // Not enough signal — save a minimal summary
    await db.summary.upsert({
      where: { sessionId },
      create: {
        sessionId,
        bugs: "[]",
        uiUxIssues: "[]",
        featureRequests: "[]",
        positives: "[]",
        rawSummary: "Not enough chat messages to generate meaningful feedback.",
        messageCount: rawMessages.length,
        actionableCount: 0,
      },
      update: {
        bugs: "[]",
        uiUxIssues: "[]",
        featureRequests: "[]",
        positives: "[]",
        rawSummary: "Not enough chat messages to generate meaningful feedback.",
        messageCount: rawMessages.length,
        actionableCount: 0,
      },
    });
    return;
  }

  const messageText = cleaned
    .map((m) => `${m.username}: ${m.message}`)
    .join("\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: SUMMARY_PROMPT(session.game.name, messageText),
      },
    ],
  });

  const raw =
    response.content[0].type === "text" ? response.content[0].text : "";
  const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

  const actionableCount =
    parsed.bugs.length +
    parsed.uiUxIssues.length +
    parsed.featureRequests.length;

  await db.summary.upsert({
    where: { sessionId },
    create: {
      sessionId,
      bugs: JSON.stringify(parsed.bugs),
      uiUxIssues: JSON.stringify(parsed.uiUxIssues),
      featureRequests: JSON.stringify(parsed.featureRequests),
      positives: JSON.stringify(parsed.positives),
      rawSummary: parsed.rawSummary,
      messageCount: rawMessages.length,
      actionableCount,
    },
    update: {
      bugs: JSON.stringify(parsed.bugs),
      uiUxIssues: JSON.stringify(parsed.uiUxIssues),
      featureRequests: JSON.stringify(parsed.featureRequests),
      positives: JSON.stringify(parsed.positives),
      rawSummary: parsed.rawSummary,
      messageCount: rawMessages.length,
      actionableCount,
    },
  });
}
