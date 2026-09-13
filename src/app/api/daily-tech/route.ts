import { NextResponse } from "next/server";
import { getTechDailySummaries, getLatestTechDailySummaryDate } from "@/lib/db";
import { formatDateKey } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    
    let resolvedDate = dateParam || undefined;
    if (!resolvedDate || resolvedDate === "latest") {
      resolvedDate = (await getLatestTechDailySummaryDate()) || formatDateKey(new Date());
    }

    let summaries = await getTechDailySummaries(resolvedDate);

    // If requested date had 0 summaries, fallback to latest
    if (summaries.length === 0) {
      const latestDate = await getLatestTechDailySummaryDate();
      if (latestDate && latestDate !== resolvedDate) {
        resolvedDate = latestDate;
        summaries = await getTechDailySummaries(latestDate);
      }
    }
    
    return NextResponse.json({
      date: resolvedDate,
      summaries,
      count: summaries.length,
    });
  } catch (error) {
    console.error("Daily Tech API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily tech summaries", details: String(error) },
      { status: 500 }
    );
  }
}
