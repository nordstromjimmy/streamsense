import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SessionLiveView from "./SessionLiveView";
import { db } from "@/app/lib/db";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const trackSession = await db.trackSession.findUnique({
    where: { id },
    include: {
      game: true,
      summary: true,
      _count: { select: { messages: true } },
    },
  });

  if (!trackSession || trackSession.game.userId !== session.user.id) {
    redirect("/dashboard");
  }

  return <SessionLiveView session={trackSession} />;
}
