"use client";

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="shimmer h-6 w-20 rounded-full" />
            <div className="shimmer h-4 w-16 rounded" />
          </div>
          <div className="shimmer h-4 w-full rounded mb-2" />
          <div className="shimmer h-4 w-3/4 rounded mb-3" />
          <div className="space-y-1.5">
            <div className="shimmer h-3 w-5/6 rounded" />
            <div className="shimmer h-3 w-4/6 rounded" />
            <div className="shimmer h-3 w-5/6 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-4">
        <div className="shimmer h-4 w-24 rounded mb-3" />
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="shimmer h-16 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="glass-card rounded-xl p-4">
        <div className="shimmer h-4 w-32 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i}>
              <div className="shimmer h-3 w-full rounded mb-1" />
              <div className="shimmer h-3 w-2/3 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
