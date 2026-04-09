import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/app/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const after = searchParams.get("after");

  const messages = await db.chatMessage.findMany({
    where: {
      sessionId: id,
      ...(after ? { id: { gt: after } } : {}),
    },
    orderBy: { capturedAt: "asc" },
    take: 100,
  });

  const trackSession = await db.trackSession.findUnique({
    where: { id },
    select: { status: true, summary: true },
  });

  return NextResponse.json({
    messages,
    status: trackSession?.status,
    summary: trackSession?.summary,
  });
}
