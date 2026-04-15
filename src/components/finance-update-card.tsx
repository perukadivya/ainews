"use client";

import { useState } from "react";
import { formatRelativeTime, formatTimestamp } from "@/lib/utils";

export type FinanceCategory =
  | "markets"
  | "crypto"
  | "commodities"
  | "central_banks"
  | "earnings"
  | "ipo_ma"
  | "regulation"
  | "forex"
  | "general";

export const FINANCE_CATEGORY_CONFIG: Record<
  FinanceCategory,
  { label: string; emoji: string; color: string; bgColor: string; borderColor: string }
> = {
  markets: {
    label: "Markets",
    emoji: "📈",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  crypto: {
    label: "Crypto",
    emoji: "₿",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  commodities: {
    label: "Commodities",
    emoji: "🛢️",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  central_banks: {
    label: "Central Banks",
    emoji: "🏦",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  earnings: {
    label: "Earnings",
    emoji: "💰",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  ipo_ma: {
    label: "IPO/M&A",
    emoji: "🤝",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
  },
  regulation: {
    label: "Regulation",
    emoji: "⚖️",
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
  },
  forex: {
    label: "Forex",
    emoji: "💱",
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

export interface FinanceUpdate {
  id: number;
  timestamp: string;
  content: string;
  source: string;
  category: string;
  bullet_points: string | null;
  link: string | null;
  created_at: string;
}

interface FinanceUpdateCardProps {
  update: FinanceUpdate;
  index: number;
  isNew?: boolean;
}

export function FinanceUpdateCard({ update, index, isNew }: FinanceUpdateCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const category = (update.category as FinanceCategory) || "general";
  const config = FINANCE_CATEGORY_CONFIG[category] || FINANCE_CATEGORY_CONFIG.general;

  const bulletPoints = update.bullet_points
    ? (() => {
        try {
          return JSON.parse(update.bullet_points);
        } catch {
          return null;
        }
      })()
    : null;

  const date = new Date(update.timestamp + "Z");
  const relativeTime = formatRelativeTime(date);
  const fullTimestamp = formatTimestamp(date);

  const sourceDisplay = update.source
    ?.replace("Multi-Source Finance RSS", "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean)
    .join(", ");

  return (
    <article
      className={`glass-card rounded-xl border border-white/5 p-4 transition-all card-hover animate-fade-in-up ${
        isNew ? "ring-1 ring-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : ""
      }`}
      style={{ animationDelay: `${index * 0.05}s` }}
      id={`finance-update-${update.id}`}
    >
      {/* Header: Category + Time */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${config.bgColor} ${config.color} border ${config.borderColor}`}>
            <span className="text-xs">{config.emoji}</span>
            {config.label}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {relativeTime}
          </span>
          {isNew && (
            <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded animate-new-badge">
              NEW
            </span>
          )}
        </div>
        {update.link && (
          <a
            href={update.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-medium"
          >
            READ MORE
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>

      {/* Source */}
      {sourceDisplay && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[9px] uppercase tracking-wider text-muted font-mono">
            {sourceDisplay}
          </span>
        </div>
      )}

      {/* Content */}
      <p className="text-sm leading-relaxed text-foreground/90 mb-2">
        {update.content}
      </p>

      {/* Bullet points expandable */}
      {bulletPoints && Array.isArray(bulletPoints) && bulletPoints.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
          >
            <span>{showDetails ? "▾" : "▸"}</span>
            {showDetails ? "Hide" : "Show"} details ({bulletPoints.length})
          </button>
          {showDetails && (
            <ul className="mt-2 space-y-1 animate-expand">
              {bulletPoints.map((point: string, i: number) => (
                <li
                  key={i}
                  className="text-xs text-muted-foreground flex items-start gap-2 pl-1"
                >
                  <span className={`mt-1.5 h-1 w-1 rounded-full shrink-0 ${config.color.replace("text-", "bg-")}`} />
                  {point}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
        <span className="text-[10px] text-muted font-mono">{fullTimestamp}</span>
        {update.link && (
          <a
            href={update.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted-foreground hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            READ MORE
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </article>
  );
}
