import Anthropic from "@anthropic-ai/sdk";
import { db } from "./db";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function summarizeSession(sessionId: string): Promise<void> {
  const messages = await db.chatMessage.findMany({
    where: { sessionId, isBot: false },
    orderBy: { capturedAt: "asc" },
  });

  if (messages.length === 0) throw new Error("No messages to summarize");

  const session = await db.trackSession.findUnique({
    where: { id: sessionId },
    include: { game: true },
  });
  if (!session) throw new Error("Session not found");

  const messageText = messages
    .map((m: { username: any; message: any }) => `${m.username}: ${m.message}`)
    .join("\n");

  const prompt = `
You are analyzing Twitch chat from a live stream of the game "${session.game.name}".
Extract actionable developer feedback. Return ONLY valid JSON, no other text.

Chat messages:
${messageText}

Respond with this exact JSON shape:
{
  "bugs": ["specific bug report"],
  "uiUxIssues": ["specific UX complaint"],
  "featureRequests": ["specific feature request"],
  "positives": ["specific thing players praised"],
  "rawSummary": "2-3 sentence plain English overview"
}

Rules:
- Be specific, not vague. Consolidate duplicates.
- Ignore hype, spam, and emote-only messages.
- Empty array [] if nothing found in a category.
`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
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
      ...parsed,
      messageCount: messages.length,
      actionableCount,
    },
    update: { ...parsed, messageCount: messages.length, actionableCount },
  });
}
