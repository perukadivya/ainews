"use client";

import { useState, useEffect } from "react";

interface FinanceCountdown {
  id: number;
  title: string;
  description: string | null;
  target_time: string;
  emoji: string;
  type: "occurred" | "upcoming";
}

function useCountdown(targetTime: string, type: string) {
  const [diff, setDiff] = useState(0);

  useEffect(() => {
    const update = () => {
      const target = new Date(targetTime).getTime();
      const now = Date.now();
      if (type === "occurred") {
        setDiff(now - target);
      } else {
        setDiff(target - now);
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetTime, type]);

  const absDiff = Math.abs(diff);
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isPast: diff < 0 && type === "upcoming" };
}

function CountdownDisplay({ countdown }: { countdown: FinanceCountdown }) {
  const { days, hours, minutes, seconds } = useCountdown(
    countdown.target_time,
    countdown.type
  );

  const isOccurred = countdown.type === "occurred";
  const label = isOccurred ? "OCCURRED" : "UPCOMING";
  const labelColor = isOccurred ? "text-emerald-400" : "text-amber-400";
  const borderColor = isOccurred ? "border-emerald-500/20" : "border-amber-500/20";

  return (
    <div className={`glass-card rounded-xl p-4 border ${borderColor}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{countdown.emoji}</span>
          <h3 className="text-sm font-bold uppercase tracking-wide text-emerald-400">
            {countdown.title}
          </h3>
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-wider ${labelColor}`}>
          {label}
        </span>
      </div>

      {countdown.description && (
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          {countdown.description}
        </p>
      )}

      <div className="grid grid-cols-4 gap-2">
        {[
          { value: days, label: "DAYS" },
          { value: hours, label: "HRS" },
          { value: minutes, label: "MIN" },
          { value: seconds, label: "SEC" },
        ].map(({ value, label }) => (
          <div key={label} className="text-center">
            <div className="text-lg font-bold font-mono tabular-nums text-emerald-400">
              {String(value).padStart(2, "0")}
            </div>
            <div className="text-[8px] uppercase tracking-wider text-muted-foreground">
              {label}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-2">
        <span className="text-[9px] text-muted font-mono">
          ⏱ {isOccurred ? "Time since" : "Time until"} event
        </span>
      </div>
    </div>
  );
}

export function FinanceCountdowns() {
  const [countdowns, setCountdowns] = useState<FinanceCountdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_data() {
      try {
        const res = await fetch("/api/finance-countdowns");
        const data = await res.json();
        setCountdowns(data.countdowns || []);
      } catch (error) {
        console.error("Failed to fetch finance countdowns:", error);
      } finally {
        setLoading(false);
      }
    }
    fetch_data();
  }, []);

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-4 border border-white/5">
        <div className="shimmer h-6 w-48 rounded mb-3" />
        <div className="shimmer h-24 rounded" />
      </div>
    );
  }

  if (countdowns.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        📊 Market Events & Countdowns
      </h2>
      {countdowns.map((cd) => (
        <CountdownDisplay key={cd.id} countdown={cd} />
      ))}
    </div>
  );
}
