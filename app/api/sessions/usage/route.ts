import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/app/lib/db";

const FREE_SUMMARY_LIMIT = 2;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true },
  });

  const usedTotal = await db.summaryUsage.count({
    where: { userId: session.user.id },
  });

  return NextResponse.json({
    isPro: user?.isPro ?? false,
    usedTotal,
    limit: FREE_SUMMARY_LIMIT,
    remaining: Math.max(0, FREE_SUMMARY_LIMIT - usedTotal),
  });
}
