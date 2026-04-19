import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { db } from "../lib/db";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true },
  });

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

  const recentSessions = await db.trackSession.findMany({
    where: { game: { userId: session.user.id } },
    include: { game: { select: { name: true } } },
    orderBy: { startedAt: "desc" },
    take: 8,
  });

  const totalMessages = await db.chatMessage.count({
    where: { session: { game: { userId: session.user.id } } },
  });

  const totalActionable = await db.summary.aggregate({
    where: { session: { game: { userId: session.user.id } } },
    _sum: { actionableCount: true },
  });

  return (
    <DashboardClient
      user={{ name: session.user.name, image: session.user.image }}
      games={games}
      recentSessions={recentSessions}
      totalMessages={totalMessages}
      totalActionable={totalActionable._sum.actionableCount ?? 0}
      isPro={user?.isPro ?? false}
    />
  );
}
