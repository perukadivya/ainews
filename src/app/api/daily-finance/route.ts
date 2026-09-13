import { NextResponse } from "next/server";
import { getFinanceDailySummaries, getLatestFinanceDailySummaryDate } from "@/lib/db";
import { formatDateKey } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    
    let resolvedDate = dateParam || undefined;
    if (!resolvedDate || resolvedDate === "latest") {
      resolvedDate = (await getLatestFinanceDailySummaryDate()) || formatDateKey(new Date());
    }

    let summaries = await getFinanceDailySummaries(resolvedDate);

    // If requested date had 0 summaries, fallback to latest
    if (summaries.length === 0) {
      const latestDate = await getLatestFinanceDailySummaryDate();
      if (latestDate && latestDate !== resolvedDate) {
        resolvedDate = latestDate;
        summaries = await getFinanceDailySummaries(latestDate);
      }
    }
    
    return NextResponse.json({
      date: resolvedDate,
      summaries,
      count: summaries.length,
    });
  } catch (error) {
    console.error("Daily Finance API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily finance summaries", details: String(error) },
      { status: 500 }
    );
  }
}
