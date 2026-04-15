"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Section = "war" | "tech" | "finance";

function getActiveSection(pathname: string): Section {
  if (pathname.startsWith("/tech")) return "tech";
  if (pathname.startsWith("/finance")) return "finance";
  return "war";
}

const SECTION_COLORS = {
  war: {
    text: "text-breaking",
    pulse: "bg-breaking",
    shadow: "shadow-[0_0_8px_rgba(220,38,38,0.8)]",
    glowShadow: "shadow-[0_0_15px_rgba(220,38,38,0.1)]",
    activeBg: "bg-breaking/10",
    activeBorder: "border-breaking/20",
    activeInnerGlow: "shadow-[inset_0_0_15px_rgba(220,38,38,0.1)]",
    via: "via-breaking/50",
    border30: "border-breaking/30",
    bg5: "bg-breaking/5",
    tabActiveBg: "bg-breaking/10",
    tabActiveText: "text-breaking",
    tabActiveBorder: "border-breaking/30",
    tabActiveShadow: "shadow-[0_0_20px_rgba(220,38,38,0.15)]",
    gradientFrom: "from-breaking",
    gradientTo: "to-red-900",
    shimmerVia: "via-breaking/10",
  },
  tech: {
    text: "text-cyan-400",
    pulse: "bg-cyan-500",
    shadow: "shadow-[0_0_8px_rgba(6,182,212,0.8)]",
    glowShadow: "shadow-[0_0_15px_rgba(6,182,212,0.1)]",
    activeBg: "bg-cyan-500/10",
    activeBorder: "border-cyan-500/20",
    activeInnerGlow: "shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]",
    via: "via-cyan-500/50",
    border30: "border-cyan-500/30",
    bg5: "bg-cyan-500/5",
    tabActiveBg: "bg-cyan-500/10",
    tabActiveText: "text-cyan-400",
    tabActiveBorder: "border-cyan-500/30",
    tabActiveShadow: "shadow-[0_0_20px_rgba(6,182,212,0.15)]",
    gradientFrom: "from-cyan-500",
    gradientTo: "to-blue-900",
    shimmerVia: "via-cyan-400/10",
  },
  finance: {
    text: "text-emerald-400",
    pulse: "bg-emerald-500",
    shadow: "shadow-[0_0_8px_rgba(16,185,129,0.8)]",
    glowShadow: "shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    activeBg: "bg-emerald-500/10",
    activeBorder: "border-emerald-500/20",
    activeInnerGlow: "shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]",
    via: "via-emerald-500/50",
    border30: "border-emerald-500/30",
    bg5: "bg-emerald-500/5",
    tabActiveBg: "bg-emerald-500/10",
    tabActiveText: "text-emerald-400",
    tabActiveBorder: "border-emerald-500/30",
    tabActiveShadow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    gradientFrom: "from-emerald-500",
    gradientTo: "to-green-900",
    shimmerVia: "via-emerald-400/10",
  },
};

