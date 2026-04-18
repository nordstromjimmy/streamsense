import { db } from "./db";

// LIVE LIMITS
/* const FREE_SUMMARY_LIMIT = 2; // lifetime total for free users
const MIN_MESSAGES_TO_SUMMARIZE = 20;
const MIN_SESSION_DURATION_MINUTES = 5; */

// DEV LIMITS

const FREE_SUMMARY_LIMIT = 2;
const MIN_MESSAGES_TO_SUMMARIZE = 1;
const MIN_SESSION_DURATION_MINUTES = 0;

export interface LimitCheck {
  allowed: boolean;
  reason?: string;
  usedTotal?: number;
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

  if (user?.isPro) return { allowed: true };

  // Lifetime total
  const usedTotal = await db.summaryUsage.count({
    where: { userId },
  });

  if (usedTotal >= FREE_SUMMARY_LIMIT) {
    return {
      allowed: false,
      reason: `You've used all ${FREE_SUMMARY_LIMIT} free summaries. Upgrade to Pro for unlimited summaries.`,
      usedTotal,
      limit: FREE_SUMMARY_LIMIT,
    };
  }

  // Minimum messages check
  const messageCount = await db.chatMessage.count({
    where: { sessionId },
  });

  if (messageCount < MIN_MESSAGES_TO_SUMMARIZE) {
    return {
      allowed: false,
      reason: `Not enough messages to summarize. Need at least ${MIN_MESSAGES_TO_SUMMARIZE}, only ${messageCount} captured.`,
      usedTotal,
      limit: FREE_SUMMARY_LIMIT,
    };
  }

  // Minimum session duration check
  const session = await db.trackSession.findUnique({
    where: { id: sessionId },
    select: { startedAt: true },
  });

  if (session) {
    const durationMinutes =
      (Date.now() - session.startedAt.getTime()) / 1000 / 60;
    if (durationMinutes < MIN_SESSION_DURATION_MINUTES) {
      const waitMinutes = Math.ceil(
        MIN_SESSION_DURATION_MINUTES - durationMinutes,
      );
      return {
        allowed: false,
        reason: `Session must run for at least ${MIN_SESSION_DURATION_MINUTES} minutes. Wait ${waitMinutes} more minute${waitMinutes !== 1 ? "s" : ""}.`,
        usedTotal,
        limit: FREE_SUMMARY_LIMIT,
      };
    }
  }

  return { allowed: true, usedTotal, limit: FREE_SUMMARY_LIMIT };
}

export async function recordSummaryUsage(userId: string, sessionId: string) {
  await db.summaryUsage.upsert({
    where: { sessionId },
    create: { userId, sessionId },
    update: {},
  });
}
