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

async function run() {
  console.log("Starting hourly tech update...");

  // Hard 9-minute timeout — kill process if it hangs
  const TIMEOUT_MS = 9 * 60 * 1000;
  const timeoutId = setTimeout(() => {
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

        const dbEntry = await insertTechUpdate(
          update.summary,
          update.source || source,
          update.category || "general",
          JSON.stringify(update.bulletPoints),
          update.link || null
        );
        dbEntries.push(dbEntry);
      }
    }

    console.log("Successfully completed tech hourly update", {
      source,
      rssArticlesFound: rssArticles.length,
      updatesGenerated: dbEntries.length,
      skippedDuplicates,
      feedHealth
    });
  } catch (error) {
    console.error("Tech hourly cron error:", error);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
