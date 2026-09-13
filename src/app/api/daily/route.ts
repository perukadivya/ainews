import { NextRequest, NextResponse } from "next/server";
import { getDailySummaries, getLatestDailySummaryDate } from "@/lib/db";
import { formatDateKey } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get("date");

  try {
    let resolvedDate = dateParam || undefined;
    if (!resolvedDate || resolvedDate === "latest") {
      resolvedDate = (await getLatestDailySummaryDate()) || formatDateKey(new Date());
    }

    let summaries = await getDailySummaries(resolvedDate);

    // If requested date had 0 summaries and it was default/today, fallback to latest
    if (summaries.length === 0) {
      const latestDate = await getLatestDailySummaryDate();
      if (latestDate && latestDate !== resolvedDate) {
        resolvedDate = latestDate;
        summaries = await getDailySummaries(latestDate);
      }
    }

    return NextResponse.json({
      date: resolvedDate,
      summaries,
      count: summaries.length,
    });
  } catch (error) {
    console.error("Daily API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily summaries", details: String(error) },
      { status: 500 }
    );
  }
}
