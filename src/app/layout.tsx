import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://ainews-app.vercel.app'),
  title: "AINews — War & Conflict Live Tracker",
  description: "Real-time global war and conflict tracker with hourly updates, daily summaries, and countdown timers. Stay informed with AI-powered news aggregation.",
  keywords: ["war news", "live blog", "conflict tracker", "military news", "real-time updates", "geopolitical news", "international relations", "AI news summary"],
  authors: [{ name: "AINews Tracker" }],
  creator: "AINews Tracker",
  publisher: "AINews",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "AINews — War & Conflict Live Tracker",
    description: "Real-time conflict tracker with hourly updates and AI-powered summaries",
    url: 'https://ainews-app.vercel.app',
    siteName: 'AINews Tracker',
    locale: 'en_US',
    type: "website",
  },
  twitter: {
    card: 'summary_large_image',
    title: "AINews — War & Conflict Live Tracker",
    description: "Real-time conflict tracker with hourly updates and AI-powered summaries",
    creator: '@AINewsTracker',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
