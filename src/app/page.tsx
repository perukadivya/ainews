"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/header";
import { LiveUpdateCard } from "@/components/live-update-card";
import { CountdownTimer } from "@/components/countdown-timer";
import { WarClock } from "@/components/war-clock";
import { DailyTopTen } from "@/components/daily-top-ten";
import { LoadingSkeleton, SidebarSkeleton } from "@/components/loading-skeleton";

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

export default function HomePage() {
  const [updates, setUpdates] = useState<LiveUpdate[]>([]);
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch("/api/feed?limit=50");
      const data = await res.json();
      setUpdates(data.updates || []);
    } catch (error) {
      console.error("Failed to fetch feed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

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
      await fetch("/api/cron/hourly");
      await fetchFeed();
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Failed to trigger refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchSidebar();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchFeed();
      fetchSidebar();
      setLastRefresh(new Date());
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchFeed, fetchSidebar]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Live <span className="text-breaking">Updates</span>
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
              disabled={refreshing}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-breaking/10 text-breaking border border-breaking/20 hover:bg-breaking/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                "↻ Refresh Now"
              )}
            </button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column: Live Blog */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <LoadingSkeleton />
            ) : updates.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center">
                <div className="text-4xl mb-4">📡</div>
                <h3 className="text-lg font-semibold mb-2">No Updates Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click &quot;Refresh Now&quot; to fetch the latest news, or wait for the
                  next hourly update.
                </p>
                <button
                  onClick={triggerRefresh}
                  disabled={refreshing}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-breaking text-white hover:bg-breaking/90 transition-all disabled:opacity-50"
                >
                  {refreshing ? "Fetching..." : "Fetch Latest News"}
                </button>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="hidden lg:block absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-breaking via-breaking/20 to-transparent" />

                {/* Updates */}
                <div className="space-y-4 lg:pl-12">
                  {updates.map((update, index) => (
                    <LiveUpdateCard
                      key={update.id}
                      id={update.id}
                      timestamp={update.timestamp}
                      content={update.content}
                      source={update.source}
                      severity={update.severity}
                      bulletPoints={update.bullet_points}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column: Sidebar */}
          <div className="w-full lg:w-80 shrink-0 space-y-4">
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

                {/* War duration clock (always visible) */}
                <WarClock />

                {/* Daily Top 10 */}
                <DailyTopTen items={dailySummaries} />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
            <p>
              AINews — AI-Powered War & Conflict Tracker • Data from BBC RSS & Gemini AI
            </p>
            <p className="font-mono">
              Updates every hour • Summaries generated daily
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
