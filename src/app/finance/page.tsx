"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorBoundary } from "@/components/error-boundary";
import { useToast } from "@/components/toast-provider";
import { formatDateKey } from "@/lib/utils";
import { FinanceUpdateCard, type FinanceUpdate, type FinanceCategory, FINANCE_CATEGORY_CONFIG } from "@/components/finance-update-card";
import { DailyTopTen } from "@/components/daily-top-ten";
import { FinanceCountdowns } from "@/components/finance-countdowns";

export default function FinancePage() {
  const [updates, setUpdates] = useState<FinanceUpdate[]>([]);
  const [dailySummaries, setDailySummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState<FinanceCategory[]>([]);

  // Track new update IDs
  const [newUpdateIds, setNewUpdateIds] = useState<Set<number>>(new Set());
  const prevUpdateCountRef = useRef(0);

  const { addToast } = useToast();

  const fetchFeed = useCallback(
    async (showToasts = false) => {
      try {
        setFetchError(null);
        const today = formatDateKey(new Date());
        const res = await fetch(`/api/finance?date=${today}&limit=50`);
        if (!res.ok) throw new Error(`Finance API returned ${res.status}`);
        const data = await res.json();
        const newUpdates = data.updates || [];

        if (
          showToasts &&
          prevUpdateCountRef.current > 0 &&
          newUpdates.length > prevUpdateCountRef.current
        ) {
          const newCount = newUpdates.length - prevUpdateCountRef.current;
          const newIds = new Set<number>(
            newUpdates.slice(0, newCount).map((u: FinanceUpdate) => u.id)
          );
          setNewUpdateIds(newIds);
          addToast({
            message: `${newCount} new finance update${newCount > 1 ? "s" : ""} received`,
            severity: "info",
          });
        }

        prevUpdateCountRef.current = newUpdates.length;
        setUpdates(newUpdates);
      } catch (error) {
        console.error("Failed to fetch finance feed:", error);
        setFetchError("Failed to load finance updates. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  const fetchSidebar = useCallback(async () => {
    try {
      const res = await fetch("/api/daily-finance");
      const data = await res.json();
      setDailySummaries(data.summaries || []);
    } catch (error) {
      console.error("Failed to fetch sidebar:", error);
    }
  }, []);

  const triggerRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchFeed(true);
      await fetchSidebar();
      setLastRefresh(new Date());
      addToast({ message: "Finance feed refreshed successfully", severity: "info" });
    } catch (error) {
      console.error("Failed to trigger finance refresh:", error);
      addToast({ message: "Finance refresh failed. Please try again.", severity: "BREAKING" });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchSidebar();

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
        fetchFeed(true);
        fetchSidebar();
        startInterval();
      }
    };

    startInterval();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchFeed, fetchSidebar]);

  // Filter logic
  const filteredUpdates = updates.filter((u) => {
    const matchesSearch =
      searchQuery === "" ||
      u.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.source.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategories.length === 0 ||
      activeCategories.includes(u.category as FinanceCategory);

    return matchesSearch && matchesCategory;
  });

  const handleCategoryToggle = useCallback((category: FinanceCategory) => {
    setActiveCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }, []);

  // Category stats
  const categoryCounts = updates.reduce(
    (acc, u) => {
      const cat = (u.category as FinanceCategory) || "general";
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
    headline: "AINews — Finance & Markets Tracker",
    description:
      "Real-time financial markets tracker covering stocks, crypto, commodities, and more.",
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
              Finance <span className="text-gradient-green">&amp; Markets</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Stocks • Crypto • Commodities • Central Banks • Earnings
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
              className="group px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              id="finance-refresh-button"
            >
              {refreshing ? (
                <span className="flex items-center gap-1.5">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Fetching...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="group-hover:rotate-180 transition-transform duration-300">↻</span>
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
              Markets
            </p>
            <p className="text-lg font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
              {categoryCounts["markets"] || 0}
            </p>
          </div>
          <div className="glass-card rounded-lg px-3 py-2.5 border border-white/5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              Crypto
            </p>
            <p className="text-lg font-bold font-mono tabular-nums text-orange-400 mt-0.5">
              {categoryCounts["crypto"] || 0}
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
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search finance news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg pl-4 pr-12 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
              id="finance-search-input"
            />
            {!searchQuery ? (
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            ) : (
              <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors" aria-label="Clear search">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {(Object.entries(FINANCE_CATEGORY_CONFIG) as [FinanceCategory, typeof FINANCE_CATEGORY_CONFIG[FinanceCategory]][]).map(
              ([key, config]) => {
                const isActive = activeCategories.includes(key);
                const count = categoryCounts[key] || 0;
                return (
                  <button
                    key={key}
                    onClick={() => handleCategoryToggle(key)}
                    className={`filter-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all border ${isActive
                      ? `${config.bgColor} ${config.color} ${config.borderColor} shadow-lg`
                      : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    <span className="text-xs">{config.emoji}</span>
                    {config.label}
                    {count > 0 && (
                      <span className={`text-[9px] font-bold ml-0.5 ${isActive ? config.color : "text-muted"}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              }
            )}
          </div>

          {(searchQuery || activeCategories.length > 0) && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <span className="text-[11px] text-muted-foreground">
                Showing {filteredUpdates.length} of {updates.length} updates
              </span>
              <button
                onClick={() => { setSearchQuery(""); setActiveCategories([]); }}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
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

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0" role="feed" aria-busy={loading}>
            <ErrorBoundary>
              {loading ? (
                <LoadingSkeleton />
              ) : fetchError ? (
                <div className="glass-card rounded-xl p-10 text-center border border-white/5">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 mb-5">
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
                  <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">{fetchError}</p>
                  <button
                    onClick={() => { setLoading(true); fetchFeed(); }}
                    className="px-5 py-2.5 text-sm font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-500/90 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    ↻ Retry
                  </button>
                </div>
              ) : filteredUpdates.length === 0 && updates.length > 0 ? (
                <div className="glass-card rounded-xl p-10 text-center border border-white/5">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-5">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Matching Updates</h3>
                  <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
                    No updates match your current search or filter criteria.
                  </p>
                  <button
                    onClick={() => { setSearchQuery(""); setActiveCategories([]); }}
                    className="px-5 py-2.5 text-sm font-medium rounded-lg bg-white/10 text-foreground hover:bg-white/15 transition-all border border-white/10"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : updates.length === 0 ? (
                <div className="glass-card rounded-xl p-10 text-center border border-white/5">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-5">
                    <span className="text-3xl">📡</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Finance Updates Yet Today</h3>
                  <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
                    No financial news recorded yet today. Click &quot;Refresh Now&quot;
                    to fetch the latest market news, or wait for the next update.
                  </p>
                  <button
                    onClick={triggerRefresh}
                    disabled={refreshing}
                    className="px-5 py-2.5 text-sm font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-500/90 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                    id="fetch-initial-finance-news"
                  >
                    {refreshing ? "Fetching..." : "⚡ Fetch Latest Finance News"}
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="hidden lg:block absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-emerald-500/20 to-transparent" />
                  <div className="space-y-4 lg:pl-10">
                    {filteredUpdates.map((update, index) => (
                      <FinanceUpdateCard
                        key={update.id}
                        update={update}
                        index={index}
                        isNew={newUpdateIds.has(update.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </ErrorBoundary>
          </div>

          <aside className="w-full lg:w-80 shrink-0 space-y-4">
            <ErrorBoundary>
              <FinanceCountdowns />
              <DailyTopTen items={dailySummaries} />
            </ErrorBoundary>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
