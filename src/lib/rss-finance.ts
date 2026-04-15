import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "AINews/1.0 (Finance & Markets Tracker)",
  },
});

// Finance-focused RSS feeds
const FINANCE_FEEDS = [
  // Bloomberg
  {
    url: "https://feeds.bloomberg.com/markets/news.rss",
    name: "Bloomberg Markets",
  },
  {
    url: "https://feeds.bloomberg.com/economics/news.rss",
    name: "Bloomberg Economics",
  },
  // CNBC
  {
    url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664",
    name: "CNBC Finance",
  },
  {
    url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258",
    name: "CNBC Markets",
  },
  // MarketWatch
  {
    url: "https://feeds.marketwatch.com/marketwatch/topstories/",
    name: "MarketWatch",
  },
  // Financial Times (via Google News RSS fallback)
  {
    url: "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en",
    name: "Google Finance",
  },
  // Nasdaq
  {
    url: "https://www.nasdaq.com/feed/rssoutbound?category=Markets",
    name: "Nasdaq",
  },
];

// Finance keywords to filter relevant articles
const FINANCE_KEYWORDS = [
  // Markets
  "stock market",
  "stock exchange",
  "s&p 500",
  "s&p500",
  "nasdaq",
  "dow jones",
  "wall street",
  "bull market",
  "bear market",
  "trading",
  "rally",
  "selloff",
  "sell-off",
  "correction",
  "volatility",
  "market cap",
  "index fund",
  "etf",
  // Central Banks & Monetary Policy
  "federal reserve",
  "interest rate",
  "rate cut",
  "rate hike",
  "monetary policy",
  "inflation",
  "deflation",
  "quantitative easing",
  "quantitative tightening",
  "treasury",
  "bond",
  "yield",
  "ecb",
  "bank of japan",
  "bank of england",
  "central bank",
  "fomc",
  "fed chair",
  "powell",
  // Commodities
  "oil price",
  "crude oil",
  "brent",
  "wti",
  "gold price",
  "silver",
  "natural gas",
  "commodity",
  "opec",
  // Crypto
  "bitcoin",
  "ethereum",
  "cryptocurrency",
  "crypto",
  "blockchain",
  "stablecoin",
  "defi",
  "coinbase",
  "binance",
  // Corporate Finance
  "earnings",
  "revenue",
  "profit",
  "quarterly results",
  "ipo",
  "initial public offering",
  "merger",
  "acquisition",
  "takeover",
  "buyout",
  "dividend",
  "stock split",
  "buyback",
  "share repurchase",
  // Economy
  "gdp",
  "jobs report",
  "unemployment",
  "consumer spending",
  "retail sales",
  "cpi",
  "pce",
  "recession",
  "economic growth",
  "trade deficit",
  "tariff",
  "sanctions",
  // Regulation
  "sec",
  "securities",
  "regulation",
  "compliance",
  "antitrust",
  "financial regulation",
  // Forex
  "forex",
  "exchange rate",
  "dollar",
  "euro",
  "yen",
  "yuan",
  "currency",
  // Companies (major market movers)
  "apple",
  "nvidia",
  "microsoft",
  "amazon",
  "alphabet",
  "google",
  "tesla",
  "meta",
  "berkshire",
  "jpmorgan",
  "goldman sachs",
  "morgan stanley",
  "bank of america",
  "blackrock",
];

export interface FinanceRSSArticle {
  title: string;
  content: string;
  link: string;
  pubDate: string;
  guid: string;
  source: string;
}

export interface FinanceFeedHealth {
  name: string;
  status: "success" | "error";
  articleCount: number;
  error?: string;
}

function isFinanceRelated(title: string, content: string): boolean {
  const text = `${title} ${content}`.toLowerCase();
  return FINANCE_KEYWORDS.some((keyword) => text.includes(keyword));
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
 * Fetch and filter finance-related articles from RSS feeds
 */
export async function fetchFinanceNews(): Promise<{
  articles: FinanceRSSArticle[];
  feedHealth: FinanceFeedHealth[];
}> {
  const feedHealth: FinanceFeedHealth[] = [];

  const results = await Promise.allSettled(
    FINANCE_FEEDS.map(async (feed) => {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Strict 8s timeout")), 8000)
        );

        const parsed = await Promise.race([
          parser.parseURL(feed.url),
          timeoutPromise,
        ]);
        
        const articles: FinanceRSSArticle[] = [];

        for (const item of parsed.items || []) {
          const title = item.title || "";
          const content = item.contentSnippet || item.content || "";
          const link = item.link || "";
          const pubDate = item.pubDate || new Date().toISOString();
          const guid =
            item.guid || item.link || `${feed.name}-${Date.now()}`;

          if (isFinanceRelated(title, content)) {
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
        console.error(`Error fetching finance RSS feed ${feed.name}:`, error);
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

  const allArticles: FinanceRSSArticle[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allArticles.push(...result.value);
    }
  }

  // Deduplicate by title similarity
  const deduplicated: FinanceRSSArticle[] = [];
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
