import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="glass-card-elevated rounded-2xl p-12 text-center max-w-lg w-full border border-white/10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-6">
          <span className="text-4xl">📡</span>
        </div>
        <h1 className="text-5xl font-bold mb-2 font-mono text-gradient-red">404</h1>
        <h2 className="text-xl font-semibold mb-3 text-gradient">Signal Lost</h2>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          This page doesn&apos;t exist or has been relocated. Our intelligence network couldn&apos;t locate the requested resource.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-breaking text-white hover:bg-breaking/90 transition-all shadow-lg shadow-breaking/20"
          >
            ⚡ Live Feed
          </Link>
          <Link
            href="/archive"
            className="px-6 py-2.5 text-sm font-medium rounded-lg bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 border border-white/10 transition-all"
          >
            📅 Archive
          </Link>
        </div>
      </div>
    </div>
  );
}
