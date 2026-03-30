"use client";

import { SeverityBadge } from "./severity-badge";
import { formatRelativeTime, formatTimestamp } from "@/lib/utils";

interface LiveUpdateCardProps {
  id: number;
  timestamp: string;
  content: string;
  source: string;
  severity: "BREAKING" | "UPDATE" | "ANALYSIS" | "DIPLOMACY";
  bulletPoints: string | null;
  index: number;
}

export function LiveUpdateCard({
  timestamp,
  content,
  source,
  severity,
  bulletPoints,
  index,
}: LiveUpdateCardProps) {
  const date = new Date(timestamp + "Z");
  let parsedBullets: string[] = [];
  try {
    if (bulletPoints) {
      parsedBullets = JSON.parse(bulletPoints);
    }
  } catch {
    // If not valid JSON, split by newlines
    if (bulletPoints) {
      parsedBullets = bulletPoints.split("\n").filter(Boolean);
    }
  }

  return (
    <article
      className="animate-fade-in-up card-hover glass-card rounded-xl p-5 relative group"
      style={{ animationDelay: `${index * 0.05}s` }}
      aria-label={`${severity} update from ${source}`}
    >
      {/* Timeline dot */}
      <div className="absolute -left-[29px] top-6 z-10 hidden lg:block">
        <div
          className={`h-3 w-3 rounded-full border-2 border-card ${
            severity === "BREAKING"
              ? "bg-breaking animate-pulse-live"
              : severity === "UPDATE"
              ? "bg-update"
              : severity === "ANALYSIS"
              ? "bg-analysis"
              : "bg-diplomacy"
          }`}
        />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <SeverityBadge severity={severity} />
          <time dateTime={date.toISOString()} className="text-xs text-muted font-mono">
            {formatRelativeTime(date)}
          </time>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-white/5 px-2 py-0.5 rounded font-mono shrink-0">
          {source}
        </span>
      </div>

      {/* Summary */}
      <p className="text-sm text-foreground/90 leading-relaxed mb-3 font-medium">
        {content}
      </p>

      {/* Bullet Points */}
      {parsedBullets.length > 0 && (
        <ul className="space-y-1.5 ml-1">
          {parsedBullets.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
              <span className="text-breaking mt-1 shrink-0">▸</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Timestamp footer */}
      <footer className="mt-3 pt-3 border-t border-white/5">
        <time dateTime={date.toISOString()} className="text-[10px] text-muted font-mono">
          {formatTimestamp(date)}
        </time>
      </footer>
    </article>
  );
}
