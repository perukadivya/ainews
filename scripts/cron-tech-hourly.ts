import { fetchTechNews } from "@/lib/rss-tech";
import { summarizeTechArticles, directTechNewsQuery } from "@/lib/gemini";
import {
  insertTechUpdate,
  cacheTechRSSItem,
  getUnprocessedTechRSSItems,
  markTechRSSItemsProcessed,
  getTechUpdates,
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
  console.log(`Flushing ${pendingUpdates.length} pending tech updates before shutdown...`);
  for (const update of pendingUpdates) {
    try {
      await insertTechUpdate(update.summary, update.source, update.category, update.bulletPoints, update.link);
      console.log(`  ✓ Flushed: ${update.summary.substring(0, 60)}...`);
    } catch (err) {
      console.error(`  ✗ Failed to flush update:`, err);
    }
  }
  pendingUpdates = [];
}

async function run() {
  console.log("Starting hourly tech update...");

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
    const { articles: rssArticles, feedHealth } = await fetchTechNews();

    let updates = [];
    let source = "Tech RSS";

    if (rssArticles.length > 0) {
      for (const article of rssArticles) {
        await cacheTechRSSItem(
          article.guid,
          article.title,
          article.link,
          article.pubDate,
          article.content
        );
      }

      const allUnprocessed = await getUnprocessedTechRSSItems();
      const unprocessed = allUnprocessed.slice(0, 10);

      if (unprocessed.length > 0) {
        updates = await summarizeTechArticles(
          unprocessed.map((item) => ({
            title: item.title,
            content: item.content,
            link: item.link,
          }))
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

        // Track as pending so timeout handler can flush if we get killed
        pendingUpdates.push({
          summary: update.summary,
          source: update.source || source,
          category: update.category || "general",
          bulletPoints: JSON.stringify(update.bulletPoints),
          link: update.link || null,
        });

        const dbEntry = await insertTechUpdate(
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

    console.log("Successfully completed tech hourly update", {
      source,
      rssArticlesFound: rssArticles.length,
      updatesGenerated: dbEntries.length,
      skippedDuplicates,
      feedHealth
    });

    process.exit(0);
  } catch (error) {
    console.error("Tech hourly cron error:", error);
    await flushPendingUpdates();
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
