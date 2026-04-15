import { fetchFinanceNews } from "@/lib/rss-finance";
import { summarizeFinanceArticles, directFinanceQuery } from "@/lib/gemini";
import {
  insertFinanceUpdate,
  cacheFinanceRSSItem,
  getUnprocessedFinanceRSSItems,
  markFinanceRSSItemsProcessed,
  getFinanceUpdates,
} from "@/lib/db";
import { formatDateKey } from "@/lib/utils";

// --- Graceful shutdown state ---
let pendingUpdates: Array<{ summary: string; source: string; category: string; bulletPoints: string; link: string | null }> = [];
let flushedOnShutdown = false;

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

async function flushPendingUpdates() {
  if (flushedOnShutdown || pendingUpdates.length === 0) return;
  flushedOnShutdown = true;
  console.log(`Flushing ${pendingUpdates.length} pending finance updates before shutdown...`);
  for (const update of pendingUpdates) {
    try {
      await insertFinanceUpdate(update.summary, update.source, update.category, update.bulletPoints, update.link);
      console.log(`  ✓ Flushed: ${update.summary.substring(0, 60)}...`);
    } catch (err) {
      console.error(`  ✗ Failed to flush update:`, err);
    }
  }
  pendingUpdates = [];
}

async function run() {
  console.log("Starting hourly finance update...");

  // Hard 8-minute timeout — flush pending data, then force exit
  const TIMEOUT_MS = 8 * 60 * 1000;
  const timeoutId = setTimeout(async () => {
    console.warn(`WARNING: Script approaching timeout. Flushing data before exit...`);
    await flushPendingUpdates();
    console.error(`FATAL: Script exceeded ${TIMEOUT_MS / 60000} minute timeout. Force exiting.`);
    process.exit(1);
  }, TIMEOUT_MS);
  timeoutId.unref();

  try {
    const { articles: rssArticles, feedHealth } = await fetchFinanceNews();

    let updates = [];
    let source = "Finance RSS";

    if (rssArticles.length > 0) {
      for (const article of rssArticles) {
        await cacheFinanceRSSItem(
          article.guid,
          article.title,
          article.link,
          article.pubDate,
          article.content
        );
      }

      const allUnprocessed = await getUnprocessedFinanceRSSItems();
      const unprocessed = allUnprocessed.slice(0, 10);

      if (unprocessed.length > 0) {
        updates = await summarizeFinanceArticles(
          unprocessed.map((item) => ({
            title: item.title,
            content: item.content,
            link: item.link,
          }))
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

    const dbEntries = [];
    let skippedDuplicates = 0;

    for (const update of updates) {
      if (update && update.summary) {
        const isDuplicate = recentUpdates.some((existing) =>
          isContentSimilar(existing.content, update.summary)
        );

        if (isDuplicate) {
          skippedDuplicates++;
          continue;
        }

        pendingUpdates.push({
          summary: update.summary,
          source: update.source || source,
          category: update.category || "general",
          bulletPoints: JSON.stringify(update.bulletPoints),
          link: update.link || null,
        });

        const dbEntry = await insertFinanceUpdate(
          update.summary,
          update.source || source,
          update.category || "general",
          JSON.stringify(update.bulletPoints),
          update.link || null
        );
        dbEntries.push(dbEntry);

        // Successfully written — remove from pending
        pendingUpdates.pop();
      }
    }

    // Clear timeout — we finished successfully
    clearTimeout(timeoutId);

    console.log("Successfully completed finance hourly update", {
      source,
      rssArticlesFound: rssArticles.length,
      updatesGenerated: dbEntries.length,
      skippedDuplicates,
      feedHealth
    });

    process.exit(0);
  } catch (error) {
    console.error("Finance hourly cron error:", error);
    await flushPendingUpdates();
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
