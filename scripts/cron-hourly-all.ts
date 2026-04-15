/**
 * Unified Hourly Cron — Runs War, Tech, and Finance updates sequentially.
 * Each section runs independently; if one fails, the others still execute.
 * Timeout: 15 min total (plenty of room for 3 sections).
 */

// ====== IMPORTS ======
import { fetchWarNews } from "@/lib/rss";
import { fetchTechNews } from "@/lib/rss-tech";
import { fetchFinanceNews } from "@/lib/rss-finance";
import {
  summarizeRSSArticles,
  directNewsQuery,
  summarizeTechArticles,
  directTechNewsQuery,
  summarizeFinanceArticles,
  directFinanceQuery,
} from "@/lib/gemini";
import {
  // War
  insertLiveUpdate,
  cacheRSSItem,
  getUnprocessedRSSItems,
  markRSSItemsProcessed,
  getLiveUpdates,
  // Tech
  insertTechUpdate,
  cacheTechRSSItem,
  getUnprocessedTechRSSItems,
  markTechRSSItemsProcessed,
  getTechUpdates,
  // Finance
  insertFinanceUpdate,
  cacheFinanceRSSItem,
  getUnprocessedFinanceRSSItems,
  markFinanceRSSItemsProcessed,
  getFinanceUpdates,
} from "@/lib/db";
import { formatDateKey } from "@/lib/utils";

// ====== HELPERS ======

