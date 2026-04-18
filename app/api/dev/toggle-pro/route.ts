import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/app/lib/db";

// DEV ONLY — remove before going to production
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 },
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true },
  });

  const updated = await db.user.update({
    where: { id: session.user.id },
    data: { isPro: !user?.isPro },
  });

  return NextResponse.json({ isPro: updated.isPro });
}
