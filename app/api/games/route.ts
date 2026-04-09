import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/app/lib/db";

// GET — fetch all games for the logged-in user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const games = await db.game.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { trackSessions: true } },
      trackSessions: {
        orderBy: { startedAt: "desc" },
        take: 1,
        select: { startedAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ games });
}

// POST — create a new game
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, twitchGameId, imageUrl } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const game = await db.game.create({
    data: {
      userId: session.user.id,
      name,
      twitchGameId: twitchGameId ?? null,
      imageUrl: imageUrl ?? null,
    },
  });

  return NextResponse.json({ game });
}
