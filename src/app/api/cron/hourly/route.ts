import { NextRequest, NextResponse } from "next/server";
import { fetchWarNews } from "@/lib/rss";
import { summarizeRSSArticles, directNewsQuery } from "@/lib/gemini";
import { insertLiveUpdate, cacheRSSItem, getUnprocessedRSSItems, markRSSItemsProcessed } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Verify cron secret for production
  const secret = request.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    // Allow without secret in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // Step 1: Try RSS feeds first
    const rssArticles = await fetchWarNews();
    
    let update;
    let source = "BBC News";

    if (rssArticles.length > 0) {
      // Cache RSS items
      for (const article of rssArticles) {
        cacheRSSItem(
          article.guid,
          article.title,
          article.link,
          article.pubDate,
          article.content
        );
      }

      // Get unprocessed items
      const unprocessed = getUnprocessedRSSItems();

      if (unprocessed.length > 0) {
        // Summarize with Gemini
        update = await summarizeRSSArticles(
          unprocessed.map((item) => ({
            title: item.title,
            content: item.content,
            link: item.link,
          }))
        );
        
        // Mark as processed
        markRSSItemsProcessed(unprocessed.map((item) => item.id));
        source = "BBC News";
      } else {
        // All articles already processed, use Gemini as backup
        update = await directNewsQuery();
        source = "AI Intelligence Brief";
      }
    } else {
      // No RSS articles found — use Gemini as backup
      update = await directNewsQuery();
      source = "AI Intelligence Brief";
    }

    // Store in database
    const dbEntry = insertLiveUpdate(
      update.summary,
      source,
      update.severity,
      JSON.stringify(update.bulletPoints)
    );

    return NextResponse.json({
      success: true,
      source,
      rssArticlesFound: rssArticles.length,
      update: dbEntry,
    });
  } catch (error) {
    console.error("Hourly cron error:", error);
    return NextResponse.json(
      { error: "Failed to process hourly update", details: String(error) },
      { status: 500 }
    );
  }
}
