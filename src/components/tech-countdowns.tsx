"use client";

import { useState, useEffect } from "react";

interface TechEvent {
  title: string;
  description: string;
  time: string;
  emoji: string;
  type: "launched" | "upcoming";
}

const TECH_EVENTS: TechEvent[] = [
  // Recent launches — "time since"
  {
    title: "Meta Llama 4 Launch",
    description: "Meta's most powerful open-source model family",
    time: "2026-04-09T17:00:00Z",
    emoji: "🦙",
    type: "launched",
  },
  {
    title: "Claude Opus 4 Launch",
    description: "Anthropic's frontier reasoning model",
    time: "2026-04-08T17:00:00Z",
    emoji: "🧠",
    type: "launched",
  },
  {
    title: "GPT-5 Launch",
    description: "OpenAI's next-gen multimodal model",
    time: "2026-04-03T17:00:00Z",
    emoji: "⚡",
    type: "launched",
  },
  // Upcoming events — countdown
  {
    title: "Google I/O 2026",
    description: "Expected major Gemini & Android announcements",
    time: "2026-05-20T17:00:00Z",
    emoji: "🔮",
    type: "upcoming",
  },
  {
    title: "Apple WWDC 2026",
    description: "iOS 20, macOS & Apple Intelligence updates",
    time: "2026-06-09T17:00:00Z",
    emoji: "🍎",
    type: "upcoming",
  },
];

function getTimeDiff(target: string) {
  const diff = Math.abs(new Date(target).getTime() - Date.now());

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

function EventCard({ event }: { event: TechEvent }) {
  const [time, setTime] = useState(getTimeDiff(event.time));
  const isLaunched = event.type === "launched";

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeDiff(event.time));
    }, 1000);
    return () => clearInterval(interval);
  }, [event.time]);

  // Hide upcoming events that have passed
  if (!isLaunched && new Date(event.time).getTime() < Date.now()) return null;

  const borderColor = isLaunched ? "border-emerald-500/15" : "border-cyan-500/10";
  const accentColor = isLaunched ? "text-emerald-400" : "text-cyan-400";
  const numColor = isLaunched ? "text-emerald-400" : "text-cyan-400";
  const badgeBg = isLaunched
    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";

  return (
    <div className={`glass-card rounded-xl p-4 border ${borderColor}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{event.emoji}</span>
          <h4 className={`text-xs font-bold ${accentColor} uppercase tracking-wider`}>
            {event.title}
          </h4>
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeBg}`}>
          {isLaunched ? "Launched" : "Upcoming"}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground mb-3">
        {event.description}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {[
          { val: time.days, label: "Days" },
          { val: time.hours, label: "Hrs" },
          { val: time.minutes, label: "Min" },
          { val: time.seconds, label: "Sec" },
        ].map((unit) => (
          <div
            key={unit.label}
            className="text-center bg-black/40 rounded-lg py-1.5 border border-white/5"
          >
            <p className={`text-sm font-bold font-mono tabular-nums ${numColor}`}>
              {String(unit.val).padStart(2, "0")}
            </p>
            <p className="text-[8px] uppercase tracking-wider text-muted-foreground">
              {unit.label}
            </p>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-muted-foreground/60 text-center mt-2 font-mono">
        {isLaunched ? "⏱ Time since launch" : "⏳ Time until event"}
      </p>
    </div>
  );
}

export function TechCountdowns() {
  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        🚀 AI Model Launches & Upcoming Events
      </h3>
      {TECH_EVENTS.map((event) => (
        <EventCard key={event.title} event={event} />
      ))}
    </div>
  );
}