export function Header() {
  const pathname = usePathname();
  const section = getActiveSection(pathname);
  const colors = SECTION_COLORS[section];

  const feedLink = section === "tech" ? "/tech" : section === "finance" ? "/finance" : "/";
  const archiveLink = section === "tech" ? "/tech/archive" : section === "finance" ? "/finance/archive" : "/archive";

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
      {/* Top accent line */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent to-transparent opacity-50",
          colors.via
        )}
      />

      {/* Scanning line effect */}
      <div className="scanning-line" />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 relative">
        {/* Left Side: Logo + Domain Tabs */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative flex items-center justify-center hidden sm:flex">
              <div
                className={cn(
                  "absolute inset-0 blur-md opacity-20 rounded-lg group-hover:opacity-40 transition-opacity",
                  colors.pulse
                )}
              />
              <div
                className={cn(
                  "h-8 w-8 rounded-lg border border-white/10 flex items-center justify-center font-mono font-bold text-sm relative z-10 shadow-lg",
                  `bg-gradient-to-br ${colors.gradientFrom} ${colors.gradientTo}`
                )}
              >
                AI
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight leading-none text-gradient">
                AI
                <span className={section === "tech" ? "text-gradient-cyan" : section === "finance" ? "text-gradient-green" : "text-gradient-red"}>
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

          {/* Domain Tabs */}
          <div className="flex items-center gap-1.5 mt-1 sm:mt-0">
            {/* War Tab */}
            <Link
              href="/"
              className={cn(
                "group relative px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300 flex items-center gap-1 sm:gap-1.5 overflow-hidden border",
                section === "war"
                  ? `${SECTION_COLORS.war.tabActiveBg} ${SECTION_COLORS.war.tabActiveText} ${SECTION_COLORS.war.tabActiveBorder} ${SECTION_COLORS.war.tabActiveShadow}`
                  : "bg-white/[0.02] text-muted-foreground hover:bg-white/[0.05] border-white/5 hover:text-white"
              )}
            >
              {section === "war" && (
                <div className={`absolute inset-0 bg-gradient-to-r from-breaking/0 ${SECTION_COLORS.war.shimmerVia} to-breaking/0 translate-x-[-100%] animate-[shimmer_2s_infinite]`} />
              )}
              <svg className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5", section === "war" ? "text-breaking" : "text-muted-foreground group-hover:text-white")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              <span className="hidden sm:inline">Conflicts</span>
            </Link>

            {/* Tech Tab */}
            <Link
              href="/tech"
              className={cn(
                "group relative px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300 flex items-center gap-1 sm:gap-1.5 overflow-hidden border",
                section === "tech"
                  ? `${SECTION_COLORS.tech.tabActiveBg} ${SECTION_COLORS.tech.tabActiveText} ${SECTION_COLORS.tech.tabActiveBorder} ${SECTION_COLORS.tech.tabActiveShadow}`
                  : "bg-white/[0.02] text-muted-foreground hover:bg-white/[0.05] border-white/5 hover:text-white"
              )}
            >
              {section === "tech" && (
                <div className={`absolute inset-0 bg-gradient-to-r from-cyan-400/0 ${SECTION_COLORS.tech.shimmerVia} to-cyan-400/0 translate-x-[-100%] animate-[shimmer_2s_infinite]`} />
              )}
              <svg className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5", section === "tech" ? "text-cyan-400" : "text-muted-foreground group-hover:text-white")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="hidden sm:inline">Tech</span>
            </Link>

            {/* Finance Tab */}
            <Link
              href="/finance"
              className={cn(
                "group relative px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300 flex items-center gap-1 sm:gap-1.5 overflow-hidden border",
                section === "finance"
                  ? `${SECTION_COLORS.finance.tabActiveBg} ${SECTION_COLORS.finance.tabActiveText} ${SECTION_COLORS.finance.tabActiveBorder} ${SECTION_COLORS.finance.tabActiveShadow}`
                  : "bg-white/[0.02] text-muted-foreground hover:bg-white/[0.05] border-white/5 hover:text-white"
              )}
            >
              {section === "finance" && (
                <div className={`absolute inset-0 bg-gradient-to-r from-emerald-400/0 ${SECTION_COLORS.finance.shimmerVia} to-emerald-400/0 translate-x-[-100%] animate-[shimmer_2s_infinite]`} />
              )}
              <svg className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5", section === "finance" ? "text-emerald-400" : "text-muted-foreground group-hover:text-white")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 4v16" />
              </svg>
              <span className="hidden sm:inline">Finance</span>
            </Link>
          </div>
        </div>

        {/* Center: LIVE indicator */}
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border backdrop-blur-md",
            colors.border30, colors.bg5,
            colors.glowShadow
          )}
        >
          <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0">
            <span className={cn("animate-pulse-live absolute inline-flex h-full w-full rounded-full opacity-75", colors.pulse)}></span>
            <span className={cn("relative inline-flex rounded-full h-full w-full", colors.pulse, colors.shadow)}></span>
          </span>
          <span className={cn("text-[10px] sm:text-[11px] font-bold uppercase tracking-widest font-mono", colors.text)}>
            Live
          </span>
        </div>

        {/* Right Side: View Navigators */}
        <div className="flex items-center gap-2">
          {/* Mobile LIVE indicator */}
          <div
            className={cn(
              "flex md:hidden items-center gap-2 px-2 py-1.5 rounded-full border bg-opacity-5 mr-1",
              colors.border30, colors.pulse
            )}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className={cn("animate-pulse-live absolute inline-flex h-full w-full rounded-full opacity-75", colors.pulse)}></span>
              <span className={cn("relative inline-flex rounded-full h-full w-full", colors.pulse, colors.shadow)}></span>
            </span>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href={feedLink}
              className={cn(
                "px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200",
                pathname === "/" || pathname === "/tech" || pathname === "/finance"
                  ? cn(colors.activeBg, colors.text, "border", colors.activeBorder, colors.activeInnerGlow)
                  : "text-muted-foreground hover:text-white hover:bg-white/5 font-medium"
              )}
            >
              <span className="hidden sm:inline">Live Feed</span>
              <span className="sm:hidden">Feed</span>
            </Link>
            <Link
              href={archiveLink}
              className={cn(
                "px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200",
                pathname.includes("archive")
                  ? cn(colors.activeBg, colors.text, "border", colors.activeBorder, colors.activeInnerGlow)
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
