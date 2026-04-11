"use client";

import { useEffect, useRef, useState } from "react";

interface TickerItem {
  id: number;
  content: string;
  severity: string;
}

export function NewsTicker({ items }: { items: TickerItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Only show breaking/urgent items
  const breakingItems = items.filter((i) => i.severity === "BREAKING");

  if (breakingItems.length === 0) return null;

  // Duplicate items for seamless infinite scroll
  const displayItems = [...breakingItems, ...breakingItems];

  return (
    <div
      className="relative mb-5 overflow-hidden rounded-xl border border-breaking/20 bg-breaking/[0.04] backdrop-blur-sm"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Left label */}
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pl-3 pr-16 bg-gradient-to-r from-black via-black/95 to-transparent">
        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-breaking font-mono whitespace-nowrap">
          <span className="h-1.5 w-1.5 rounded-full bg-breaking animate-pulse-live" />
          Breaking
        </span>
      </div>

      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />

      {/* Scrolling content */}
      <div
        ref={scrollRef}
        className="ticker-scroll flex items-center gap-8 py-2.5 pl-56"
        style={{ animationPlayState: isPaused ? "paused" : "running" }}
      >
        {displayItems.map((item, i) => (
          <a
            key={`${item.id}-${i}`}
            href={`#update-${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById(`update-${item.id}`);
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                el.classList.add("animate-shake");
                setTimeout(() => el.classList.remove("animate-shake"), 700);
              }
            }}
            className="flex items-center gap-3 shrink-0 group cursor-pointer"
          >
            <span className="h-1 w-1 rounded-full bg-breaking/60 shrink-0" />
            <span className="text-xs text-foreground/80 group-hover:text-breaking transition-colors whitespace-nowrap font-medium">
              {item.content.length > 120
                ? item.content.substring(0, 120) + "…"
                : item.content}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
