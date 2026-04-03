"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface DailySummaryItem {
  id: number;
  rank: number;
  title: string;
  summary: string;
  category: string;
}

const categoryColors: Record<string, string> = {
  military: "text-breaking bg-breaking/10 border-breaking/20",
  diplomacy: "text-diplomacy bg-diplomacy/10 border-diplomacy/20",
  humanitarian: "text-update bg-update/10 border-update/20",
  economic: "text-green-400 bg-green-400/10 border-green-400/20",
  political: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  analysis: "text-analysis bg-analysis/10 border-analysis/20",
  general: "text-muted-foreground bg-white/5 border-white/10",
};

const categoryIcons: Record<string, string> = {
  military: "⚔️",
  diplomacy: "🤝",
  humanitarian: "🏥",
  economic: "📈",
  political: "🏛️",
  analysis: "🧠",
  general: "📰",
};

const MEDALS = ["🥇", "🥈", "🥉"];

export function DailyTopTen({ items }: { items: DailySummaryItem[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <div className="glass-card rounded-xl p-4 border border-white/5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          📰 Daily Top 10
        </h3>
        <p className="text-xs text-muted italic">
          No daily summary available yet. Summaries are generated once daily.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-4 border border-white/5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
        📰 Today&apos;s Top 10
      </h3>
      <div className="space-y-3 stagger-children">
        {items.map((item) => {
          const isExpanded = expandedId === (item.id || item.rank);
          const hasMedal = item.rank <= 3;

          return (
            <div
              key={item.id || item.rank}
              className="group cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : (item.id || item.rank))}
            >
              <div className="flex items-start gap-2.5">
                <div className="flex flex-col items-center justify-center shrink-0 w-8 h-8 rounded-lg bg-black/40 border border-white/5 shadow-inner">
                  {hasMedal ? (
                    <span className="medal-icon text-base leading-none">
                      {MEDALS[item.rank - 1]}
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "text-sm font-bold font-mono leading-none text-muted"
                      )}
                    >
                      {String(item.rank).padStart(2, "0")}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-foreground/90 leading-relaxed group-hover:text-white transition-colors">
                      {item.title}
                    </h4>
                    <svg
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5 transition-transform duration-200",
                        isExpanded ? "rotate-180" : ""
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Summary — collapsed shows 2 lines, expanded shows all */}
                  <p
                    className={cn(
                      "text-[11px] text-muted-foreground leading-relaxed mt-0.5 transition-all duration-200",
                      isExpanded ? "" : "line-clamp-2"
                    )}
                  >
                    {item.summary}
                  </p>

                  <div className="mt-2 text-xs">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] uppercase tracking-wider font-mono",
                        categoryColors[item.category] || categoryColors.general
                      )}
                    >
                      <span>{categoryIcons[item.category] || categoryIcons.general}</span>
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>
              {item.rank < items.length && (
                <div className="border-b border-white/5 mt-3" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
