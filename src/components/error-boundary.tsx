"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="glass-card rounded-xl p-10 text-center border border-white/5 max-w-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-breaking/10 border border-breaking/20 mb-5">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
              An unexpected error occurred while rendering this section.
            </p>
            {this.state.error && (
              <p className="text-[11px] text-muted font-mono bg-black/40 p-2 rounded mb-5 break-all">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-5 py-2.5 text-sm font-medium rounded-lg bg-breaking text-white hover:bg-breaking/90 transition-all shadow-lg shadow-breaking/20"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
