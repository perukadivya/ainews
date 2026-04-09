import { fetchWarNews } from "@/lib/rss";
import { summarizeRSSArticles, directNewsQuery } from "@/lib/gemini";
import {
  insertLiveUpdate,
  cacheRSSItem,
  getUnprocessedRSSItems,
  markRSSItemsProcessed,
  getLiveUpdates,
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
  return maxLen > 0 && shared / maxLen > 0.7; // 70% word overlap = duplicate
}

async function run() {
  console.log("Starting hourly war update...");
  try {
    const { articles: rssArticles, feedHealth } = await fetchWarNews();

    let updates = [];
    let source = "BBC News";

    if (rssArticles.length > 0) {
      for (const article of rssArticles) {
        await cacheRSSItem(
          article.guid,
          article.title,
          article.link,
          article.pubDate,
          article.content
        );
      }

      const allUnprocessed = await getUnprocessedRSSItems();
      const unprocessed = allUnprocessed.slice(0, 10);

      if (unprocessed.length > 0) {
        updates = await summarizeRSSArticles(
          unprocessed.map((item) => ({
            title: item.title,
            content: item.content,
            link: item.link,
          }))
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

        const dbEntry = await insertLiveUpdate(
          update.summary,
          update.source || source,
          update.severity,
          JSON.stringify(update.bulletPoints)
        );
        dbEntries.push(dbEntry);
      }
    }

    console.log("Successfully completed hourly update", {
      source,
      rssArticlesFound: rssArticles.length,
      updatesGenerated: dbEntries.length,
      skippedDuplicates,
      feedHealth
    });
  } catch (error) {
    console.error("Hourly cron error:", error);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
