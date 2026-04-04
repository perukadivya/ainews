"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorBoundary } from "@/components/error-boundary";
import { useToast } from "@/components/toast-provider";
import { formatDateKey } from "@/lib/utils";

interface TechUpdate {
  id: number;
  timestamp: string;
  content: string;
  source: string;
  category: string;
  bullet_points: string | null;
  link: string | null;
  created_at: string;
}

type TechCategory =
  | "ai"
  | "cybersecurity"
  | "startups"
  | "hardware"
  | "software"
  | "crypto"
  | "policy"
  | "science"
  | "general";

const CATEGORY_CONFIG: Record<
  TechCategory,
  { label: string; emoji: string; color: string; bgColor: string; borderColor: string }
> = {
  ai: {
    label: "AI & ML",
    emoji: "🤖",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
  },
  cybersecurity: {
    label: "Security",
    emoji: "🛡️",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
  startups: {
    label: "Startups",
    emoji: "🚀",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  hardware: {
    label: "Hardware",
    emoji: "🔧",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  software: {
    label: "Software",
    emoji: "💻",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  crypto: {
    label: "Crypto",
    emoji: "₿",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  policy: {
    label: "Policy",
    emoji: "⚖️",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/30",
  },
  science: {
    label: "Science",
    emoji: "🔬",
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/30",
  },
  general: {
    label: "General",
    emoji: "📰",
    color: "text-gray-400",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/30",
  },
};

function TechUpdateCard({
  update,
  index,
  isNew,
}: {
  update: TechUpdate;
  index: number;
  isNew?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const category = (update.category as TechCategory) || "general";
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.general;

  let bulletPoints: string[] = [];
  if (update.bullet_points) {
    try {
      bulletPoints = JSON.parse(update.bullet_points);
    } catch {
      bulletPoints = [];
    }
  }

  const time = new Date(update.timestamp + "Z").toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article
      className="glass-card rounded-xl border border-white/5 card-hover animate-fade-in-up"
      style={{ animationDelay: `${index * 0.05}s` }}
      id={`tech-update-${update.id}`}
    >
      <div className="p-4 sm:p-5">
        {/* Top row: Category badge + time + NEW badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bgColor} ${config.color} border ${config.borderColor}`}
            >
              <span>{config.emoji}</span>
              {config.label}
            </span>
            {isNew && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-new-badge">
                NEW
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted font-mono">{time}</span>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed text-foreground/90 mb-3">
          {update.content}
        </p>

        {/* Bullet points (expandable) */}
        {bulletPoints.length > 0 && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[11px] text-muted-foreground hover:text-white transition-colors flex items-center gap-1 mb-2"
            >
              <svg
                className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              {expanded ? "Hide" : "Show"} details ({bulletPoints.length})
            </button>

            {expanded && (
              <ul className="space-y-1.5 pl-3 border-l-2 border-white/10 animate-expand">
                {bulletPoints.map((point, i) => (
                  <li
                    key={i}
                    className="text-xs text-muted-foreground flex items-start gap-2"
                  >
                    <span className={`mt-0.5 ${config.color}`}>▸</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {/* Footer: Source + Link */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <span className="text-[10px] text-muted font-mono">
            {update.source}
          </span>
          {update.link && (
            <a
              href={update.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
            >
              Read more
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function TechPage() {
  const [updates, setUpdates] = useState<TechUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState<TechCategory[]>([]);

  // Track new update IDs
  const [newUpdateIds, setNewUpdateIds] = useState<Set<number>>(new Set());
  const prevUpdateCountRef = useRef(0);

  const { addToast } = useToast();

  const fetchFeed = useCallback(
    async (showToasts = false) => {
      try {
        setFetchError(null);
        const today = formatDateKey(new Date());
        const res = await fetch(`/api/tech?date=${today}&limit=50`);
        if (!res.ok) throw new Error(`Tech API returned ${res.status}`);
        const data = await res.json();
        const newUpdates = data.updates || [];

        // Detect new updates
        if (
          showToasts &&
          prevUpdateCountRef.current > 0 &&
          newUpdates.length > prevUpdateCountRef.current
        ) {
          const newCount =
            newUpdates.length - prevUpdateCountRef.current;
          const newIds = new Set<number>(
            newUpdates
              .slice(0, newCount)
              .map((u: TechUpdate) => u.id)
          );
          setNewUpdateIds(newIds);

          addToast({
            message: `${newCount} new tech update${newCount > 1 ? "s" : ""} received`,
            severity: "info",
          });
        }

        prevUpdateCountRef.current = newUpdates.length;
        setUpdates(newUpdates);
      } catch (error) {
        console.error("Failed to fetch tech feed:", error);
        setFetchError("Failed to load tech updates. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  const triggerRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch("/api/cron/tech");
      await fetchFeed(true);
      setLastRefresh(new Date());
      addToast({
        message: "Tech feed refreshed successfully",
        severity: "info",
      });
    } catch (error) {
      console.error("Failed to trigger tech refresh:", error);
      addToast({
        message: "Tech refresh failed. Please try again.",
        severity: "BREAKING",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();

    // Auto-refresh every 5 minutes
    let interval: NodeJS.Timeout;

    const startInterval = () => {
      interval = setInterval(() => {
        fetchFeed(true);
        setLastRefresh(new Date());
      }, 5 * 60 * 1000);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        fetchFeed(true);
        startInterval();
      }
    };

    startInterval();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchFeed]);

  // Filter logic
  const filteredUpdates = updates.filter((u) => {
    const matchesSearch =
      searchQuery === "" ||
      u.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.source.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategories.length === 0 ||
      activeCategories.includes(u.category as TechCategory);

    return matchesSearch && matchesCategory;
  });

  const handleCategoryToggle = useCallback((category: TechCategory) => {
    setActiveCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }, []);

  // Category stats
  const categoryCounts = updates.reduce(
    (acc, u) => {
      const cat = (u.category as TechCategory) || "general";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LiveBlogPosting",
    headline: "AINews — Tech News Tracker",
    description:
      "Real-time technology news tracker covering AI, cybersecurity, startups, and more.",
    coverageStartTime: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <JsonLd structuredData={structuredData} />
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Tech <span className="text-gradient-cyan">News</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              AI • Cyber • Startups • Hardware • Software
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted font-mono hidden sm:block">
              Last refresh:{" "}
              {lastRefresh.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <button
              onClick={triggerRefresh}
              disabled={refreshing}
              className="group px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              id="tech-refresh-button"
            >
              {refreshing ? (
                <span className="flex items-center gap-1.5">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Fetching...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="group-hover:rotate-180 transition-transform duration-300">
                    ↻
                  </span>
                  Refresh Now
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Stats Ticker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="glass-card rounded-lg px-3 py-2.5 border border-white/5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              Today&apos;s Updates
            </p>
            <p className="text-lg font-bold font-mono tabular-nums text-foreground mt-0.5">
              {updates.length}
            </p>
          </div>
          <div className="glass-card rounded-lg px-3 py-2.5 border border-white/5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              AI & ML
            </p>
            <p className="text-lg font-bold font-mono tabular-nums text-violet-400 mt-0.5">
              {categoryCounts["ai"] || 0}
            </p>
          </div>
          <div className="glass-card rounded-lg px-3 py-2.5 border border-white/5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              Security
            </p>
            <p className="text-lg font-bold font-mono tabular-nums text-red-400 mt-0.5">
              {categoryCounts["cybersecurity"] || 0}
            </p>
          </div>
          <div className="glass-card rounded-lg px-3 py-2.5 border border-white/5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              Sources
            </p>
            <p className="text-lg font-bold font-mono tabular-nums text-foreground mt-0.5">
              {new Set(updates.map((u) => u.source)).size}
            </p>
          </div>
        </div>

        {/* Search & Category Filters */}
        <div className="glass-card rounded-xl p-4 border border-white/5 mb-6">
          {/* Search */}
          <div className="relative mb-3">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search tech news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 search-glow transition-all"
              id="tech-search-input"
            />
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {(Object.entries(CATEGORY_CONFIG) as [TechCategory, typeof CATEGORY_CONFIG[TechCategory]][]).map(
              ([key, config]) => {
                const isActive = activeCategories.includes(key);
                const count = categoryCounts[key] || 0;
                return (
                  <button
                    key={key}
                    onClick={() => handleCategoryToggle(key)}
                    className={`filter-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all border ${
                      isActive
                        ? `${config.bgColor} ${config.color} ${config.borderColor} shadow-lg`
                        : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="text-xs">{config.emoji}</span>
                    {config.label}
                    {count > 0 && (
                      <span
                        className={`text-[9px] font-bold ml-0.5 ${isActive ? config.color : "text-muted"}`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              }
            )}
          </div>

          {/* Active filter info */}
          {(searchQuery || activeCategories.length > 0) && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <span className="text-[11px] text-muted-foreground">
                Showing {filteredUpdates.length} of {updates.length} updates
              </span>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategories([]);
                }}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Date pill */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="text-[11px] text-muted-foreground font-mono px-3 py-1 rounded-full border border-white/10 bg-white/5 whitespace-nowrap">
            📅 {todayDate}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Updates Feed */}
        <ErrorBoundary>
          {loading ? (
            <LoadingSkeleton />
          ) : fetchError ? (
            <div className="glass-card rounded-xl p-10 text-center border border-white/5">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 mb-5">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
                {fetchError}
              </p>
              <button
                onClick={() => {
                  setLoading(true);
                  fetchFeed();
                }}
                className="px-5 py-2.5 text-sm font-medium rounded-lg bg-cyan-500 text-white hover:bg-cyan-500/90 transition-all shadow-lg shadow-cyan-500/20"
              >
                ↻ Retry
              </button>
            </div>
          ) : filteredUpdates.length === 0 && updates.length > 0 ? (
            <div className="glass-card rounded-xl p-10 text-center border border-white/5">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-5">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No Matching Updates
              </h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
                No updates match your current search or filter criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategories([]);
                }}
                className="px-5 py-2.5 text-sm font-medium rounded-lg bg-white/10 text-foreground hover:bg-white/15 transition-all border border-white/10"
              >
                Clear Filters
              </button>
            </div>
          ) : updates.length === 0 ? (
            <div className="glass-card rounded-xl p-10 text-center border border-white/5">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-5">
                <span className="text-3xl">📡</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No Tech Updates Yet Today
              </h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
                No tech news recorded yet today. Click &quot;Refresh Now&quot;
                to fetch the latest tech news, or wait for the next update.
              </p>
              <button
                onClick={triggerRefresh}
                disabled={refreshing}
                className="px-5 py-2.5 text-sm font-medium rounded-lg bg-cyan-500 text-white hover:bg-cyan-500/90 transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/20"
                id="fetch-initial-tech-news"
              >
                {refreshing ? "Fetching..." : "⚡ Fetch Latest Tech News"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUpdates.map((update, index) => (
                <TechUpdateCard
                  key={update.id}
                  update={update}
                  index={index}
                  isNew={newUpdateIds.has(update.id)}
                />
              ))}
            </div>
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-12 bg-black/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-mono font-bold text-[8px]">
                AI
              </div>
              <span className="text-xs font-bold">
                AI<span className="text-cyan-400">News</span>{" "}
                <span className="text-muted-foreground font-normal">
                  Tech Edition
                </span>
              </span>
            </div>
            <p className="text-[10px] text-muted font-mono">
              © {new Date().getFullYear()} AINews • Powered by Gemini AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
