import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { searchTwitchGames } from "@/app/lib/twitch";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = new URL(req.url).searchParams.get("q");
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchTwitchGames(query);
  return NextResponse.json({ results });
}
