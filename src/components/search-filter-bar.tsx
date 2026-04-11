"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Severity = "BREAKING" | "UPDATE" | "ANALYSIS" | "DIPLOMACY";

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilters: Severity[];
  onFilterToggle: (severity: Severity) => void;
  totalCount: number;
  filteredCount: number;
  onClearFilters: () => void;
}

const SEVERITY_OPTIONS: { value: Severity; label: string; color: string; icon: string }[] = [
  { value: "BREAKING", label: "Breaking", color: "text-breaking bg-breaking/15 border-breaking/30 hover:bg-breaking/25", icon: "🔴" },
  { value: "UPDATE", label: "Update", color: "text-update bg-update/15 border-update/30 hover:bg-update/25", icon: "🟡" },
  { value: "ANALYSIS", label: "Analysis", color: "text-analysis bg-analysis/15 border-analysis/30 hover:bg-analysis/25", icon: "🔵" },
  { value: "DIPLOMACY", label: "Diplomacy", color: "text-diplomacy bg-diplomacy/15 border-diplomacy/30 hover:bg-diplomacy/25", icon: "🟣" },
];

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  activeFilters,
  onFilterToggle,
  totalCount,
  filteredCount,
  onClearFilters,
}: SearchFilterBarProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange(localQuery);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [localQuery, onSearchChange]);

  const hasFilters = searchQuery.length > 0 || activeFilters.length > 0;
  const isFiltered = filteredCount !== totalCount;

  return (
    <div className="animate-slide-in-down mb-6">
      <div className="glass-card rounded-xl p-4 border border-white/5">
        {/* Search Input */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Search updates..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg pl-4 pr-12 py-2.5 text-sm text-foreground placeholder:text-muted font-medium focus:outline-none focus:border-breaking/50 search-glow transition-all"
            id="search-updates"
          />
          {!localQuery ? (
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          ) : (
            <button
              onClick={() => {
                setLocalQuery("");
                onSearchChange("");
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mr-1">Filter:</span>
          {SEVERITY_OPTIONS.map(({ value, label, color, icon }) => {
            const isActive = activeFilters.includes(value);
            return (
              <button
                key={value}
                onClick={() => onFilterToggle(value)}
                className={cn(
                  "filter-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border transition-all",
                  isActive
                    ? `${color} ring-1 ring-current/20`
                    : "text-muted-foreground bg-white/5 border-white/10 hover:bg-white/10 hover:text-foreground"
                )}
                aria-pressed={isActive}
                id={`filter-${value.toLowerCase()}`}
              >
                <span className="text-xs">{icon}</span>
                {label}
              </button>
            );
          })}

          {/* Status / Clear */}
          <div className="ml-auto flex items-center gap-2">
            {isFiltered && (
              <span className="text-[10px] text-muted-foreground font-mono">
                {filteredCount}/{totalCount}
              </span>
            )}
            {hasFilters && (
              <button
                onClick={() => {
                  onClearFilters();
                  setLocalQuery("");
                }}
                className="text-[10px] text-breaking hover:text-breaking/80 font-mono uppercase tracking-wider transition-colors"
                id="clear-filters"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
