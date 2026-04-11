import { generateDailyTop10, detectCountdowns } from "@/lib/gemini";
import {
  getLiveUpdates,
  insertDailySummary,
  getDailySummaries,
  insertCountdown,
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
  console.log("Starting daily war summary...");

  // Hard 9-minute timeout — kill process if it hangs
  const TIMEOUT_MS = 9 * 60 * 1000;
  const timeoutId = setTimeout(() => {
    console.error(`FATAL: Script exceeded ${TIMEOUT_MS / 60000} minute timeout. Force exiting.`);
    process.exit(1);
  }, TIMEOUT_MS);
  timeoutId.unref();

  try {
    const today = formatDateKey(new Date());

    const existing = await getDailySummaries(today);
    if (existing.length > 0) {
      console.log("War daily summaries already exist for today");
      return;
    }

    const todayUpdates = await getLiveUpdates(today, 100);

    const top10 = await withRetry(() => generateDailyTop10(todayUpdates));

    for (const item of top10) {
      await insertDailySummary(
        today,
        item.rank,
        item.title,
        item.summary,
        item.category
      );
    }

    const countdowns = await withRetry(() => detectCountdowns(todayUpdates));

    for (const cd of countdowns) {
      await insertCountdown(cd.title, cd.description, cd.targetTime);
    }

    console.log("Successfully completed daily war summary", {
      summariesCreated: top10.length,
      countdownsCreated: countdowns.length
    });
  } catch (error) {
    console.error("Daily cron error:", error);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
