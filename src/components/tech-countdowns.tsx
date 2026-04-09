"use client";

import { useState, useEffect } from "react";

interface TechCountdown {
  title: string;
  description: string;
  targetTime: string;
  emoji: string;
}

// Hardcoded upcoming tech events — update these manually as needed
const TECH_EVENTS: TechCountdown[] = [
  {
    title: "Google I/O 2026",
    description: "Expected major Gemini & Android announcements",
    targetTime: "2026-05-20T17:00:00Z",
    emoji: "🔮",
  },
  {
    title: "Apple WWDC 2026",
    description: "iOS 20, macOS & Apple Intelligence updates",
    targetTime: "2026-06-09T17:00:00Z",
    emoji: "🍎",
  },
  {
    title: "GPT-5 Expected Launch",
    description: "OpenAI's next-gen model rumored window",
    targetTime: "2026-06-01T00:00:00Z",
    emoji: "🤖",
  },
];

function getTimeRemaining(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

function CountdownCard({ event }: { event: TechCountdown }) {
  const [time, setTime] = useState(getTimeRemaining(event.targetTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeRemaining(event.targetTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [event.targetTime]);

  if (!time) return null;

  return (
    <div className="glass-card rounded-xl p-4 border border-cyan-500/10">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{event.emoji}</span>
        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
          {event.title}
        </h4>
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
            <p className="text-sm font-bold font-mono tabular-nums text-cyan-400">
              {String(unit.val).padStart(2, "0")}
            </p>
            <p className="text-[8px] uppercase tracking-wider text-muted-foreground">
              {unit.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TechCountdowns() {
  const activeEvents = TECH_EVENTS.filter(
    (e) => getTimeRemaining(e.targetTime) !== null
  );

  if (activeEvents.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        🚀 Upcoming Tech Events
      </h3>
      {activeEvents.map((event) => (
        <CountdownCard key={event.title} event={event} />
      ))}
    </div>
  );
}
