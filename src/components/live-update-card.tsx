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

  const severityBorders = {
    BREAKING: "border-l-[3px] border-l-breaking pl-4",
    UPDATE: "border-l-[3px] border-l-update pl-4",
    ANALYSIS: "border-l-[3px] border-l-analysis pl-4",
    DIPLOMACY: "border-l-[3px] border-l-diplomacy pl-4",
  };

  const severityGlows = {
    BREAKING: "hover:shadow-[0_4px_20px_rgba(220,38,38,0.15)]",
    UPDATE: "hover:shadow-[0_4px_20px_rgba(245,158,11,0.15)]",
    ANALYSIS: "hover:shadow-[0_4px_20px_rgba(59,130,246,0.15)]",
    DIPLOMACY: "hover:shadow-[0_4px_20px_rgba(139,92,246,0.15)]",
  };

  const bulletColors = {
    BREAKING: "text-breaking",
    UPDATE: "text-update",
    ANALYSIS: "text-analysis",
    DIPLOMACY: "text-diplomacy",
  };

  return (
    <article
      className={`animate-fade-in-up card-hover glass-card rounded-xl p-5 pl-7 relative group overflow-hidden ${severityGlows[severity]}`}
      style={{ animationDelay: `${index * 0.05}s` }}
      aria-label={`${severity} update from ${source}`}
    >
      {/* Left colored accent border */}
      <div className={`absolute top-0 bottom-0 left-0 w-1 ${
        severity === "BREAKING" ? "bg-breaking" :
        severity === "UPDATE" ? "bg-update" :
        severity === "ANALYSIS" ? "bg-analysis" : "bg-diplomacy"
      }`} />
      
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
        <ul className="space-y-2 ml-1 mt-4 p-3 bg-black/40 rounded-lg border border-white/5">
          {parsedBullets.map((point, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
              <span className={`${bulletColors[severity]} mt-1 shrink-0 font-bold`}>▸</span>
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
