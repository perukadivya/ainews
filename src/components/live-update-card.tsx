"use client";

import { useState, useEffect } from "react";
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
  isNew?: boolean;
}

export function LiveUpdateCard({
  timestamp,
  content,
  source,
  severity,
  bulletPoints,
  index,
  isNew = false,
}: LiveUpdateCardProps) {
  const date = new Date(timestamp + "Z");
  const [expanded, setExpanded] = useState(false);
  const [showNewBadge, setShowNewBadge] = useState(isNew);
  const [copied, setCopied] = useState(false);

  let parsedBullets: string[] = [];
  try {
    if (bulletPoints) {
      parsedBullets = JSON.parse(bulletPoints);
    }
  } catch {
    if (bulletPoints) {
      parsedBullets = bulletPoints.split("\n").filter(Boolean);
    }
  }

  // Auto-dismiss NEW badge after 5 minutes
  useEffect(() => {
    if (!isNew) return;
    const timer = setTimeout(() => setShowNewBadge(false), 5 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [isNew]);

  const severityBorders = {
    BREAKING: "border-l-[4px] border-l-breaking pl-5",
    UPDATE: "border-l-[4px] border-l-update pl-5",
    ANALYSIS: "border-l-[4px] border-l-analysis pl-5",
    DIPLOMACY: "border-l-[4px] border-l-diplomacy pl-5",
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

  const handleShare = async () => {
    const text = `[${severity}] ${content}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS
    }
  };

  const hasBullets = parsedBullets.length > 0;

  return (
    <article
      className={`animate-fade-in-up card-hover glass-card rounded-xl p-5 relative group ${severityBorders[severity]} ${severityGlows[severity]}`}
      style={{ animationDelay: `${index * 0.05}s` }}
      aria-label={`${severity} update from ${source}`}
    >
      {/* NEW badge */}
      {showNewBadge && (
        <div className="absolute -top-2 -right-2 z-20">
          <span className="animate-new-badge inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-breaking text-white shadow-lg shadow-breaking/30">
            NEW
          </span>
        </div>
      )}

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
        <div className="flex items-center gap-2 shrink-0">
          {/* Share button */}
          <button
            onClick={handleShare}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-1 rounded"
            aria-label="Copy to clipboard"
            title="Copy to clipboard"
          >
            {copied ? (
              <svg className="h-3.5 w-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            )}
          </button>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-white/5 px-2 py-0.5 rounded font-mono">
            {source}
          </span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-foreground/90 leading-relaxed mb-3 font-medium">
        {content}
      </p>

      {/* Expand/Collapse for Bullet Points */}
      {hasBullets && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground font-mono uppercase tracking-wider transition-colors mb-2"
            aria-expanded={expanded}
          >
            <svg
              className={`h-3 w-3 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            {expanded ? "Hide" : "Show"} details ({parsedBullets.length})
          </button>

          <div className={`expandable-content ${expanded ? "expanded" : "collapsed"}`}>
            <ul className="space-y-2 ml-1 p-3 bg-black/40 rounded-lg border border-white/5">
              {parsedBullets.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                  <span className={`${bulletColors[severity]} mt-1 shrink-0 font-bold`}>▸</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
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
