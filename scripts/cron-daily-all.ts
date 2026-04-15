/**
 * Unified Daily Cron — Runs War, Tech, and Finance daily summaries sequentially.
 * Each section has a 30-minute gap to avoid Gemini API rate limits.
 * Timeout: 45 min total (3 sections × ~15 min each, but typically much faster).
 */

// ====== IMPORTS ======
import {
  generateDailyTop10,
  detectCountdowns,
  generateTechDailyTop10,
  detectTechCountdowns,
  generateFinanceDailyTop10,
  detectFinanceCountdowns,
} from "@/lib/gemini";
import {
  // War
  getLiveUpdates,
  insertDailySummary,
  getDailySummaries,
  insertCountdown,
  // Tech
  getTechUpdates,
  insertTechDailySummary,
  getTechDailySummaries,
  insertTechCountdown,
  // Finance
  getFinanceUpdates,
  insertFinanceDailySummary,
  getFinanceDailySummaries,
  insertFinanceCountdown,
} from "@/lib/db";
import { formatDateKey } from "@/lib/utils";

// ====== HELPERS ======

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
        const retryDelay = initialDelay * Math.pow(2, attempt);
        console.warn(`  Attempt ${attempt + 1} failed, retrying in ${Math.round(retryDelay / 1000)}s...`, error);
        await delay(retryDelay);
      }
    }
  }
  throw lastError;
}

// ====== WAR SECTION ======

async function runWarDaily(): Promise<{ success: boolean; summaries: number; countdowns: number }> {
  console.log("\n═══════════════════════════════════════");
  console.log("📡 [1/3] WAR & CONFLICTS — Daily Summary");
  console.log("═══════════════════════════════════════");

  try {
    const today = formatDateKey(new Date());

    const existing = await getDailySummaries(today);
    if (existing.length > 0) {
      console.log("  ⏭️  War daily summaries already exist for today — skipping");
      return { success: true, summaries: existing.length, countdowns: 0 };
    }

    const todayUpdates = await getLiveUpdates(today, 100);
    const top10 = await withRetry(() => generateDailyTop10(todayUpdates));

    for (const item of top10) {
      await insertDailySummary(today, item.rank, item.title, item.summary, item.category);
    }

    let countdownCount = 0;
    try {
      const countdowns = await withRetry(() => detectCountdowns(todayUpdates));
      for (const cd of countdowns) {
        await insertCountdown(cd.title, cd.description, cd.targetTime);
      }
      countdownCount = countdowns.length;
    } catch (e) {
      console.error("  ⚠️  Failed to detect war countdowns:", e);
    }

    console.log(`  ✅ War: ${top10.length} summaries, ${countdownCount} countdowns`);
    return { success: true, summaries: top10.length, countdowns: countdownCount };
  } catch (error) {
    console.error("  ❌ War daily failed:", error);
    return { success: false, summaries: 0, countdowns: 0 };
  }
}

// ====== TECH SECTION ======

async function runTechDaily(): Promise<{ success: boolean; summaries: number; countdowns: number }> {
  console.log("\n═══════════════════════════════════════");
  console.log("⚡ [2/3] TECH & AI — Daily Summary");
  console.log("═══════════════════════════════════════");

  try {
    const today = formatDateKey(new Date());

    const existing = await getTechDailySummaries(today);
    if (existing.length > 0) {
      console.log("  ⏭️  Tech daily summaries already exist for today — skipping");
      return { success: true, summaries: existing.length, countdowns: 0 };
    }

    const todayUpdates = await getTechUpdates(today, 100);
    const top10 = await withRetry(() => generateTechDailyTop10(todayUpdates));

    for (const item of top10) {
      await insertTechDailySummary(today, item.rank, item.title, item.summary, item.category);
    }

    let countdownCount = 0;
    try {
      const countdowns = await withRetry(() => detectTechCountdowns(todayUpdates));
      for (const cd of countdowns) {
        await insertTechCountdown(cd.title, cd.description, cd.time, cd.emoji || "🚀", cd.type || "upcoming");
      }
      countdownCount = countdowns.length;
    } catch (e) {
      console.error("  ⚠️  Failed to detect tech countdowns:", e);
    }

    console.log(`  ✅ Tech: ${top10.length} summaries, ${countdownCount} countdowns`);
    return { success: true, summaries: top10.length, countdowns: countdownCount };
  } catch (error) {
    console.error("  ❌ Tech daily failed:", error);
    return { success: false, summaries: 0, countdowns: 0 };
  }
}

