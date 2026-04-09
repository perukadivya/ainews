import { NextRequest, NextResponse } from "next/server";
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

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Max allowed for Vercel Hobby

/**
 * Simple content similarity check to prevent duplicate updates
 */
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

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // Step 1: Try RSS feeds first
    const { articles: rssArticles, feedHealth } = await fetchTechNews();

    let updates = [];
    let source = "Tech RSS";

    if (rssArticles.length > 0) {
      // Cache RSS items
      for (const article of rssArticles) {
        await cacheTechRSSItem(
          article.guid,
          article.title,
          article.link,
          article.pubDate,
          article.content
        );
      }

      // Get unprocessed items
      const allUnprocessed = await getUnprocessedTechRSSItems();
      // Limit to 10 articles per run to prevent 504 Function Timeouts
      const unprocessed = allUnprocessed.slice(0, 10);

      if (unprocessed.length > 0) {
        // Summarize with Gemini
        updates = await summarizeTechArticles(
          unprocessed.map((item) => ({
            title: item.title,
            content: item.content,
            link: item.link,
          }))
        );

        // Mark as processed
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

    // Get recent updates for duplicate detection
    const today = formatDateKey(new Date());
    const recentUpdates = await getTechUpdates(today, 20);

    // Store in database (with duplicate detection)
    const dbEntries = [];
    let skippedDuplicates = 0;

    for (const update of updates) {
      if (update && update.summary) {
        // Check for duplicates against recent entries
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

    return NextResponse.json({
      success: true,
      source,
      rssArticlesFound: rssArticles.length,
      updatesGenerated: dbEntries.length,
      skippedDuplicates,
      feedHealth,
      updates: dbEntries,
    });
  } catch (error) {
    console.error("Tech cron error:", error);
    return NextResponse.json(
      { error: "Failed to process tech update", details: String(error) },
      { status: 500 }
    );
  }
}
