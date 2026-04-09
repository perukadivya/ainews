"use client";

import { useState, useEffect } from "react";
import { formatRelativeTime, formatTimestamp } from "@/lib/utils";

export interface TechUpdate {
  id: number;
  timestamp: string;
  content: string;
  source: string;
  category: string;
  bullet_points: string | null;
  link: string | null;
  created_at: string;
}

export type TechCategory =
  | "ai"
  | "cybersecurity"
  | "startups"
  | "hardware"
  | "software"
  | "crypto"
  | "policy"
  | "science"
  | "general";

export const CATEGORY_CONFIG: Record<
  TechCategory,
  { label: string; emoji: string; color: string; bgColor: string; borderColor: string }
> = {
  ai: {
    label: "AI & ML",
    emoji: "🤖",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
  },
  cybersecurity: {
    label: "Security",
    emoji: "🛡️",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
  startups: {
    label: "Startups",
    emoji: "🚀",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  hardware: {
    label: "Hardware",
    emoji: "🔧",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  software: {
    label: "Software",
    emoji: "💻",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  crypto: {
    label: "Crypto",
    emoji: "₿",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  policy: {
    label: "Policy",
    emoji: "⚖️",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/30",
  },
  science: {
    label: "Science",
    emoji: "🔬",
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/30",
  },
  general: {
    label: "General",
    emoji: "📰",
    color: "text-gray-400",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/30",
  },
};


export function TechUpdateCard({
  update,
  index,
  isNew,
}: {
  update: TechUpdate;
  index: number;
  isNew?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showNewBadge, setShowNewBadge] = useState(isNew);
  const [copied, setCopied] = useState(false);
  const category = (update.category as TechCategory) || "general";
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.general;

  // Auto-dismiss NEW badge after 5 minutes
  useEffect(() => {
    if (!isNew) return;
    const timer = setTimeout(() => setShowNewBadge(false), 5 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [isNew]);

  const date = new Date(update.timestamp + "Z");

  const handleShare = async () => {
    const text = `[${config.label}] ${update.content}`;
    try {
      if (update.link) {
        await navigator.clipboard.writeText(`${text}\n\nRead more: ${update.link}`);
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  let bulletPoints: string[] = [];
  if (update.bullet_points) {
    try {
      bulletPoints = JSON.parse(update.bullet_points);
    } catch {
      bulletPoints = [];
    }
  }

  const time = new Date(update.timestamp + "Z").toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article
      className={`glass-card rounded-xl border-y border-r border-white/5 border-l-[4px] ${config.borderColor} card-hover animate-fade-in-up relative group lg:pl-5`}
      style={{ animationDelay: `${index * 0.05}s` }}
      id={`tech-update-${update.id}`}
    >
      {/* Timeline dot */}
      <div className="absolute -left-[29px] top-6 z-10 hidden lg:block">
        <div
          className={`h-3 w-3 rounded-full border-2 border-card ${config.bgColor.replace('/10', '')} ${isNew ? 'animate-pulse-live' : ''}`}
        />
      </div>

      <div className="p-4 sm:p-5">
        {/* Top row: Category badge + time + NEW badge */}
        {/* NEW badge */}
        {showNewBadge && (
          <div className="absolute -top-2 -right-2 z-20">
            <span className="animate-new-badge inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
              NEW
            </span>
          </div>
        )}

        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bgColor} ${config.color} border ${config.borderColor}`}
            >
              <span>{config.emoji}</span>
              {config.label}
            </span>
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
              {update.source}
            </span>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed text-foreground/90 mb-3">
          {update.content}
        </p>

        {/* Bullet points (expandable) */}
        {bulletPoints.length > 0 && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[11px] text-muted-foreground hover:text-white transition-colors flex items-center gap-1 mb-2"
            >
              <svg
                className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              {expanded ? "Hide" : "Show"} details ({bulletPoints.length})
            </button>

            {expanded && (
              <ul className="space-y-1.5 pl-3 border-l-2 border-white/10 animate-expand">
                {bulletPoints.map((point, i) => (
                  <li
                    key={i}
                    className="text-xs text-muted-foreground flex items-start gap-2"
                  >
                    <span className={`mt-0.5 ${config.color}`}>▸</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {/* Footer: Time + Link */}
        <footer className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <time dateTime={date.toISOString()} className="text-[10px] text-muted font-mono">
            {formatTimestamp(date)}
          </time>
          {update.link && (
            <a
              href={update.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-muted-foreground hover:text-white transition-colors flex items-center gap-1 uppercase tracking-wider font-bold"
            >
              Read more
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </footer>
      </div>
    </article>
  );
}
