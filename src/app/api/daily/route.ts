import { NextRequest, NextResponse } from "next/server";
import { getDailySummaries } from "@/lib/db";
import { formatDateKey } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const date =
    request.nextUrl.searchParams.get("date") || formatDateKey(new Date());

  try {
    const summaries = await getDailySummaries(date);
    return NextResponse.json({ date, summaries, count: summaries.length });
  } catch (error) {
    console.error("Daily API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily summaries", details: String(error) },
      { status: 500 }
    );
  }
}
