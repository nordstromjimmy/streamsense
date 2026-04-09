import { summarizeSession } from "@/app/lib/ai";
import { db } from "@/app/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

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
  const { id } = await params;
  const session = await db.trackSession.findUnique({ where: { id } });
  if (!session)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.status !== "ACTIVE")
    return NextResponse.json({ error: "Session not active" }, { status: 400 });

  // Mark as COMPLETED immediately so returning to the page won't resume polling
  await db.trackSession.update({
    where: { id },
    data: { status: "COMPLETED", endedAt: new Date() },
  });

  // Fire summarization in background
  summarizeSession(id).catch(async (err) => {
    console.error("Summarization failed:", err);
    // Don't revert status — session is still done, just no summary
  });

  return NextResponse.json({ message: "Summarizing..." });
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

  // Verify ownership via the game relation
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