function isContentSimilar(a: string, b: string): boolean {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  const wordsA = new Set(normalize(a).split(/\s+/));
  const wordsB = new Set(normalize(b).split(/\s+/));

  let shared = 0;
  for (const word of wordsA) {
    if (wordsB.has(word) && word.length > 2) shared++;
  }

  const maxLen = Math.max(wordsA.size, wordsB.size);
  return maxLen > 0 && shared / maxLen > 0.7;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ====== WAR SECTION ======

async function runWarHourly(): Promise<{ success: boolean; count: number }> {
  console.log("\n═══════════════════════════════════════");
  console.log("📡 [1/3] WAR & CONFLICTS — Hourly Update");
  console.log("═══════════════════════════════════════");

  try {
    const { articles: rssArticles, feedHealth } = await fetchWarNews();

    let updates: any[] = [];
    let source = "BBC News";

    if (rssArticles.length > 0) {
      for (const article of rssArticles) {
        await cacheRSSItem(article.guid, article.title, article.link, article.pubDate, article.content);
      }

      const allUnprocessed = await getUnprocessedRSSItems();
      const unprocessed = allUnprocessed.slice(0, 10);

      if (unprocessed.length > 0) {
        updates = await summarizeRSSArticles(
          unprocessed.map((item) => ({ title: item.title, content: item.content, link: item.link }))
        );
        await markRSSItemsProcessed(unprocessed.map((item) => item.id));
        source = "Multi-Source RSS";
      } else {
        updates = await directNewsQuery();
        source = "AI Intelligence Brief";
      }
    } else {
      updates = await directNewsQuery();
      source = "AI Intelligence Brief";
    }

    const today = formatDateKey(new Date());
    const recentUpdates = await getLiveUpdates(today, 20);
    let inserted = 0;
    let skipped = 0;

    for (const update of updates) {
      if (update && update.summary) {
        if (recentUpdates.some((e) => isContentSimilar(e.content, update.summary))) {
          skipped++;
          continue;
        }
        await insertLiveUpdate(update.summary, update.source || source, update.severity, JSON.stringify(update.bulletPoints));
        inserted++;
      }
    }

    console.log(`  ✅ War: ${inserted} inserted, ${skipped} skipped, ${rssArticles.length} RSS articles`);
    return { success: true, count: inserted };
  } catch (error) {
    console.error("  ❌ War hourly failed:", error);
    return { success: false, count: 0 };
  }
}

// ====== TECH SECTION ======

async function runTechHourly(): Promise<{ success: boolean; count: number }> {
  console.log("\n═══════════════════════════════════════");
  console.log("⚡ [2/3] TECH & AI — Hourly Update");
  console.log("═══════════════════════════════════════");

  try {
    const { articles: rssArticles, feedHealth } = await fetchTechNews();

    let updates: any[] = [];
    let source = "Tech RSS";

    if (rssArticles.length > 0) {
      for (const article of rssArticles) {
        await cacheTechRSSItem(article.guid, article.title, article.link, article.pubDate, article.content);
      }

      const allUnprocessed = await getUnprocessedTechRSSItems();
      const unprocessed = allUnprocessed.slice(0, 10);

      if (unprocessed.length > 0) {
        updates = await summarizeTechArticles(
          unprocessed.map((item) => ({ title: item.title, content: item.content, link: item.link }))
        );
        await markTechRSSItemsProcessed(unprocessed.map((item) => item.id));
        source = "Multi-Source Tech RSS";
      } else {
        updates = await directTechNewsQuery();
        source = "AI Tech Brief";
      }
    } else {
      updates = await directTechNewsQuery();
      source = "AI Tech Brief";
    }

    const today = formatDateKey(new Date());
    const recentUpdates = await getTechUpdates(today, 20);
    let inserted = 0;
    let skipped = 0;

    for (const update of updates) {
      if (update && update.summary) {
        if (recentUpdates.some((e) => isContentSimilar(e.content, update.summary))) {
          skipped++;
          continue;
        }
        await insertTechUpdate(
          update.summary,
          update.source || source,
          update.category || "general",
          JSON.stringify(update.bulletPoints),
          update.link || null
        );
        inserted++;
      }
    }

    console.log(`  ✅ Tech: ${inserted} inserted, ${skipped} skipped, ${rssArticles.length} RSS articles`);
    return { success: true, count: inserted };
  } catch (error) {
    console.error("  ❌ Tech hourly failed:", error);
    return { success: false, count: 0 };
  }
}

// ====== FINANCE SECTION ======

async function runFinanceHourly(): Promise<{ success: boolean; count: number }> {
  console.log("\n═══════════════════════════════════════");
  console.log("📈 [3/3] FINANCE & MARKETS — Hourly Update");
  console.log("═══════════════════════════════════════");

  try {
    const { articles: rssArticles, feedHealth } = await fetchFinanceNews();

    let updates: any[] = [];
    let source = "Finance RSS";

    if (rssArticles.length > 0) {
      for (const article of rssArticles) {
        await cacheFinanceRSSItem(article.guid, article.title, article.link, article.pubDate, article.content);
      }

      const allUnprocessed = await getUnprocessedFinanceRSSItems();
      const unprocessed = allUnprocessed.slice(0, 10);

      if (unprocessed.length > 0) {
        updates = await summarizeFinanceArticles(
          unprocessed.map((item) => ({ title: item.title, content: item.content, link: item.link }))
        );
        await markFinanceRSSItemsProcessed(unprocessed.map((item) => item.id));
        source = "Multi-Source Finance RSS";
      } else {
        updates = await directFinanceQuery();
        source = "AI Finance Brief";
      }
    } else {
      updates = await directFinanceQuery();
      source = "AI Finance Brief";
    }

    const today = formatDateKey(new Date());
    const recentUpdates = await getFinanceUpdates(today, 20);
    let inserted = 0;
    let skipped = 0;

    for (const update of updates) {
      if (update && update.summary) {
        if (recentUpdates.some((e) => isContentSimilar(e.content, update.summary))) {
          skipped++;
          continue;
        }
        await insertFinanceUpdate(
          update.summary,
          update.source || source,
          update.category || "general",
          JSON.stringify(update.bulletPoints),
          update.link || null
        );
        inserted++;
      }
    }

    console.log(`  ✅ Finance: ${inserted} inserted, ${skipped} skipped, ${rssArticles.length} RSS articles`);
    return { success: true, count: inserted };
  } catch (error) {
    console.error("  ❌ Finance hourly failed:", error);
    return { success: false, count: 0 };
  }
}

// ====== MAIN ======

async function run() {
  console.log("╔═══════════════════════════════════════════╗");
  console.log("║   AINews Unified Hourly Cron              ║");
  console.log(`║   ${new Date().toISOString()}       ║`);
  console.log("╚═══════════════════════════════════════════╝");

  // Hard 15-minute timeout for the entire run
  const TIMEOUT_MS = 15 * 60 * 1000;
  const timeoutId = setTimeout(() => {
    console.error(`\nFATAL: Script exceeded ${TIMEOUT_MS / 60000} minute timeout. Force exiting.`);
    process.exit(1);
  }, TIMEOUT_MS);
  timeoutId.unref();

  const results: Record<string, { success: boolean; count: number }> = {};

  // Run sequentially with 30s gap between each to avoid API rate limits
  results.war = await runWarHourly();
  console.log("\n  ⏳ Waiting 30s before next section...\n");
  await delay(30000);

  results.tech = await runTechHourly();
  console.log("\n  ⏳ Waiting 30s before next section...\n");
  await delay(30000);

  results.finance = await runFinanceHourly();

  // Summary
  clearTimeout(timeoutId);

  console.log("\n╔═══════════════════════════════════════════╗");
  console.log("║   HOURLY CRON — SUMMARY                   ║");
  console.log("╠═══════════════════════════════════════════╣");
  for (const [section, result] of Object.entries(results)) {
    const icon = result.success ? "✅" : "❌";
    console.log(`║  ${icon} ${section.toUpperCase().padEnd(10)} ${String(result.count).padStart(3)} updates inserted  ║`);
  }
  console.log("╚═══════════════════════════════════════════╝");

  const allFailed = Object.values(results).every((r) => !r.success);
  process.exit(allFailed ? 1 : 0);
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
