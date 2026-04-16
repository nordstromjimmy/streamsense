import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/app/lib/db";
import { checkSummaryLimits, recordSummaryUsage } from "@/app/lib/limits";
import { summarizeSession } from "@/app/lib/ai";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await db.trackSession.findUnique({
    where: { id },
    include: {
      game: true,
      summary: true,
      _count: { select: { messages: true } },
    },
  });
  if (!session)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ session });
}

export async function PATCH(
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
    include: { game: true },
  });

  if (!trackSession) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (trackSession.status !== "ACTIVE") {
    return NextResponse.json({ error: "Session not active" }, { status: 400 });
  }

  // Check limits before doing anything
  const limitCheck = await checkSummaryLimits(authSession.user.id, id);
  if (!limitCheck.allowed) {
    return NextResponse.json(
      {
        error: limitCheck.reason,
        usedToday: limitCheck.usedToday,
        limit: limitCheck.limit,
        limitReached: true,
      },
      { status: 429 },
    );
  }

  // Mark as completed immediately
  await db.trackSession.update({
    where: { id },
    data: { status: "COMPLETED", endedAt: new Date() },
  });

  // Record usage
  await recordSummaryUsage(authSession.user.id, id);

  // Fire summarization in background
  summarizeSession(id).catch(async (err) => {
    console.error("Summarization failed:", err);
  });

  return NextResponse.json({
    message: "Summarizing...",
    usedToday: (limitCheck.usedToday ?? 0) + 1,
    limit: limitCheck.limit,
  });
}

export async function DELETE(
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
    include: { game: true },
  });

  if (!trackSession || trackSession.game.userId !== authSession.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.trackSession.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
