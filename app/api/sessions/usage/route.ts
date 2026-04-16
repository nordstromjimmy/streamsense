import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/app/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true },
  });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const usedToday = await db.summaryUsage.count({
    where: {
      userId: session.user.id,
      createdAt: { gte: startOfDay },
    },
  });

  return NextResponse.json({
    isPro: user?.isPro ?? false,
    usedToday,
    limit: 3,
    remaining: Math.max(0, 3 - usedToday),
  });
}
