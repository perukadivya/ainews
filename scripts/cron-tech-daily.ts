import { generateTechDailyTop10, detectTechCountdowns } from "@/lib/gemini";
import {
  getTechUpdates,
  insertTechDailySummary,
  getTechDailySummaries,
  insertTechCountdown,
} from "@/lib/db";
import { formatDateKey } from "@/lib/utils";

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

async function run() {
  console.log("Starting daily tech summary...");

  // Hard 9-minute timeout — kill process if it hangs
  const TIMEOUT_MS = 9 * 60 * 1000;
  const timeoutId = setTimeout(() => {
    console.error(`FATAL: Script exceeded ${TIMEOUT_MS / 60000} minute timeout. Force exiting.`);
    process.exit(1);
  }, TIMEOUT_MS);
  timeoutId.unref();

  try {
    const today = formatDateKey(new Date());

    const existing = await getTechDailySummaries(today);
    if (existing.length > 0) {
      console.log("Tech daily summaries already exist for today");
      return;
    }

    const todayUpdates = await getTechUpdates(today, 100);

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

    console.log("Successfully completed daily tech summary", {
      summariesCreated: top10.length,
    });

    try {
      const countdowns = await withRetry(() => detectTechCountdowns(todayUpdates));
      for (const cd of countdowns) {
        await insertTechCountdown(
          cd.title,
          cd.description,
          cd.time,
          cd.emoji || "🚀",
          cd.type || "upcoming"
        );
      }
      console.log(`Successfully added ${countdowns.length} tech events/countdowns`);
    } catch (e) {
      console.error("Failed to detect tech countdowns:", e);
    }
  } catch (error) {
    console.error("Tech daily cron error:", error);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
