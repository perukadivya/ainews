"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/header";
import { LiveUpdateCard } from "@/components/live-update-card";
import { DailyTopTen } from "@/components/daily-top-ten";
import { LoadingSkeleton } from "@/components/loading-skeleton";
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

interface DailySummary {
  id: number;
  rank: number;
  title: string;
  summary: string;
  category: string;
}

export default function ArchivePage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    formatDateKey(new Date())
  );
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [updates, setUpdates] = useState<LiveUpdate[]>([]);
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [datesLoading, setDatesLoading] = useState(true);

  const fetchDates = useCallback(async () => {
    try {
      const res = await fetch("/api/dates");
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
        fetch(`/api/feed?date=${date}&limit=100`),
        fetch(`/api/daily?date=${date}`),
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
    }
  }, [selectedDate, fetchData]);

  const formattedSelectedDate = new Date(selectedDate + "T00:00:00").toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  // Generate calendar grid — show last 90 days
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
    return dates.reverse(); // Most recent first
  };

  const calendarDates = generateCalendarDates();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            News <span className="text-breaking">Archive</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Browse past updates by date
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side: Date picker */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="glass-card rounded-xl p-4 border border-white/5 sticky top-20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                📅 Select Date
              </h3>

              {/* Quick date input */}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={formatDateKey(new Date())}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground font-mono mb-4 focus:outline-none focus:border-breaking/50 focus:ring-1 focus:ring-breaking/30"
              />

              {/* Date list */}
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
                    const label = dateObj.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                    const dayName = dateObj.toLocaleDateString("en-US", {
                      weekday: "short",
                    });

                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-breaking/20 text-breaking border border-breaking/30"
                            : hasData
                            ? "hover:bg-white/5 text-foreground/80"
                            : "text-muted/50 hover:bg-white/5"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-muted font-mono w-8">{dayName}</span>
                          <span>{label}</span>
                        </span>
                        {hasData && (
                          <span className="h-1.5 w-1.5 rounded-full bg-breaking" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right side: Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">{formattedSelectedDate}</h2>
              <p className="text-xs text-muted-foreground">
                {updates.length} update{updates.length !== 1 ? "s" : ""} •{" "}
                {dailySummaries.length > 0
                  ? `${dailySummaries.length} top stories`
                  : "No daily summary"}
              </p>
            </div>

            {loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="space-y-6">
                {/* Daily Summary */}
                {dailySummaries.length > 0 && (
                  <DailyTopTen items={dailySummaries} />
                )}

                {/* Live Updates */}
                {updates.length > 0 ? (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      Hourly Updates
                    </h3>
                    <div className="space-y-3">
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
                ) : (
                  <div className="glass-card rounded-xl p-8 text-center">
                    <div className="text-4xl mb-4">📭</div>
                    <h3 className="text-lg font-semibold mb-2">
                      No Data for This Date
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      No updates were recorded on this date. Try selecting a
                      different date with the red dot indicator.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
