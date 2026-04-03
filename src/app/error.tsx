"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="glass-card-elevated rounded-2xl p-12 text-center max-w-lg w-full border border-white/10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-breaking/10 border border-breaking/20 mb-6">
          <span className="text-4xl">💥</span>
        </div>
        <h1 className="text-2xl font-bold mb-3 text-gradient">Something Went Wrong</h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          An error occurred while loading this page. This could be a temporary issue with our data pipeline or network connectivity.
        </p>
        {error.digest && (
          <p className="text-[10px] text-muted font-mono mb-6 bg-black/40 px-3 py-1.5 rounded-lg inline-block">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-breaking text-white hover:bg-breaking/90 transition-all shadow-lg shadow-breaking/20"
          >
            ↻ Try Again
          </button>
          <a
            href="/"
            className="px-6 py-2.5 text-sm font-medium rounded-lg bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 border border-white/10 transition-all"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
