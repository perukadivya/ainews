import type { Metadata } from "next";
import { ToastProvider } from "@/components/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ainews.kprsnt.in"),
  title: "AINews — Global Intelligence Tracker",
  description:
    "Real-time global news tracker covering wars, technology, and financial markets. Hourly AI-powered updates, daily summaries, and live countdowns from BBC, Bloomberg, TechCrunch & Gemini AI.",
  keywords: [
    "war news",
    "live blog",
    "conflict tracker",
    "military news",
    "real-time updates",
    "geopolitical news",
    "international relations",
    "AI news summary",
    "tech news tracker",
    "finance news",
    "stock market tracker",
    "crypto news",
    "AI",
  ],
  authors: [{ name: "AINews Tracker" }],
  creator: "AINews Tracker",
  publisher: "AINews",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AINews — Global Intelligence Tracker",
    description:
      "Real-time tracker covering wars, tech, and markets with AI-powered summaries",
    url: "https://ainews.kprsnt.in",
    siteName: "AINews Tracker",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AINews — Global Intelligence Tracker",
    description:
      "Real-time tracker covering wars, tech, and markets with AI-powered summaries",
    creator: "@AINewsTracker",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  other: {
    "theme-color": "#000000",
    "msapplication-TileColor": "#dc2626",
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
        <meta name="theme-color" content="#000000" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
