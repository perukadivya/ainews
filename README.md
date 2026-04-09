# AINews — Live News Tracker by AI

Real-time global war and conflict tracker, tech news tracker with AI-powered hourly updates, daily summaries, and countdown timers.

![AINews Screenshot](https://img.shields.io/badge/Status-Live-red?style=for-the-badge)

## Features

- 🔴 **Live Blog** — Hourly updates from BBC RSS + Gemini AI
- ⚔️ **Active Conflicts** — Track 5+ ongoing wars with individual duration counters
- ⏱ **Countdown Timers** — Auto-detected deadlines & ultimatums
- 📰 **Daily Top 10** — AI-ranked daily news summary
- 📅 **Archive** — Browse any past date's news

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS v4 + Custom dark theme
- **AI**: Google Gemini 2.0 Flash
- **Database**: SQLite (local) / Cloudflare D1 (production)
- **News Source**: BBC RSS feeds + Gemini fallback

## Quick Start

```bash
# Install dependencies
npm install

# Add your Gemini API key
cp .env.example .env.local
# Edit .env.local with your key from https://aistudio.google.com/

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **"Fetch Latest News"** to pull your first update.

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/cron/hourly` | Fetch RSS + summarize (run hourly) |
| `GET /api/cron/daily` | Generate top 10 + countdowns (run daily) |
| `GET /api/feed?date=YYYY-MM-DD` | Get live updates |
| `GET /api/daily?date=YYYY-MM-DD` | Get daily summaries |
| `GET /api/countdowns` | Get active countdowns |
| `GET /api/dates` | Get dates with data |

## Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key_here
CRON_SECRET=your_random_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## License

MIT
