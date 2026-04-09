"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const isTech = pathname.startsWith("/tech");

  const colorText = isTech ? "text-cyan-400" : "text-breaking";
  const colorPulse = isTech ? "bg-cyan-500" : "bg-breaking";
  const colorShadow = isTech
    ? "shadow-[0_0_8px_rgba(6,182,212,0.8)]"
    : "shadow-[0_0_8px_rgba(220,38,38,0.8)]";
  const glowShadow = isTech
    ? "shadow-[0_0_15px_rgba(6,182,212,0.1)]"
    : "shadow-[0_0_15px_rgba(220,38,38,0.1)]";
  const activeBg = isTech ? "bg-cyan-500/10" : "bg-breaking/10";
  const activeBorder = isTech ? "border-cyan-500/20" : "border-breaking/20";
  const activeInnerGlow = isTech
    ? "shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]"
    : "shadow-[inset_0_0_15px_rgba(220,38,38,0.1)]";

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
      {/* Top accent line */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent to-transparent opacity-50",
          isTech ? "via-cyan-500/50" : "via-breaking/50"
        )}
      />

      {/* Scanning line effect */}
      <div className="scanning-line" />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 relative">
        {/* Left Side: Logo + Domain Tabs */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Logo — always goes to home */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative flex items-center justify-center hidden sm:flex">
              <div
                className={cn(
                  "absolute inset-0 blur-md opacity-20 rounded-lg group-hover:opacity-40 transition-opacity",
                  colorPulse
                )}
              />
              <div
                className={cn(
                  "h-8 w-8 rounded-lg border border-white/10 flex items-center justify-center font-mono font-bold text-sm relative z-10 shadow-lg",
                  isTech
                    ? "bg-gradient-to-br from-cyan-500 to-blue-900"
                    : "bg-gradient-to-br from-breaking to-red-900"
                )}
              >
                AI
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight leading-none text-gradient">
                AI
                <span className={isTech ? "text-gradient-cyan" : "text-gradient-red"}>
                  News
                </span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted font-medium hidden sm:block">
                Live News
              </span>
            </div>
          </Link>

          {/* Separator */}
          <div className="hidden sm:block w-px h-8 bg-white/10" />

          {/* Domain Tabs — War first, then Tech */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <Link
              href="/"
              className={cn(
                "relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5",
                !isTech
                  ? "bg-breaking/15 text-breaking border border-breaking/25 shadow-[0_0_12px_rgba(220,38,38,0.1)]"
                  : "text-muted-foreground/70 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <span className={cn(
                "h-1.5 w-1.5 rounded-full transition-all",
                !isTech ? "bg-breaking shadow-[0_0_6px_rgba(220,38,38,0.6)]" : "bg-white/20"
              )} />
              War
            </Link>
            <Link
              href="/tech"
              className={cn(
                "relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5",
                isTech
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 shadow-[0_0_12px_rgba(6,182,212,0.1)]"
                  : "text-muted-foreground/70 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <span className={cn(
                "h-1.5 w-1.5 rounded-full transition-all",
                isTech ? "bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.6)]" : "bg-white/20"
              )} />
              Tech
            </Link>
          </div>
        </div>

        {/* Center: LIVE indicator */}
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border backdrop-blur-md",
            isTech ? "border-cyan-500/30 bg-cyan-500/5" : "border-breaking/30 bg-breaking/5",
            glowShadow
          )}
        >
          <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0">
            <span
              className={cn(
                "animate-pulse-live absolute inline-flex h-full w-full rounded-full opacity-75",
                colorPulse
              )}
            ></span>
            <span
              className={cn("relative inline-flex rounded-full h-full w-full", colorPulse, colorShadow)}
            ></span>
          </span>
          <span
            className={cn(
              "text-[10px] sm:text-[11px] font-bold uppercase tracking-widest font-mono",
              colorText
            )}
          >
            Live
          </span>
        </div>

        {/* Right Side: View Navigators */}
        <div className="flex items-center gap-2">
          {/* Mobile LIVE indicator */}
          <div
            className={cn(
              "flex md:hidden items-center gap-2 px-2 py-1.5 rounded-full border bg-opacity-5 mr-1",
              isTech ? "border-cyan-500/30 bg-cyan-500" : "border-breaking/30 bg-breaking"
            )}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span
                className={cn(
                  "animate-pulse-live absolute inline-flex h-full w-full rounded-full opacity-75",
                  colorPulse
                )}
              ></span>
              <span
                className={cn("relative inline-flex rounded-full h-full w-full", colorPulse, colorShadow)}
              ></span>
            </span>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href={isTech ? "/tech" : "/"}
              className={cn(
                "px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200",
                pathname === "/" || pathname === "/tech"
                  ? cn(activeBg, colorText, "border", activeBorder, activeInnerGlow)
                  : "text-muted-foreground hover:text-white hover:bg-white/5 font-medium"
              )}
            >
              <span className="hidden sm:inline">Live Feed</span>
              <span className="sm:hidden">Feed</span>
            </Link>
            <Link
              href={isTech ? "/tech/archive" : "/archive"}
              className={cn(
                "px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200",
                pathname.includes("archive")
                  ? cn(activeBg, colorText, "border", activeBorder, activeInnerGlow)
                  : "text-muted-foreground hover:text-white hover:bg-white/5 font-medium"
              )}
            >
              Archive
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
