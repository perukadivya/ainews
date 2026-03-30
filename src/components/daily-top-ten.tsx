"use client";

import { cn } from "@/lib/utils";

interface DailySummaryItem {
  id: number;
  rank: number;
  title: string;
  summary: string;
  category: string;
}

const categoryColors: Record<string, string> = {
  military: "text-breaking",
  diplomacy: "text-diplomacy",
  humanitarian: "text-update",
  economic: "text-green-400",
  political: "text-blue-400",
  analysis: "text-analysis",
  general: "text-muted-foreground",
};

export function DailyTopTen({ items }: { items: DailySummaryItem[] }) {
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
        {items.map((item) => (
          <div
            key={item.id || item.rank}
            className="group cursor-default"
          >
            <div className="flex items-start gap-2.5">
              <span
                className={cn(
                  "text-lg font-bold font-mono leading-none mt-0.5 min-w-[1.5rem]",
                  item.rank <= 3 ? "text-breaking" : "text-muted"
                )}
              >
                {String(item.rank).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-foreground/90 leading-relaxed group-hover:text-white transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
                  {item.summary}
                </p>
                <span
                  className={cn(
                    "text-[9px] uppercase tracking-wider font-mono mt-1 inline-block",
                    categoryColors[item.category] || categoryColors.general
                  )}
                >
                  {item.category}
                </span>
              </div>
            </div>
            {item.rank < items.length && (
              <div className="border-b border-white/5 mt-3" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
