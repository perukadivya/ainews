import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AINews — War & Conflict Live Tracker",
  description: "Real-time global war and conflict tracker with hourly updates, daily summaries, and countdown timers. Stay informed with AI-powered news aggregation.",
  keywords: ["war news", "live blog", "conflict tracker", "military news", "real-time updates"],
  openGraph: {
    title: "AINews — War & Conflict Live Tracker",
    description: "Real-time conflict tracker with hourly updates and AI-powered summaries",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
