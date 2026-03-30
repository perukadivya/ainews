"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  title: string;
  description: string | null;
  targetTime: string;
}

export function CountdownTimer({
  title,
  description,
  targetTime,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetTime).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        expired: false,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  if (timeLeft.expired) return null;

  return (
    <div className="glass-card rounded-xl p-4 border border-breaking/20 animate-glow-pulse" style={{ "--glow-color": "rgba(220,38,38,0.3)" } as React.CSSProperties}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-breaking text-sm">⏱</span>
        <h3 className="text-xs font-bold uppercase tracking-wider text-breaking">
          {title}
        </h3>
      </div>
      {description && (
        <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
          {description}
        </p>
      )}
      <div className="grid grid-cols-4 gap-2">
        {[
          { value: timeLeft.days, label: "Days" },
          { value: timeLeft.hours, label: "Hrs" },
          { value: timeLeft.minutes, label: "Min" },
          { value: timeLeft.seconds, label: "Sec" },
        ].map(({ value, label }) => (
          <div
            key={label}
            className="flex flex-col items-center bg-black/50 rounded-lg py-2 px-1 border border-white/5"
          >
            <span className="text-xl font-bold font-mono text-foreground tabular-nums animate-tick" key={value}>
              {String(value).padStart(2, "0")}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-muted mt-0.5">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
