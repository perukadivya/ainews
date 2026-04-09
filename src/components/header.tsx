"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const isTech = pathname.startsWith("/tech");

  const colorPrimary = isTech ? "cyan-500" : "breaking";
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
        {/* Left Side: Logo + Domain Switchers (War / Tech) */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Logo / Brand */}
          <Link href={isTech ? "/tech" : "/"} className="flex items-center gap-3 group">
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

          {/* Domain Context Selectors */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
            <Link
              href="/tech"
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200",
                isTech
                  ? "bg-cyan-500/20 text-cyan-400 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              Tech
            </Link>
            <Link
              href="/"
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200",
                !isTech
                  ? "bg-breaking/20 text-breaking shadow-[inset_0_0_10px_rgba(220,38,38,0.1)]"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              War
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

        {/* Right Side: View Navigators (Live Feed / Archive) */}
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
