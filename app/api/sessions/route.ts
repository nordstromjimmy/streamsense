import { db } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { gameId, twitchChannel } = await req.json();
  if (!gameId || !twitchChannel)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const session = await db.trackSession.create({
    data: {
      gameId,
      twitchChannel: twitchChannel.toLowerCase().replace(/^#/, ""),
      status: "ACTIVE",
    },
  });

  return NextResponse.json({ session });
}

export async function GET(req: NextRequest) {
  const gameId = new URL(req.url).searchParams.get("gameId");
  const sessions = await db.trackSession.findMany({
    where: gameId ? { gameId } : {},
    include: {
      game: { select: { name: true } },
      summary: true,
      _count: { select: { messages: true } },
    },
    orderBy: { startedAt: "desc" },
  });
  return NextResponse.json({ sessions });
}
