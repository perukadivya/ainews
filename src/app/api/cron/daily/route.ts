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
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const today = formatDateKey(new Date());

    const existing = await getDailySummaries(today);
    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Daily summaries already exist for today",
        count: existing.length,
      });
    }

    const todayUpdates = await getLiveUpdates(today, 100);

    const top10 = await generateDailyTop10(todayUpdates);

    for (const item of top10) {
      await insertDailySummary(today, item.rank, item.title, item.summary, item.category);
    }

    await deactivateExpiredCountdowns();
    const countdowns = await detectCountdowns(todayUpdates);

    for (const countdown of countdowns) {
      if (new Date(countdown.targetTime) > new Date()) {
        await insertCountdown(countdown.title, countdown.description, countdown.targetTime);
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
