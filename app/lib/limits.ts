import { db } from "./db";

// Free tier limits
/* const FREE_SUMMARIES_PER_DAY = 3;
const FREE_COOLDOWN_MINUTES = 30;
const MIN_MESSAGES_TO_SUMMARIZE = 20;
const MIN_SESSION_DURATION_MINUTES = 5; */

// dev limits
const FREE_SUMMARIES_PER_DAY = 10;
const FREE_COOLDOWN_MINUTES = 0;
const MIN_MESSAGES_TO_SUMMARIZE = 1;
const MIN_SESSION_DURATION_MINUTES = 0;

export interface LimitCheck {
  allowed: boolean;
  reason?: string;
  usedToday?: number;
  limit?: number;
}

export async function checkSummaryLimits(
  userId: string,
  sessionId: string,
): Promise<LimitCheck> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });

  // Pro users have no limits
  if (user?.isPro) return { allowed: true };

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  // Check daily limit
  const usedToday = await db.summaryUsage.count({
    where: {
      userId,
      createdAt: { gte: startOfDay },
    },
  });

  if (usedToday >= FREE_SUMMARIES_PER_DAY) {
    return {
      allowed: false,
      reason: `You've used all ${FREE_SUMMARIES_PER_DAY} free summaries for today. Resets at midnight.`,
      usedToday,
      limit: FREE_SUMMARIES_PER_DAY,
    };
  }

  // Check cooldown — when was the last summary?
  const lastUsage = await db.summaryUsage.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (lastUsage) {
    const minutesSinceLast =
      (now.getTime() - lastUsage.createdAt.getTime()) / 1000 / 60;
    if (minutesSinceLast < FREE_COOLDOWN_MINUTES) {
      const waitMinutes = Math.ceil(FREE_COOLDOWN_MINUTES - minutesSinceLast);
      return {
        allowed: false,
        reason: `Please wait ${waitMinutes} more minute${waitMinutes !== 1 ? "s" : ""} before generating another summary.`,
        usedToday,
        limit: FREE_SUMMARIES_PER_DAY,
      };
    }
  }

  // Check minimum messages
  const messageCount = await db.chatMessage.count({
    where: { sessionId },
  });

  if (messageCount < MIN_MESSAGES_TO_SUMMARIZE) {
    return {
      allowed: false,
      reason: `Not enough messages to summarize. Need at least ${MIN_MESSAGES_TO_SUMMARIZE}, only ${messageCount} captured.`,
      usedToday,
      limit: FREE_SUMMARIES_PER_DAY,
    };
  }

  // Check minimum session duration
  const session = await db.trackSession.findUnique({
    where: { id: sessionId },
    select: { startedAt: true },
  });

  if (session) {
    const durationMinutes =
      (now.getTime() - session.startedAt.getTime()) / 1000 / 60;
    if (durationMinutes < MIN_SESSION_DURATION_MINUTES) {
      const waitMinutes = Math.ceil(
        MIN_SESSION_DURATION_MINUTES - durationMinutes,
      );
      return {
        allowed: false,
        reason: `Session must run for at least ${MIN_SESSION_DURATION_MINUTES} minutes before summarizing. Wait ${waitMinutes} more minute${waitMinutes !== 1 ? "s" : ""}.`,
        usedToday,
        limit: FREE_SUMMARIES_PER_DAY,
      };
    }
  }

  return { allowed: true, usedToday, limit: FREE_SUMMARIES_PER_DAY };
}

export async function recordSummaryUsage(userId: string, sessionId: string) {
  await db.summaryUsage.upsert({
    where: { sessionId },
    create: { userId, sessionId },
    update: {},
  });
}
