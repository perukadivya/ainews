"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-black/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-breaking to-red-800 flex items-center justify-center font-mono font-bold text-sm">
              AI
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight leading-none">
              AI<span className="text-breaking">News</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted font-medium">
              War & Conflict Tracker
            </span>
          </div>
        </Link>

        {/* Center: LIVE indicator */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full border border-breaking/30 bg-breaking/5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-pulse-live absolute inline-flex h-full w-full rounded-full bg-breaking opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-breaking"></span>
          </span>
          <span className="text-xs font-semibold text-breaking uppercase tracking-wider font-mono">
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
