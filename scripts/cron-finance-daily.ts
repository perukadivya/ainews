import { generateFinanceDailyTop10, detectFinanceCountdowns } from "@/lib/gemini";
import {
  getFinanceUpdates,
  insertFinanceDailySummary,
  getFinanceDailySummaries,
  insertFinanceCountdown,
} from "@/lib/db";
import { formatDateKey } from "@/lib/utils";

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 90000
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
  console.log("Starting daily finance summary...");

  // Hard 15-minute timeout — kill process if it hangs
  const TIMEOUT_MS = 15 * 60 * 1000;
  const timeoutId = setTimeout(() => {
    console.error(`FATAL: Script exceeded ${TIMEOUT_MS / 60000} minute timeout. Force exiting.`);
    process.exit(1);
  }, TIMEOUT_MS);
  timeoutId.unref();

  try {
    const today = formatDateKey(new Date());

    const existing = await getFinanceDailySummaries(today);
    if (existing.length > 0) {
      console.log("Finance daily summaries already exist for today");
      return;
    }

    const todayUpdates = await getFinanceUpdates(today, 100);

    const top10 = await withRetry(() => generateFinanceDailyTop10(todayUpdates));

    for (const item of top10) {
      await insertFinanceDailySummary(
        today,
        item.rank,
        item.title,
        item.summary,
        item.category
      );
    }

    console.log("Successfully completed daily finance summary", {
      summariesCreated: top10.length,
    });

    try {
      const countdowns = await withRetry(() => detectFinanceCountdowns(todayUpdates));
      for (const cd of countdowns) {
        await insertFinanceCountdown(
          cd.title,
          cd.description,
          cd.time,
          cd.emoji || "📊",
          cd.type || "upcoming"
        );
      }
      console.log(`Successfully added ${countdowns.length} finance events/countdowns`);
    } catch (e) {
      console.error("Failed to detect finance countdowns:", e);
    }
  } catch (error) {
    console.error("Finance daily cron error:", error);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
