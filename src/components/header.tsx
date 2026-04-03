"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-breaking/50 to-transparent opacity-50" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-breaking blur-md opacity-20 rounded-lg group-hover:opacity-40 transition-opacity" />
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-breaking to-red-900 border border-white/10 flex items-center justify-center font-mono font-bold text-sm relative z-10 shadow-lg">
              AI
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              AI<span className="text-breaking">News</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted font-medium">
              War & Conflict Tracker
            </span>
          </div>
        </Link>

        {/* Center: LIVE indicator */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full border border-breaking/30 bg-breaking/5 backdrop-blur-md shadow-[0_0_15px_rgba(220,38,38,0.1)]">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-pulse-live absolute inline-flex h-full w-full rounded-full bg-breaking opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-breaking shadow-[0_0_8px_rgba(220,38,38,0.8)]"></span>
          </span>
          <span className="text-[11px] font-bold text-breaking uppercase tracking-widest font-mono">
            Live
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              pathname === "/"
                ? "bg-white/10 text-white"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            Live Feed
          </Link>
          <Link
            href="/archive"
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              pathname === "/archive"
                ? "bg-white/10 text-white"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            Archive
          </Link>
        </nav>
      </div>
    </header>
  );
}
