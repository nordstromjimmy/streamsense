import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAppAccessToken } from "@/app/lib/twitch";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = new URL(req.url).searchParams.get("q");
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const token = await getAppAccessToken();
  const res = await fetch(
    `https://api.twitch.tv/helix/search/channels?query=${encodeURIComponent(query)}&first=6&live_only=true`,
    {
      headers: {
        "Client-Id": process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) return NextResponse.json({ results: [] });

  const data = await res.json();
  return NextResponse.json({ results: data.data ?? [] });
}
