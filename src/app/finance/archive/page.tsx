"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/header";
import { FinanceUpdateCard, type FinanceUpdate } from "@/components/finance-update-card";
import { DailyTopTen } from "@/components/daily-top-ten";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorBoundary } from "@/components/error-boundary";
import { formatDateKey } from "@/lib/utils";

interface DailySummary {
  id: number;
  rank: number;
  title: string;
  summary: string;
  category: string;
}

export default function FinanceArchivePage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    formatDateKey(new Date())
  );
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [updates, setUpdates] = useState<FinanceUpdate[]>([]);
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [datesLoading, setDatesLoading] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const fetchDates = useCallback(async () => {
    try {
      const res = await fetch("/api/finance-dates");
      const data = await res.json();
      setAvailableDates(data.dates || []);
    } catch (error) {
      console.error("Failed to fetch dates:", error);
    } finally {
      setDatesLoading(false);
    }
  }, []);

  const fetchData = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const [feedRes, dailyRes] = await Promise.all([
        fetch(`/api/finance?date=${date}&limit=100`),
        fetch(`/api/daily-finance?date=${date}`),
      ]);
      const feedData = await feedRes.json();
      const dailyData = await dailyRes.json();
      setUpdates(feedData.updates || []);
      setDailySummaries(dailyData.summaries || []);
    } catch (error) {
      console.error("Failed to fetch archive data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDates();
  }, [fetchDates]);

  useEffect(() => {
    if (selectedDate) {
      fetchData(selectedDate);
      setMobileDrawerOpen(false);
    }
  }, [selectedDate, fetchData]);

  const formattedSelectedDate = new Date(
    selectedDate + "T00:00:00"
  ).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const navigateDay = (direction: -1 | 1) => {
    const currentDate = new Date(selectedDate + "T00:00:00");
    currentDate.setDate(currentDate.getDate() + direction);
    const newDate = formatDateKey(currentDate);
    const today = formatDateKey(new Date());
    if (newDate <= today) {
      setSelectedDate(newDate);
    }
  };

  const jumpToToday = () => {
    setSelectedDate(formatDateKey(new Date()));
  };

  const generateCalendarDates = () => {
    const dates: string[] = [];
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 90);
    const current = new Date(start);
    while (current <= end) {
      dates.push(formatDateKey(current));
      current.setDate(current.getDate() + 1);
    }
    return dates.reverse();
  };

  const calendarDates = generateCalendarDates();
  const isToday = selectedDate === formatDateKey(new Date());

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Finance <span className="text-gradient-green">Archive</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Browse past updates by date
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDay(-1)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:bg-white/10 transition-all text-sm"
              aria-label="Previous day"
            >
              ← Prev
            </button>
            {!isToday && (
              <button
                onClick={jumpToToday}
                className="px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-xs font-medium"
              >
                Today
              </button>
            )}
            <button
              onClick={() => navigateDay(1)}
              disabled={isToday}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:bg-white/10 transition-all text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next day"
            >
              Next →
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="lg:hidden glass-card rounded-xl p-3 border border-white/5 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span className="text-xs font-medium">{formattedSelectedDate}</span>
            </div>
            <svg
              className={`h-4 w-4 text-muted-foreground transition-transform ${mobileDrawerOpen ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className={`w-full lg:w-72 shrink-0 ${mobileDrawerOpen ? "block" : "hidden lg:block"}`}>
            <div className="glass-card rounded-xl p-4 border border-white/5 lg:sticky lg:top-20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                📅 Select Date
              </h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={formatDateKey(new Date())}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground font-mono mb-4 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
              />
              <div className="max-h-[400px] overflow-y-auto space-y-1 pr-1">
                {datesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="shimmer h-8 rounded-lg" />
                    ))}
                  </div>
                ) : (
                  calendarDates.map((date) => {
                    const hasData = availableDates.includes(date);
                    const isSelected = date === selectedDate;
                    const dateObj = new Date(date + "T00:00:00");
                    const label = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });

                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-gradient-to-r from-emerald-500/20 to-transparent text-emerald-400 border border-emerald-500/30 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]"
                            : hasData
                            ? "hover:bg-white/5 text-foreground/90 border border-transparent hover:border-white/10"
                            : "text-muted/40 hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`font-mono w-8 ${isSelected ? "text-emerald-400/80" : "text-muted"}`}>
                            {dayName}
                          </span>
                          <span>{label}</span>
                        </span>
                        {hasData && (
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            isSelected ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-emerald-500/50"
                          }`} />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <ErrorBoundary>
              <div className="glass-card rounded-xl p-4 border border-white/5 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{formattedSelectedDate}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {updates.length} update{updates.length !== 1 ? "s" : ""} •{" "}
                      {dailySummaries.length > 0 ? `${dailySummaries.length} top stories` : "No daily summary"}
                    </p>
                  </div>
                  {updates.length > 0 && (
                    <div className="flex items-center gap-3 text-center">
                      <div>
                        <p className="text-lg font-bold font-mono tabular-nums text-emerald-400">
                          {new Set(updates.map((u) => u.source)).size}
                        </p>
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Sources</p>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div>
                        <p className="text-lg font-bold font-mono tabular-nums">{updates.length}</p>
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Total</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {loading ? (
                <LoadingSkeleton />
              ) : (
                <div className="space-y-6">
                  {dailySummaries.length > 0 && <DailyTopTen items={dailySummaries} />}
                  {updates.length > 0 ? (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Hourly Updates</h3>
                      <div className="space-y-3">
                        {updates.map((update, index) => (
                          <FinanceUpdateCard key={update.id} update={update} index={index} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="glass-card rounded-xl p-10 text-center border border-white/5">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-5">
                        <span className="text-3xl">📭</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No Data for This Date</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        No updates were recorded on this date. Try selecting a different date with the green dot indicator.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </ErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  );
}
