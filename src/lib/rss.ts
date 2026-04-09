import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "AINews/1.0 (War & Conflict Tracker)",
  },
});

// RSS feeds — multi-source world/conflict coverage
const RSS_FEEDS = [
  // BBC
  {
    url: "http://feeds.bbci.co.uk/news/world/rss.xml",
    name: "BBC World",
  },
  {
    url: "http://feeds.bbci.co.uk/news/world/middle_east/rss.xml",
    name: "BBC Middle East",
  },
  {
    url: "http://feeds.bbci.co.uk/news/world/europe/rss.xml",
    name: "BBC Europe",
  },
  {
    url: "http://feeds.bbci.co.uk/news/world/asia/rss.xml",
    name: "BBC Asia",
  },
  {
    url: "http://feeds.bbci.co.uk/news/world/africa/rss.xml",
    name: "BBC Africa",
  },
  // Reuters
  {
    url: "https://www.reutersagency.com/feed/?taxonomy=best-sectors&post_type=best",
    name: "Reuters",
  },
  // Al Jazeera
  {
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    name: "Al Jazeera",
  },
  // AP News
  {
    url: "https://rsshub.app/apnews/topics/world-news",
    name: "AP News",
  },
];

// Keywords to filter war/conflict related articles globally
const WAR_KEYWORDS = [
  // General war terms
  "war",
  "conflict",
  "military",
  "airstrike",
  "air strike",
  "bombing",
  "missile",
  "drone strike",
  "casualties",
  "troops",
  "invasion",
  "offensive",
  "ceasefire",
  "cease-fire",
  "peace talks",
  "sanctions",
  "embargo",
  "weapons",
  "artillery",
  "shelling",
  "frontline",
  "front line",
  "battlefield",
  "combat",
  "insurgent",
  "militant",
  "guerrilla",
  "siege",
  "blockade",
  "escalation",
  "retaliation",
  "counterattack",
  "counter-attack",
  "warplane",
  "fighter jet",
  "naval",
  "submarine",
  "nuclear",
  "chemical weapon",
  "biological weapon",
  "arms deal",
  "defense minister",
  "defence minister",
  "pentagon",
  "nato",
  "un security council",
  "humanitarian crisis",
  "refugee",
  "displacement",
  "war crime",
  "genocide",
  "ethnic cleansing",
  // Iran / Middle East
  "iran",
  "tehran",
  "irgc",
  "epic fury",
  "strait of hormuz",
  "hezbollah",
  "houthi",
  "centcom",
  // Ukraine / Russia
  "ukraine",
  "kyiv",
  "kremlin",
  "donbas",
  "crimea",
  "zelenskyy",
  "zelensky",
  // Israel / Palestine
  "gaza",
  "hamas",
  "idf",
  "west bank",
  "netanyahu",
  // Sudan
  "sudan",
  "khartoum",
  "rsf",
  "rapid support forces",
  "darfur",
  // Myanmar
  "myanmar",
  "junta",
  // Other conflicts
  "taiwan strait",
  "south china sea",
  "north korea",
  "pyongyang",
  "syria",
  "yemen",
  "libya",
  "somalia",
  "al-shabaab",
  "isis",
  "taliban",
  "afghan",
];

export interface RSSArticle {
  title: string;
  content: string;
  link: string;
  pubDate: string;
  guid: string;
  source: string;
}

export interface FeedHealth {
  name: string;
  status: "success" | "error";
  articleCount: number;
  error?: string;
}

function isWarRelated(title: string, content: string): boolean {
  const text = `${title} ${content}`.toLowerCase();
  return WAR_KEYWORDS.some((keyword) => text.includes(keyword));
}

/**
 * Simple title similarity check for deduplication across sources
 */
function areTitlesSimilar(a: string, b: string): boolean {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  const wordsA = new Set(normalize(a).split(/\s+/));
  const wordsB = new Set(normalize(b).split(/\s+/));
  
  // Count shared words
  let shared = 0;
  for (const word of wordsA) {
    if (wordsB.has(word) && word.length > 2) shared++;
  }
  
  const maxLen = Math.max(wordsA.size, wordsB.size);
  return maxLen > 0 && shared / maxLen > 0.6; // 60% word overlap = duplicate
}

/**
 * Fetch and filter war/conflict related articles from RSS feeds
 * Uses Promise.allSettled for concurrent fetching
 */
export async function fetchWarNews(): Promise<{
  articles: RSSArticle[];
  feedHealth: FeedHealth[];
}> {
  const feedHealth: FeedHealth[] = [];

  // Fetch all feeds concurrently
  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      try {
        // Strict timeout wrapper
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Strict 8s timeout")), 8000)
        );

        const parsed = await Promise.race([
          parser.parseURL(feed.url),
          timeoutPromise,
        ]);
        
        const articles: RSSArticle[] = [];

        for (const item of parsed.items || []) {
          const title = item.title || "";
          const content = item.contentSnippet || item.content || "";
          const link = item.link || "";
          const pubDate = item.pubDate || new Date().toISOString();
          const guid =
            item.guid || item.link || `${feed.name}-${Date.now()}`;

          if (isWarRelated(title, content)) {
            articles.push({
              title,
              content: content.substring(0, 2000),
              link,
              pubDate,
              guid,
              source: feed.name,
            });
          }
        }

        feedHealth.push({
          name: feed.name,
          status: "success",
          articleCount: articles.length,
        });

        return articles;
      } catch (error) {
        console.error(`Error fetching RSS feed ${feed.name}:`, error);
        feedHealth.push({
          name: feed.name,
          status: "error",
          articleCount: 0,
          error: String(error),
        });
        return [];
      }
    })
  );

  // Collect all articles
  const allArticles: RSSArticle[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allArticles.push(...result.value);
    }
  }

  // Deduplicate by title similarity
  const deduplicated: RSSArticle[] = [];
  for (const article of allArticles) {
    const isDup = deduplicated.some((existing) =>
      areTitlesSimilar(existing.title, article.title)
    );
    if (!isDup) {
      deduplicated.push(article);
    }
  }

  // Sort by date (newest first) and limit
  deduplicated.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  return {
    articles: deduplicated.slice(0, 20), // Top 20 (increased from 15)
    feedHealth,
  };
}
