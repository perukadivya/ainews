"use client";

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const isTech = pathname.startsWith("/tech");

  const accentColor = isTech ? "text-cyan-400" : "text-breaking";
  const accentBg = isTech
    ? "bg-gradient-to-br from-cyan-500 to-blue-600"
    : "bg-gradient-to-br from-breaking to-red-900";
  const bulletColor = isTech ? "text-cyan-400" : "text-breaking";

  return (
    <footer className="border-t border-white/5 mt-12 bg-black/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`h-6 w-6 rounded ${accentBg} flex items-center justify-center font-mono font-bold text-[9px]`}
              >
                AI
              </div>
              <span className="text-sm font-bold">
                AI<span className={accentColor}>News</span>
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              AI-powered global news tracker. Data aggregated from BBC, Reuters,
              Al Jazeera, TechCrunch RSS &amp; Gemini AI analysis.
            </p>
          </div>
          {/* Info */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              How It Works
            </h4>
            <ul className="space-y-1.5 text-[11px] text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <span className={bulletColor}>▸</span> Multi-source RSS feeds
                scanned hourly
              </li>
              <li className="flex items-center gap-1.5">
                <span className={bulletColor}>▸</span> Gemini AI summarizes
                &amp; categorizes
              </li>
              <li className="flex items-center gap-1.5">
                <span className={bulletColor}>▸</span> Daily Top 10 generated
                at 02:00 UTC (07:30 AM IST)
              </li>
            </ul>
          </div>
          {/* Status */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              System Status
            </h4>
            <div className="space-y-1.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-live" />
                <span>Live data pipeline active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                <span>Daily cron: 02:00 UTC (07:30 AM IST)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                <span>Auto-refresh: every 60 min</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <p className="text-[10px] text-muted font-mono">
            © {new Date().getFullYear()} AINews • Built with Next.js, Turso
            &amp; Gemini AI
          </p>
        </div>
      </div>
    </footer>
  );
}
