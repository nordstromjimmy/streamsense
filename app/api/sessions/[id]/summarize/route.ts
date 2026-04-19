import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/app/lib/db";
import { checkSummaryLimits, recordSummaryUsage } from "@/app/lib/limits";
import { summarizeSession } from "@/app/lib/ai";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authSession = await auth();
  if (!authSession?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const trackSession = await db.trackSession.findUnique({
    where: { id },
    include: {
      game: true,
      summary: true,
    },
  });
  if (!trackSession) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (trackSession.game.userId !== authSession.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (trackSession.status === "ACTIVE") {
    return NextResponse.json(
      { error: "Stop the session first" },
      { status: 400 },
    );
  }

  if (trackSession.summary) {
    return NextResponse.json(
      { error: "Summary already exists" },
      { status: 400 },
    );
  }

  // Check limits
  const limitCheck = await checkSummaryLimits(authSession.user.id, id);
  if (!limitCheck.allowed) {
    return NextResponse.json(
      {
        error: limitCheck.reason,
        usedTotal: limitCheck.usedTotal,
        limit: limitCheck.limit,
        limitReached:
          limitCheck.usedTotal !== undefined &&
          limitCheck.usedTotal >= (limitCheck.limit ?? 2),
      },
      { status: 429 },
    );
  }

  // Record usage and fire summarization
  await recordSummaryUsage(authSession.user.id, id);

  summarizeSession(id).catch((err) => {
    console.error("Summarization failed:", err);
  });

  return NextResponse.json({
    message: "Summarizing...",
    usedToday: (limitCheck.usedTotal ?? 0) + 1,
    limit: limitCheck.limit,
  });
}
