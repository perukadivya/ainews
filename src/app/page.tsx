"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LiveUpdateCard } from "@/components/live-update-card";
import { CountdownTimer } from "@/components/countdown-timer";
import { WarClock } from "@/components/war-clock";
import { DailyTopTen } from "@/components/daily-top-ten";
import { JsonLd } from "@/components/json-ld";
import { LoadingSkeleton, SidebarSkeleton } from "@/components/loading-skeleton";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { ErrorBoundary } from "@/components/error-boundary";
import { useToast } from "@/components/toast-provider";
import { NewsTicker } from "@/components/news-ticker";
import { formatDateKey } from "@/lib/utils";

interface LiveUpdate {
  id: number;
  timestamp: string;
  content: string;
  source: string;
  severity: "BREAKING" | "UPDATE" | "ANALYSIS" | "DIPLOMACY";
  bullet_points: string | null;
  created_at: string;
}

interface Countdown {
  id: number;
  title: string;
  description: string | null;
  target_time: string;
}

interface DailySummary {
  id: number;
  rank: number;
  title: string;
  summary: string;
  category: string;
}

type Severity = "BREAKING" | "UPDATE" | "ANALYSIS" | "DIPLOMACY";

export default function HomePage() {
  const [updates, setUpdates] = useState<LiveUpdate[]>([]);
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Severity[]>([]);

  // Track new update IDs for NEW badge
  const [newUpdateIds, setNewUpdateIds] = useState<Set<number>>(new Set());
  const prevUpdateCountRef = useRef(0);

  const { addToast } = useToast();

  const fetchFeed = useCallback(async (showToasts = false) => {
    try {
      setFetchError(null);
      const today = formatDateKey(new Date());
      const res = await fetch(`/api/feed?date=${today}&limit=50`);
      if (!res.ok) throw new Error(`Feed API returned ${res.status}`);
      const data = await res.json();
      const newUpdates = data.updates || [];

      // Detect new updates for toast
      if (showToasts && prevUpdateCountRef.current > 0 && newUpdates.length > prevUpdateCountRef.current) {
        const newCount = newUpdates.length - prevUpdateCountRef.current;
        const newIds = new Set<number>(newUpdates.slice(0, newCount).map((u: LiveUpdate) => u.id));
        setNewUpdateIds(newIds);

        const topSeverity = newUpdates[0]?.severity || "UPDATE";
        addToast({
          message: `${newCount} new update${newCount > 1 ? "s" : ""} received`,
          severity: topSeverity,
          onClick: () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          },
        });
      }

      prevUpdateCountRef.current = newUpdates.length;
      setUpdates(newUpdates);
    } catch (error) {
      console.error("Failed to fetch feed:", error);
      setFetchError("Failed to load updates. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const fetchSidebar = useCallback(async () => {
    try {
      const [countdownRes, dailyRes] = await Promise.all([
        fetch("/api/countdowns"),
        fetch("/api/daily"),
      ]);
      const countdownData = await countdownRes.json();
      const dailyData = await dailyRes.json();
      setCountdowns(countdownData.countdowns || []);
      setDailySummaries(dailyData.summaries || []);
    } catch (error) {
      console.error("Failed to fetch sidebar:", error);
    } finally {
      setSidebarLoading(false);
    }
  }, []);

  const triggerRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchFeed(true);
      await fetchSidebar();
      setLastRefresh(new Date());
      addToast({ message: "Feed refreshed successfully", severity: "info" });
    } catch (error) {
      console.error("Failed to trigger refresh:", error);
      addToast({ message: "Refresh failed. Please try again.", severity: "BREAKING" });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchSidebar();

    // Auto-refresh every 5 minutes, but pause when tab is backgrounded
    let interval: NodeJS.Timeout;

    const startInterval = () => {
      interval = setInterval(() => {
        fetchFeed(true);
        fetchSidebar();
        setLastRefresh(new Date());
      }, 5 * 60 * 1000);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        // Refresh immediately when tab becomes visible
        fetchFeed(true);
        startInterval();
      }
    };

    startInterval();
    document.addEventListener("visibilitychange", handleVisibility);

    // Online/offline detection
    const handleOnline = () => {
      setIsOnline(true);
      addToast({ message: "Connection restored", severity: "info" });
      fetchFeed(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
      addToast({ message: "You are offline. Updates paused.", severity: "BREAKING", duration: 8000 });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [fetchFeed, fetchSidebar, addToast]);

  // Filter logic
  const filteredUpdates = updates.filter((u) => {
    const matchesSearch =
      searchQuery === "" ||
      u.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.source.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity =
      activeFilters.length === 0 || activeFilters.includes(u.severity);

    return matchesSearch && matchesSeverity;
  });

  const handleFilterToggle = useCallback((severity: Severity) => {
    setActiveFilters((prev) =>
      prev.includes(severity)
        ? prev.filter((f) => f !== severity)
        : [...prev, severity]
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setActiveFilters([]);
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LiveBlogPosting",
    headline: "AINews — Live News Tracker by AI",
    description:
      "Real-time global war and conflict tracker with hourly updates.",
    about: {
      "@type": "Event",
      name: "Global Geopolitical Conflicts",
    },
    coverageStartTime: new Date().toISOString(),
    liveBlogUpdate: updates.map((update) => ({
      "@type": "BlogPosting",
      headline:
        update.content.substring(0, 80) +
        (update.content.length > 80 ? "..." : ""),
      datePublished: new Date(update.timestamp + "Z").toISOString(),
      articleBody: update.content,
      author: {
        "@type": "Organization",
        name: update.source,
      },
    })),
  };

  // Stats
  const breakingCount = updates.filter(
    (u) => u.severity === "BREAKING"
  ).length;
  const updateCount = updates.filter(
    (u) => u.severity === "UPDATE"
  ).length;
  const analysisCount = updates.filter(
    (u) => u.severity === "ANALYSIS"
  ).length;
  const diplomacyCount = updates.filter(
    (u) => u.severity === "DIPLOMACY"
  ).length;
  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Severity distribution percentages
  const total = updates.length || 1;
  const severityDistribution = {
    breaking: (breakingCount / total) * 100,
    update: (updateCount / total) * 100,
    analysis: (analysisCount / total) * 100,
    diplomacy: (diplomacyCount / total) * 100,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <JsonLd structuredData={structuredData} />
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {/* Connection status */}
        {!isOnline && (
          <div className="mb-4 px-4 py-2.5 rounded-lg bg-breaking/10 border border-breaking/30 text-xs text-breaking font-medium flex items-center gap-2 animate-slide-in-down">
            <span className="h-2 w-2 rounded-full bg-breaking animate-pulse-live" />
            You are offline — updates are paused until connection is restored.
          </div>
        )}

        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Live <span className="text-gradient-red">Updates</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Global Conflicts • Hourly Intelligence Brief
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
              disabled={refreshing || !isOnline}
              className="group px-3 py-1.5 text-xs font-medium rounded-lg bg-breaking/10 text-breaking border border-breaking/20 hover:bg-breaking/20 hover:border-breaking/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              id="refresh-button"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="stat-card stat-card-updates glass-card rounded-lg px-3 py-2.5 border border-white/5 cursor-default">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              Today&apos;s Updates
            </p>
            <p className="text-lg font-bold font-mono tabular-nums text-foreground mt-0.5">
              {updates.length}
            </p>
          </div>
          <div className="stat-card stat-card-breaking glass-card rounded-lg px-3 py-2.5 border border-white/5 cursor-default">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              Breaking
            </p>
            <p className="text-lg font-bold font-mono tabular-nums text-breaking mt-0.5">
              {breakingCount}
            </p>
          </div>
          <div className="stat-card stat-card-conflicts glass-card rounded-lg px-3 py-2.5 border border-white/5 cursor-default">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              Active Conflicts
            </p>
            <p className="text-lg font-bold font-mono tabular-nums text-foreground mt-0.5">
              {countdowns.length}
            </p>
          </div>
          <div className="stat-card stat-card-stories glass-card rounded-lg px-3 py-2.5 border border-white/5 cursor-default">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              Top Stories
            </p>
            <p className="text-lg font-bold font-mono tabular-nums text-foreground mt-0.5">
              {dailySummaries.length}
            </p>
          </div>
        </div>

        {/* Severity Distribution Mini Bar */}
        {updates.length > 0 && (
          <div className="mb-6">
            <div className="severity-bar w-full bg-black/40 rounded-full border border-white/5">
              <span
                className="bg-breaking rounded-l-full"
                style={{ width: `${severityDistribution.breaking}%` }}
                title={`Breaking: ${breakingCount}`}
              />
              <span
                className="bg-update"
                style={{ width: `${severityDistribution.update}%` }}
                title={`Update: ${updateCount}`}
              />
              <span
                className="bg-analysis"
                style={{ width: `${severityDistribution.analysis}%` }}
                title={`Analysis: ${analysisCount}`}
              />
              <span
                className="bg-diplomacy rounded-r-full"
                style={{ width: `${severityDistribution.diplomacy}%` }}
                title={`Diplomacy: ${diplomacyCount}`}
              />
            </div>
            <div className="flex items-center gap-4 mt-1.5">
              <span className="flex items-center gap-1 text-[9px] text-muted-foreground font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-breaking" />
                Breaking {breakingCount}
              </span>
              <span className="flex items-center gap-1 text-[9px] text-muted-foreground font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-update" />
                Update {updateCount}
              </span>
              <span className="flex items-center gap-1 text-[9px] text-muted-foreground font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-analysis" />
                Analysis {analysisCount}
              </span>
              <span className="flex items-center gap-1 text-[9px] text-muted-foreground font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-diplomacy" />
                Diplomacy {diplomacyCount}
              </span>
            </div>
          </div>
        )}

        {/* Breaking News Ticker */}
        <NewsTicker
          items={updates.map((u) => ({
            id: u.id,
            content: u.content,
            severity: u.severity,
          }))}
        />

        {/* Search & Filter */}
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilters={activeFilters}
          onFilterToggle={handleFilterToggle}
          totalCount={updates.length}
          filteredCount={filteredUpdates.length}
          onClearFilters={handleClearFilters}
        />

        {/* Date pill */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="text-[11px] text-muted-foreground font-mono px-3 py-1 rounded-full border border-white/10 bg-white/5 whitespace-nowrap">
            📅 {todayDate}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column: Live Blog */}
          <div className="flex-1 min-w-0" role="feed" aria-busy={loading}>
            <ErrorBoundary>
              {loading ? (
                <LoadingSkeleton />
              ) : fetchError ? (
                <div className="glass-card rounded-xl p-10 text-center border border-white/5">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-breaking/10 border border-breaking/20 mb-5">
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Connection Error
                  </h3>
                  <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
                    {fetchError}
                  </p>
                  <button
                    onClick={() => {
                      setLoading(true);
                      fetchFeed();
                    }}
                    className="px-5 py-2.5 text-sm font-medium rounded-lg bg-breaking text-white hover:bg-breaking/90 transition-all shadow-lg shadow-breaking/20"
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
                    No updates match your current search or filter criteria. Try adjusting your filters.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="px-5 py-2.5 text-sm font-medium rounded-lg bg-white/10 text-foreground hover:bg-white/15 transition-all border border-white/10"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : updates.length === 0 ? (
                <div className="glass-card rounded-xl p-10 text-center border border-white/5">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-breaking/10 border border-breaking/20 mb-5">
                    <span className="text-3xl">📡</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    No Updates Yet Today
                  </h3>
                  <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
                    No developments recorded yet today. Click &quot;Refresh
                    Now&quot; to fetch the latest news, or wait for the next
                    hourly update.
                  </p>
                  <button
                    onClick={triggerRefresh}
                    disabled={refreshing}
                    className="px-5 py-2.5 text-sm font-medium rounded-lg bg-breaking text-white hover:bg-breaking/90 transition-all disabled:opacity-50 shadow-lg shadow-breaking/20"
                    id="fetch-initial-news"
                  >
                    {refreshing ? "Fetching..." : "⚡ Fetch Latest News"}
                  </button>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="hidden lg:block absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-breaking via-breaking/20 to-transparent" />

                  {/* Updates */}
                  <div className="space-y-4 lg:pl-12">
                    {filteredUpdates.map((update, index) => (
                      <LiveUpdateCard
                        key={update.id}
                        id={update.id}
                        timestamp={update.timestamp}
                        content={update.content}
                        source={update.source}
                        severity={update.severity}
                        bulletPoints={update.bullet_points}
                        index={index}
                        isNew={newUpdateIds.has(update.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </ErrorBoundary>
          </div>

          {/* Right column: Sidebar */}
          <aside
            className="w-full lg:w-80 shrink-0 space-y-4"
            aria-label="Supplementary info"
          >
            <ErrorBoundary>
              {sidebarLoading ? (
                <SidebarSkeleton />
              ) : (
                <>
                  {/* Countdown timers */}
                  {countdowns.length > 0 &&
                    countdowns.map((countdown) => (
                      <CountdownTimer
                        key={countdown.id}
                        title={countdown.title}
                        description={countdown.description}
                        targetTime={countdown.target_time}
                      />
                    ))}

                  {/* War duration clock */}
                  <WarClock />

                  {/* Daily Top 10 */}
                  <DailyTopTen items={dailySummaries} />
                </>
              )}
            </ErrorBoundary>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
