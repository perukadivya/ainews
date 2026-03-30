import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "AINews/1.0 (War & Conflict Tracker)",
  },
});

// RSS feeds — broad world/conflict coverage
const RSS_FEEDS = [
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

function isWarRelated(title: string, content: string): boolean {
  const text = `${title} ${content}`.toLowerCase();
  return WAR_KEYWORDS.some((keyword) => text.includes(keyword));
}

/**
 * Fetch and filter war/conflict related articles from RSS feeds
 */
export async function fetchWarNews(): Promise<RSSArticle[]> {
  const allArticles: RSSArticle[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);

      for (const item of parsed.items || []) {
        const title = item.title || "";
        const content = item.contentSnippet || item.content || "";
        const link = item.link || "";
        const pubDate = item.pubDate || new Date().toISOString();
        const guid = item.guid || item.link || `${feed.name}-${Date.now()}`;

        if (isWarRelated(title, content)) {
          allArticles.push({
            title,
            content: content.substring(0, 2000),
            link,
            pubDate,
            guid,
            source: feed.name,
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching RSS feed ${feed.name}:`, error);
    }
  }

  // Sort by date (newest first) and limit
  allArticles.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  return allArticles.slice(0, 15); // Return top 15 most recent
}
