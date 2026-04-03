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
              <div className="flex flex-col items-center justify-center shrink-0 w-8 h-8 rounded-lg bg-black/40 border border-white/5 shadow-inner">
                <span
                  className={cn(
                    "text-sm font-bold font-mono leading-none",
                    item.rank === 1 ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" : 
                    item.rank === 2 ? "text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.6)]" :
                    item.rank === 3 ? "text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.6)]" : 
                    "text-muted"
                  )}
                >
                  {String(item.rank).padStart(2, "0")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-foreground/90 leading-relaxed group-hover:text-white transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
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
        ))}
      </div>
    </div>
  );
}
