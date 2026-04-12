import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/app/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { gameId, twitchChannel, allChat } = await req.json();
  if (!gameId || !twitchChannel) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const game = await db.game.findUnique({ where: { id: gameId } });
  if (!game || game.userId !== session.user.id) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const trackSession = await db.trackSession.create({
    data: {
      gameId,
      twitchChannel: twitchChannel.toLowerCase().replace(/^#/, ""),
      status: "ACTIVE",
      allChat: allChat ?? false,
    },
  });

  return NextResponse.json({ session: trackSession });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