// ====== FINANCE SECTION ======

async function runFinanceDaily(): Promise<{ success: boolean; summaries: number; countdowns: number }> {
  console.log("\n═══════════════════════════════════════");
  console.log("📈 [3/3] FINANCE & MARKETS — Daily Summary");
  console.log("═══════════════════════════════════════");

  try {
    const today = formatDateKey(new Date());

    const existing = await getFinanceDailySummaries(today);
    if (existing.length > 0) {
      console.log("  ⏭️  Finance daily summaries already exist for today — skipping");
      return { success: true, summaries: existing.length, countdowns: 0 };
    }

    const todayUpdates = await getFinanceUpdates(today, 100);
    const top10 = await withRetry(() => generateFinanceDailyTop10(todayUpdates));

    for (const item of top10) {
      await insertFinanceDailySummary(today, item.rank, item.title, item.summary, item.category);
    }

    let countdownCount = 0;
    try {
      const countdowns = await withRetry(() => detectFinanceCountdowns(todayUpdates));
      for (const cd of countdowns) {
        await insertFinanceCountdown(cd.title, cd.description, cd.time, cd.emoji || "📊", cd.type || "upcoming");
      }
      countdownCount = countdowns.length;
    } catch (e) {
      console.error("  ⚠️  Failed to detect finance countdowns:", e);
    }

    console.log(`  ✅ Finance: ${top10.length} summaries, ${countdownCount} countdowns`);
    return { success: true, summaries: top10.length, countdowns: countdownCount };
  } catch (error) {
    console.error("  ❌ Finance daily failed:", error);
    return { success: false, summaries: 0, countdowns: 0 };
  }
}

// ====== MAIN ======

async function run() {
  console.log("╔═══════════════════════════════════════════╗");
  console.log("║   AINews Unified Daily Cron               ║");
  console.log(`║   ${new Date().toISOString()}       ║`);
  console.log("╚═══════════════════════════════════════════╝");

  // Hard 45-minute timeout for the entire run
  const TIMEOUT_MS = 45 * 60 * 1000;
  const timeoutId = setTimeout(() => {
    console.error(`\nFATAL: Script exceeded ${TIMEOUT_MS / 60000} minute timeout. Force exiting.`);
    process.exit(1);
  }, TIMEOUT_MS);
  timeoutId.unref();

  const results: Record<string, { success: boolean; summaries: number; countdowns: number }> = {};

  // Run sequentially with 30-MINUTE gaps between each to avoid Gemini API rate limits
  results.war = await runWarDaily();
  console.log("\n  ⏳ Waiting 30 minutes before next section (API rate limit cooldown)...\n");
  await delay(30 * 60 * 1000); // 30 minutes

  results.tech = await runTechDaily();
  console.log("\n  ⏳ Waiting 30 minutes before next section (API rate limit cooldown)...\n");
  await delay(30 * 60 * 1000); // 30 minutes

  results.finance = await runFinanceDaily();

  // Summary
  clearTimeout(timeoutId);

  console.log("\n╔═══════════════════════════════════════════╗");
  console.log("║   DAILY CRON — SUMMARY                    ║");
  console.log("╠═══════════════════════════════════════════╣");
  for (const [section, result] of Object.entries(results)) {
    const icon = result.success ? "✅" : "❌";
    console.log(`║  ${icon} ${section.toUpperCase().padEnd(10)} ${String(result.summaries).padStart(2)} summaries, ${String(result.countdowns).padStart(2)} countdowns ║`);
  }
  console.log("╚═══════════════════════════════════════════╝");

  const allFailed = Object.values(results).every((r) => !r.success);
  process.exit(allFailed ? 1 : 0);
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
