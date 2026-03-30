"use client";

import { cn } from "@/lib/utils";

type Severity = "BREAKING" | "UPDATE" | "ANALYSIS" | "DIPLOMACY";

const severityConfig: Record<
  Severity,
  { label: string; bg: string; text: string; dot: string; glow: string }
> = {
  BREAKING: {
    label: "BREAKING",
    bg: "bg-breaking/15",
    text: "text-breaking",
    dot: "bg-breaking",
    glow: "shadow-[0_0_10px_rgba(220,38,38,0.3)]",
  },
  UPDATE: {
    label: "UPDATE",
    bg: "bg-update/15",
    text: "text-update",
    dot: "bg-update",
    glow: "shadow-[0_0_10px_rgba(245,158,11,0.3)]",
  },
  ANALYSIS: {
    label: "ANALYSIS",
    bg: "bg-analysis/15",
    text: "text-analysis",
    dot: "bg-analysis",
    glow: "shadow-[0_0_10px_rgba(59,130,246,0.3)]",
  },
  DIPLOMACY: {
    label: "DIPLOMACY",
    bg: "bg-diplomacy/15",
    text: "text-diplomacy",
    dot: "bg-diplomacy",
    glow: "shadow-[0_0_10px_rgba(139,92,246,0.3)]",
  },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const config = severityConfig[severity] || severityConfig.UPDATE;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono",
        config.bg,
        config.text,
        config.glow
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot, severity === "BREAKING" && "animate-pulse-live")} />
      {config.label}
    </span>
  );
}
