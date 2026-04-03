"use client";

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";

interface Toast {
  id: string;
  message: string;
  severity?: "BREAKING" | "UPDATE" | "ANALYSIS" | "DIPLOMACY" | "info";
  duration?: number;
  onClick?: () => void;
}

interface ToastContextValue {
  addToast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const severityStyles: Record<string, { border: string; bg: string; text: string; icon: string }> = {
  BREAKING: { border: "border-l-breaking", bg: "bg-breaking/10", text: "text-breaking", icon: "🔴" },
  UPDATE: { border: "border-l-update", bg: "bg-update/10", text: "text-update", icon: "🟡" },
  ANALYSIS: { border: "border-l-analysis", bg: "bg-analysis/10", text: "text-analysis", icon: "🔵" },
  DIPLOMACY: { border: "border-l-diplomacy", bg: "bg-diplomacy/10", text: "text-diplomacy", icon: "🟣" },
  info: { border: "border-l-white/30", bg: "bg-white/5", text: "text-foreground", icon: "📡" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<(Toast & { exiting?: boolean })[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const duration = toast.duration ?? 5000;

      setToasts((prev) => [...prev.slice(-4), { ...toast, id }]); // Keep max 5

      const timer = setTimeout(() => removeToast(id), duration);
      timersRef.current.set(id, timer);

      return id;
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast container */}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => {
          const style = severityStyles[toast.severity || "info"];
          return (
            <div
              key={toast.id}
              onClick={() => {
                toast.onClick?.();
                removeToast(toast.id);
              }}
              className={`
                ${toast.exiting ? "animate-toast-out" : "animate-toast-in"}
                glass-card-elevated rounded-lg px-4 py-3 border border-white/10 
                border-l-[3px] ${style.border} ${style.bg}
                cursor-pointer hover:border-white/20 transition-colors
                min-w-[250px] max-w-[350px] shadow-2xl
              `}
              role="alert"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm shrink-0">{style.icon}</span>
                <p className={`text-xs font-medium ${style.text} leading-relaxed`}>{toast.message}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(toast.id);
                  }}
                  className="ml-auto shrink-0 text-muted hover:text-foreground transition-colors"
                  aria-label="Dismiss"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
