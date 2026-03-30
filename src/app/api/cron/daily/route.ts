import { NextRequest, NextResponse } from "next/server";
import { generateDailyTop10, detectCountdowns } from "@/lib/gemini";
import {
  getLiveUpdates,
  insertDailySummary,
  insertCountdown,
  deactivateExpiredCountdowns,
  getDailySummaries,
} from "@/lib/db";
import { formatDateKey } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const today = formatDateKey(new Date());

    // Check if we already have summaries for today
    const existing = getDailySummaries(today);
    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Daily summaries already exist for today",
        count: existing.length,
      });
    }

    // Get all today's live updates
    const todayUpdates = getLiveUpdates(today, 100);

    // Generate top 10 via Gemini
    const top10 = await generateDailyTop10(todayUpdates);

    // Store daily summaries
    for (const item of top10) {
      insertDailySummary(today, item.rank, item.title, item.summary, item.category);
    }

    // Detect countdowns from recent updates
    deactivateExpiredCountdowns();
    const countdowns = await detectCountdowns(todayUpdates);

    for (const countdown of countdowns) {
      // Only add if target time is in the future
      if (new Date(countdown.targetTime) > new Date()) {
        insertCountdown(countdown.title, countdown.description, countdown.targetTime);
      }
    }

    return NextResponse.json({
      success: true,
      summariesCreated: top10.length,
      countdownsDetected: countdowns.length,
    });
  } catch (error) {
    console.error("Daily cron error:", error);
    return NextResponse.json(
      { error: "Failed to process daily summary", details: String(error) },
      { status: 500 }
    );
  }
}
