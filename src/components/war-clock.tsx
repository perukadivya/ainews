"use client";

import { useState, useEffect } from "react";

interface ConflictTimer {
  name: string;
  emoji: string;
  startDate: Date;
  color: string;
}

const ACTIVE_CONFLICTS: ConflictTimer[] = [
  {
    name: "Iran-US-Israel War",
    emoji: "🇮🇷",
    startDate: new Date("2026-02-28T00:00:00Z"),
    color: "text-breaking",
  },
  {
    name: "Russia-Ukraine War",
    emoji: "🇺🇦",
    startDate: new Date("2022-02-24T00:00:00Z"),
    color: "text-analysis",
  },
  {
    name: "Israel-Gaza Conflict",
    emoji: "🇵🇸",
    startDate: new Date("2023-10-07T00:00:00Z"),
    color: "text-update",
  },
  {
    name: "Sudan Civil War",
    emoji: "🇸🇩",
    startDate: new Date("2023-04-15T00:00:00Z"),
    color: "text-diplomacy",
  },
  {
    name: "Myanmar Civil War",
    emoji: "🇲🇲",
    startDate: new Date("2021-02-01T00:00:00Z"),
    color: "text-green-400",
  },
];

function getDuration(startDate: Date) {
  const now = new Date();
  const diff = now.getTime() - startDate.getTime();
  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(totalDays / 365);
  const remainingDays = totalDays % 365;
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { totalDays, years, days: remainingDays, hours, minutes };
}

export function WarClock() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000); // Update every minute (days don't need per-second updates)
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card rounded-xl p-4 border border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs">⚔️</span>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Active Conflicts
        </h3>
      </div>
      <div className="space-y-4">
        {ACTIVE_CONFLICTS.map((conflict, index) => {
          const duration = getDuration(conflict.startDate);
          
          // Calculate a rough relative max days based on the oldest conflict (Myanmar, ~2000 days roughly)
          // This gives a visual bar proportional to the war's length
          const maxDays = 2000;
          const percentage = Math.min(100, Math.max(2, (duration.totalDays / maxDays) * 100));
          
          return (
            <div
              key={conflict.name}
              className="group relative"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm shrink-0">{conflict.emoji}</span>
                  <span className={`text-[11px] font-medium truncate ${conflict.color}`}>
                    {conflict.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {duration.years > 0 && (
                    <>
                      <span className="text-xs font-bold font-mono text-foreground tabular-nums">
                        {duration.years}
                      </span>
                      <span className="text-[9px] text-muted">y</span>
                    </>
                  )}
                  <span className="text-xs font-bold font-mono text-foreground tabular-nums">
                    {duration.days}
                  </span>
                  <span className="text-[9px] text-muted">d</span>
                  <span className="text-[10px] font-mono text-muted tabular-nums ml-0.5">
                    {String(duration.hours).padStart(2, "0")}h
                  </span>
                </div>
              </div>
              
              {/* Progress bar visual */}
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div 
                  className={`h-full rounded-full opacity-80 group-hover:opacity-100 transition-all duration-500 ease-out bg-current ${conflict.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              {index === 0 && (
                <div className="absolute -inset-2 rounded-lg border border-breaking/20 pointer-events-none animate-pulse-live" style={{ opacity: 0.2 }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
