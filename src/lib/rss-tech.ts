import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "AINews/1.0 (Tech News Tracker)",
  },
});

// Tech-focused RSS feeds
const TECH_FEEDS = [
  // Major Tech News
  {
    url: "https://feeds.arstechnica.com/arstechnica/index",
    name: "Ars Technica",
  },
  {
    url: "https://www.theverge.com/rss/index.xml",
    name: "The Verge",
  },
  {
    url: "https://techcrunch.com/feed/",
    name: "TechCrunch",
  },
  {
    url: "https://www.wired.com/feed/rss",
    name: "WIRED",
  },
  // AI & Deep Tech
  {
    url: "https://feeds.feedburner.com/venturebeat/SZYF",
    name: "VentureBeat",
  },
  {
    url: "https://www.technologyreview.com/feed/",
    name: "MIT Tech Review",
  },
  // Hacker News (top stories)
  {
    url: "https://hnrss.org/frontpage",
    name: "Hacker News",
  },
];

// Tech keywords to filter relevant articles
const TECH_KEYWORDS = [
  // AI & ML
  "artificial intelligence",
  "machine learning",
  "deep learning",
  "neural network",
  "large language model",
  "llm",
  "chatgpt",
  "openai",
  "google ai",
  "gemini",
  "claude",
  "anthropic",
  "generative ai",
  "gen ai",
  "gpt",
  "transformer",
  "diffusion model",
  "computer vision",
  "autonomous",
  // Software & Cloud
  "software",
  "open source",
  "github",
  "developer",
  "programming",
  "api",
  "cloud computing",
  "aws",
  "azure",
  "kubernetes",
  "docker",
  "devops",
  "saas",
  "startup",
  "silicon valley",
  // Hardware & Chips
  "semiconductor",
  "chip",
  "nvidia",
  "amd",
  "intel",
  "apple",
  "qualcomm",
  "tsmc",
  "quantum computing",
  "gpu",
  "processor",
  // Crypto / Web3
  "cryptocurrency",
  "bitcoin",
  "ethereum",
  "blockchain",
  "web3",
  "defi",
  "nft",
  // Cybersecurity
  "cybersecurity",
  "data breach",
  "ransomware",
  "hacking",
  "vulnerability",
  "zero-day",
  "malware",
  "phishing",
  "encryption",
  "privacy",
  // Big Tech
  "google",
  "meta",
  "microsoft",
  "amazon",
  "tesla",
  "spacex",
  "elon musk",
  "tim cook",
  "satya nadella",
  "sundar pichai",
  "sam altman",
  "mark zuckerberg",
  // Emerging Tech
  "robotics",
  "self-driving",
  "electric vehicle",
  "ev",
  "battery",
  "5g",
  "6g",
  "iot",
  "augmented reality",
  "virtual reality",
  "metaverse",
  "ar",
  "vr",
  "mixed reality",
  "wearable",
  "biotech",
  "crispr",
  // Industry trends
  "tech layoff",
  "funding",
  "ipo",
  "acquisition",
  "antitrust",
  "regulation",
  "tech policy",
];

export interface TechRSSArticle {
  title: string;
  content: string;
  link: string;
  pubDate: string;
  guid: string;
  source: string;
}

export interface TechFeedHealth {
  name: string;
  status: "success" | "error";
  articleCount: number;
  error?: string;
}

function isTechRelated(title: string, content: string): boolean {
  const text = `${title} ${content}`.toLowerCase();
  return TECH_KEYWORDS.some((keyword) => text.includes(keyword));
}

function areTitlesSimilar(a: string, b: string): boolean {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  const wordsA = new Set(normalize(a).split(/\s+/));
  const wordsB = new Set(normalize(b).split(/\s+/));

  let shared = 0;
  for (const word of wordsA) {
    if (wordsB.has(word) && word.length > 2) shared++;
  }

  const maxLen = Math.max(wordsA.size, wordsB.size);
  return maxLen > 0 && shared / maxLen > 0.6;
}

/**
 * Fetch and filter tech-related articles from RSS feeds
 */
export async function fetchTechNews(): Promise<{
  articles: TechRSSArticle[];
  feedHealth: TechFeedHealth[];
}> {
  const feedHealth: TechFeedHealth[] = [];

  const results = await Promise.allSettled(
    TECH_FEEDS.map(async (feed) => {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Strict 8s timeout")), 8000)
        );

        const parsed = await Promise.race([
          parser.parseURL(feed.url),
          timeoutPromise,
        ]);
        
        const articles: TechRSSArticle[] = [];

        for (const item of parsed.items || []) {
          const title = item.title || "";
          const content = item.contentSnippet || item.content || "";
          const link = item.link || "";
          const pubDate = item.pubDate || new Date().toISOString();
          const guid =
            item.guid || item.link || `${feed.name}-${Date.now()}`;

          if (isTechRelated(title, content)) {
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
        console.error(`Error fetching tech RSS feed ${feed.name}:`, error);
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

  const allArticles: TechRSSArticle[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allArticles.push(...result.value);
    }
  }

  // Deduplicate by title similarity
  const deduplicated: TechRSSArticle[] = [];
  for (const article of allArticles) {
    const isDup = deduplicated.some((existing) =>
      areTitlesSimilar(existing.title, article.title)
    );
    if (!isDup) {
      deduplicated.push(article);
    }
  }

  // Sort by date (newest first)
  deduplicated.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  return {
    articles: deduplicated.slice(0, 25),
    feedHealth,
  };
}
