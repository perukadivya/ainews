import { NextRequest, NextResponse } from "next/server";
import { generateTechDailyTop10 } from "@/lib/gemini";
import {
  getTechUpdates,
  insertTechDailySummary,
  getTechDailySummaries,
} from "@/lib/db";
import { formatDateKey } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Max allowed for Vercel Hobby

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 1,
  initialDelay = 2000
): Promise<T> {
  let lastError: Error | unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.warn(
          `Attempt ${attempt + 1} failed, retrying in ${delay}ms...`,
          error
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const today = formatDateKey(new Date());

    const existing = await getTechDailySummaries(today);
    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Tech daily summaries already exist for today",
        count: existing.length,
      });
    }

    const todayUpdates = await getTechUpdates(today, 100);

    // Generate top 10 with retry
    const top10 = await withRetry(() => generateTechDailyTop10(todayUpdates));

    for (const item of top10) {
      await insertTechDailySummary(
        today,
        item.rank,
        item.title,
        item.summary,
        item.category
      );
    }

    return NextResponse.json({
      success: true,
      summariesCreated: top10.length,
    });
  } catch (error) {
    console.error("Tech daily cron error:", error);
    return NextResponse.json(
      { error: "Failed to process tech daily summary", details: String(error) },
      { status: 500 }
    );
  }
}
