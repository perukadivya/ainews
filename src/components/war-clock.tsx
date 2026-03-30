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
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes };
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
      <div className="space-y-2.5">
        {ACTIVE_CONFLICTS.map((conflict) => {
          const duration = getDuration(conflict.startDate);
          return (
            <div
              key={conflict.name}
              className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm shrink-0">{conflict.emoji}</span>
                <span className={`text-[11px] font-medium truncate ${conflict.color}`}>
                  {conflict.name}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <span className="text-xs font-bold font-mono text-foreground tabular-nums">
                  {duration.days}
                </span>
                <span className="text-[9px] text-muted">d</span>
                <span className="text-xs font-bold font-mono text-foreground tabular-nums">
                  {String(duration.hours).padStart(2, "0")}
                </span>
                <span className="text-[9px] text-muted">h</span>
                <span className="text-xs font-bold font-mono text-foreground tabular-nums">
                  {String(duration.minutes).padStart(2, "0")}
                </span>
                <span className="text-[9px] text-muted">m</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
