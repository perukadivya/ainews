import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "ainews.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  // Ensure data directory exists
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Initialize tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS live_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      content TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'gemini',
      severity TEXT NOT NULL DEFAULT 'UPDATE',
      bullet_points TEXT,
      raw_data TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS daily_summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      rank INTEGER NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      source_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS countdowns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      target_time TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      auto_detected INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rss_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guid TEXT UNIQUE,
      title TEXT,
      link TEXT,
      pub_date TEXT,
      content TEXT,
      processed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_live_updates_timestamp ON live_updates(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_daily_summaries_date ON daily_summaries(date);
    CREATE INDEX IF NOT EXISTS idx_countdowns_active ON countdowns(is_active);
    CREATE INDEX IF NOT EXISTS idx_rss_cache_processed ON rss_cache(processed);
  `);

  return db;
}

// Types
export interface LiveUpdate {
  id: number;
  timestamp: string;
  content: string;
  source: string;
  severity: "BREAKING" | "UPDATE" | "ANALYSIS" | "DIPLOMACY";
  bullet_points: string | null;
  created_at: string;
}

export interface DailySummary {
  id: number;
  date: string;
  rank: number;
  title: string;
  summary: string;
  category: string;
  source_url: string | null;
  created_at: string;
}

export interface Countdown {
  id: number;
  title: string;
  description: string | null;
  target_time: string;
  is_active: number;
  auto_detected: number;
  created_at: string;
}

// Data access functions
export function insertLiveUpdate(
  content: string,
  source: string,
  severity: string,
  bulletPoints: string | null
): LiveUpdate {
  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO live_updates (content, source, severity, bullet_points) VALUES (?, ?, ?, ?)`
  );
  const result = stmt.run(content, source, severity, bulletPoints);
  return db
    .prepare("SELECT * FROM live_updates WHERE id = ?")
    .get(result.lastInsertRowid) as LiveUpdate;
}

export function getLiveUpdates(
  date?: string,
  limit = 50,
  offset = 0
): LiveUpdate[] {
  const db = getDb();
  if (date) {
    return db
      .prepare(
        `SELECT * FROM live_updates WHERE date(timestamp) = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?`
      )
      .all(date, limit, offset) as LiveUpdate[];
  }
  return db
    .prepare(
      `SELECT * FROM live_updates ORDER BY timestamp DESC LIMIT ? OFFSET ?`
    )
    .all(limit, offset) as LiveUpdate[];
}

export function insertDailySummary(
  date: string,
  rank: number,
  title: string,
  summary: string,
  category: string
): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO daily_summaries (date, rank, title, summary, category) VALUES (?, ?, ?, ?, ?)`
  ).run(date, rank, title, summary, category);
}

export function getDailySummaries(date: string): DailySummary[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM daily_summaries WHERE date = ? ORDER BY rank ASC`
    )
    .all(date) as DailySummary[];
}

export function insertCountdown(
  title: string,
  description: string,
  targetTime: string
): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO countdowns (title, description, target_time) VALUES (?, ?, ?)`
  ).run(title, description, targetTime);
}

export function getActiveCountdowns(): Countdown[] {
  const db = getDb();
  // Deactivate expired countdowns
  db.prepare(
    `UPDATE countdowns SET is_active = 0 WHERE target_time < datetime('now') AND is_active = 1`
  ).run();
  return db
    .prepare(`SELECT * FROM countdowns WHERE is_active = 1 ORDER BY target_time ASC`)
    .all() as Countdown[];
}

export function deactivateExpiredCountdowns(): void {
  const db = getDb();
  db.prepare(
    `UPDATE countdowns SET is_active = 0 WHERE target_time < datetime('now') AND is_active = 1`
  ).run();
}

export function getAvailableDates(): string[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT DISTINCT date(timestamp) as date FROM live_updates ORDER BY date DESC`
    )
    .all() as { date: string }[];
  return rows.map((r) => r.date);
}

export function cacheRSSItem(
  guid: string,
  title: string,
  link: string,
  pubDate: string,
  content: string
): boolean {
  const db = getDb();
  try {
    db.prepare(
      `INSERT OR IGNORE INTO rss_cache (guid, title, link, pub_date, content) VALUES (?, ?, ?, ?, ?)`
    ).run(guid, title, link, pubDate, content);
    return true;
  } catch {
    return false;
  }
}

export function getUnprocessedRSSItems(): Array<{
  id: number;
  title: string;
  content: string;
  link: string;
  pub_date: string;
}> {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM rss_cache WHERE processed = 0 ORDER BY pub_date DESC`)
    .all() as Array<{
    id: number;
    title: string;
    content: string;
    link: string;
    pub_date: string;
  }>;
}

export function markRSSItemsProcessed(ids: number[]): void {
  const db = getDb();
  const placeholders = ids.map(() => "?").join(",");
  db.prepare(
    `UPDATE rss_cache SET processed = 1 WHERE id IN (${placeholders})`
  ).run(...ids);
}
