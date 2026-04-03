"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  title: string;
  description: string | null;
  targetTime: string;
}

type UrgencyLevel = "safe" | "warning" | "danger" | "critical";

function getUrgencyLevel(diffMs: number): UrgencyLevel {
  const hours = diffMs / (1000 * 60 * 60);
  if (hours <= 1) return "critical";
  if (hours <= 6) return "danger";
  if (hours <= 24) return "warning";
  return "safe";
}

const urgencyConfig: Record<UrgencyLevel, { border: string; text: string; bg: string; className: string }> = {
  safe: {
    border: "border-success/30",
    text: "text-success",
    bg: "bg-success/5",
    className: "urgency-safe",
  },
  warning: {
    border: "border-warning/30",
    text: "text-warning",
    bg: "bg-warning/5",
    className: "urgency-warning",
  },
  danger: {
    border: "border-breaking/30",
    text: "text-breaking",
    bg: "bg-breaking/5",
    className: "urgency-danger",
  },
  critical: {
    border: "border-breaking/50",
    text: "text-breaking",
    bg: "bg-breaking/10",
    className: "urgency-critical",
  },
};

export function CountdownTimer({
  title,
  description,
  targetTime,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    years: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
    diffMs: Infinity,
  });
  const [expiredAt, setExpiredAt] = useState<Date | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetTime).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ years: 0, days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, diffMs: 0 });
        if (!expiredAt) setExpiredAt(new Date());
        // Keep showing for 1 hour after expiry
        const expTime = expiredAt || new Date();
        if (now - expTime.getTime() > 60 * 60 * 1000) {
          clearInterval(interval);
        }
        return;
      }

      setTimeLeft({
        years: Math.floor(diff / (1000 * 60 * 60 * 24 * 365)),
        days: Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        expired: false,
        diffMs: diff,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime, expiredAt]);

  // Hide 1 hour after expiry
  if (timeLeft.expired && expiredAt) {
    const now = new Date().getTime();
    if (now - expiredAt.getTime() > 60 * 60 * 1000) return null;
  }

  const urgency = timeLeft.expired ? "critical" : getUrgencyLevel(timeLeft.diffMs);
  const config = urgencyConfig[urgency];

  return (
    <div
      className={`glass-card-elevated rounded-xl p-4 border ${config.border} ${config.bg} animate-glow-pulse ${config.className}`}
      style={{ "--glow-color": urgency === "safe" ? "rgba(34,197,94,0.3)" : urgency === "warning" ? "rgba(245,158,11,0.3)" : "rgba(220,38,38,0.4)" } as React.CSSProperties}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`${config.text} text-sm`}>⏱</span>
        <h3 className={`text-xs font-bold uppercase tracking-wider ${config.text}`}>
          {title}
        </h3>
        {timeLeft.expired && (
          <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-breaking bg-breaking/20 px-2 py-0.5 rounded-full animate-pulse-live">
            EXPIRED
          </span>
        )}
      </div>
      {description && (
        <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
          {description}
        </p>
      )}
      <div className={`grid gap-2 ${timeLeft.years > 0 ? "grid-cols-5" : "grid-cols-4"}`}>
        {(timeLeft.years > 0
          ? [{ value: timeLeft.years, label: "Yrs" }]
          : []
        ).concat([
          { value: timeLeft.days, label: "Days" },
          { value: timeLeft.hours, label: "Hrs" },
          { value: timeLeft.minutes, label: "Min" },
          { value: timeLeft.seconds, label: "Sec" },
        ]).map(({ value, label }) => (
          <div
            key={label}
            className={`flex flex-col items-center bg-black/50 rounded-lg py-2 px-1 border border-white/5 ${
              timeLeft.expired ? "opacity-50" : ""
            }`}
          >
            <span
              className={`text-xl font-bold font-mono tabular-nums animate-tick ${
                timeLeft.expired ? "text-muted" : "text-foreground"
              }`}
              key={value}
            >
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
