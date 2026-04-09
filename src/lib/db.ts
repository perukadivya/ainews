import { createClient, type Client } from "@libsql/client";

let db: Client | null = null;

export function getDb(): Client {
  if (db) return db;

  db = createClient({
    url: process.env.TURSO_DATABASE_URL || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  return db;
}

// Initialize tables
export async function initDb(): Promise<void> {
  const db = getDb();

  await db.executeMultiple(`
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

    CREATE TABLE IF NOT EXISTS tech_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      content TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'tech-rss',
      category TEXT NOT NULL DEFAULT 'general',
      bullet_points TEXT,
      link TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tech_rss_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guid TEXT UNIQUE,
      title TEXT,
      link TEXT,
      pub_date TEXT,
      content TEXT,
      processed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS tech_daily_summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      rank INTEGER NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      source_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
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
export async function insertLiveUpdate(
  content: string,
  source: string,
  severity: string,
  bulletPoints: string | null
): Promise<LiveUpdate> {
  const db = getDb();
  await initDb();
  const result = await db.execute({
    sql: `INSERT INTO live_updates (content, source, severity, bullet_points) VALUES (?, ?, ?, ?)`,
    args: [content, source, severity, bulletPoints],
  });
  const row = await db.execute({
    sql: "SELECT * FROM live_updates WHERE id = ?",
    args: [result.lastInsertRowid!],
  });
  return row.rows[0] as unknown as LiveUpdate;
}

export async function getLiveUpdates(
  date?: string,
  limit = 50,
  offset = 0
): Promise<LiveUpdate[]> {
  const db = getDb();
  await initDb();
  if (date) {
    const result = await db.execute({
      sql: `SELECT * FROM live_updates WHERE date(timestamp) = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
      args: [date, limit, offset],
    });
    return result.rows as unknown as LiveUpdate[];
  }
  const result = await db.execute({
    sql: `SELECT * FROM live_updates ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
    args: [limit, offset],
  });
  return result.rows as unknown as LiveUpdate[];
}

export async function insertDailySummary(
  date: string,
  rank: number,
  title: string,
  summary: string,
  category: string
): Promise<void> {
  const db = getDb();
  await initDb();
  await db.execute({
    sql: `INSERT INTO daily_summaries (date, rank, title, summary, category) VALUES (?, ?, ?, ?, ?)`,
    args: [date, rank, title, summary, category],
  });
}

export async function getDailySummaries(date: string): Promise<DailySummary[]> {
  const db = getDb();
  await initDb();
  const result = await db.execute({
    sql: `SELECT * FROM daily_summaries WHERE date = ? ORDER BY rank ASC`,
    args: [date],
  });
  return result.rows as unknown as DailySummary[];
}

export async function insertCountdown(
  title: string,
  description: string,
  targetTime: string
): Promise<void> {
  const db = getDb();
  await initDb();
  await db.execute({
    sql: `INSERT INTO countdowns (title, description, target_time) VALUES (?, ?, ?)`,
    args: [title, description, targetTime],
  });
}

export async function getActiveCountdowns(): Promise<Countdown[]> {
  const db = getDb();
  await initDb();
  await db.execute({
    sql: `UPDATE countdowns SET is_active = 0 WHERE target_time < datetime('now') AND is_active = 1`,
    args: [],
  });
  const result = await db.execute({
    sql: `SELECT * FROM countdowns WHERE is_active = 1 ORDER BY target_time ASC`,
    args: [],
  });
  return result.rows as unknown as Countdown[];
}

export async function deactivateExpiredCountdowns(): Promise<void> {
  const db = getDb();
  await initDb();
  await db.execute({
    sql: `UPDATE countdowns SET is_active = 0 WHERE target_time < datetime('now') AND is_active = 1`,
    args: [],
  });
}

export async function getAvailableDates(): Promise<string[]> {
  const db = getDb();
  await initDb();
  const result = await db.execute({
    sql: `SELECT DISTINCT date(timestamp) as date FROM live_updates ORDER BY date DESC`,
    args: [],
  });
  return result.rows.map((r) => r.date as string);
}

export async function cacheRSSItem(
  guid: string,
  title: string,
  link: string,
  pubDate: string,
  content: string
): Promise<boolean> {
  const db = getDb();
  await initDb();
  try {
    await db.execute({
      sql: `INSERT OR IGNORE INTO rss_cache (guid, title, link, pub_date, content) VALUES (?, ?, ?, ?, ?)`,
      args: [guid, title, link, pubDate, content],
    });
    return true;
  } catch {
    return false;
  }
}

export async function getUnprocessedRSSItems(): Promise<
  Array<{ id: number; title: string; content: string; link: string; pub_date: string }>
> {
  const db = getDb();
  await initDb();
  const result = await db.execute({
    sql: `SELECT * FROM rss_cache WHERE processed = 0 ORDER BY pub_date DESC`,
    args: [],
  });
  return result.rows as unknown as Array<{
    id: number;
    title: string;
    content: string;
    link: string;
    pub_date: string;
  }>;
}

export async function markRSSItemsProcessed(ids: number[]): Promise<void> {
  const db = getDb();
  await initDb();
  const placeholders = ids.map(() => "?").join(",");
  await db.execute({
    sql: `UPDATE rss_cache SET processed = 1 WHERE id IN (${placeholders})`,
    args: ids,
  });
}

// ====== TECH NEWS ======

export interface TechUpdate {
  id: number;
  timestamp: string;
  content: string;
  source: string;
  category: string;
  bullet_points: string | null;
  link: string | null;
  created_at: string;
}

export async function insertTechUpdate(
  content: string,
  source: string,
  category: string,
  bulletPoints: string | null,
  link: string | null
): Promise<TechUpdate> {
  const db = getDb();
  await initDb();
  const result = await db.execute({
    sql: `INSERT INTO tech_updates (content, source, category, bullet_points, link) VALUES (?, ?, ?, ?, ?)`,
    args: [content, source, category, bulletPoints, link],
  });
  const row = await db.execute({
    sql: "SELECT * FROM tech_updates WHERE id = ?",
    args: [result.lastInsertRowid!],
  });
  return row.rows[0] as unknown as TechUpdate;
}

export async function getTechUpdates(
  date?: string,
  limit = 50,
  offset = 0
): Promise<TechUpdate[]> {
  const db = getDb();
  await initDb();
  if (date) {
    const result = await db.execute({
      sql: `SELECT * FROM tech_updates WHERE date(timestamp) = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
      args: [date, limit, offset],
    });
    return result.rows as unknown as TechUpdate[];
  }
  const result = await db.execute({
    sql: `SELECT * FROM tech_updates ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
    args: [limit, offset],
  });
  return result.rows as unknown as TechUpdate[];
}

export async function cacheTechRSSItem(
  guid: string,
  title: string,
  link: string,
  pubDate: string,
  content: string
): Promise<boolean> {
  const db = getDb();
  await initDb();
  try {
    await db.execute({
      sql: `INSERT OR IGNORE INTO tech_rss_cache (guid, title, link, pub_date, content) VALUES (?, ?, ?, ?, ?)`,
      args: [guid, title, link, pubDate, content],
    });
    return true;
  } catch {
    return false;
  }
}

export async function getUnprocessedTechRSSItems(): Promise<
  Array<{ id: number; title: string; content: string; link: string; pub_date: string }>
> {
  const db = getDb();
  await initDb();
  const result = await db.execute({
    sql: `SELECT * FROM tech_rss_cache WHERE processed = 0 ORDER BY pub_date DESC`,
    args: [],
  });
  return result.rows as unknown as Array<{
    id: number;
    title: string;
    content: string;
    link: string;
    pub_date: string;
  }>;
}

export async function markTechRSSItemsProcessed(ids: number[]): Promise<void> {
  const db = getDb();
  await initDb();
  const placeholders = ids.map(() => "?").join(",");
  await db.execute({
    sql: `UPDATE tech_rss_cache SET processed = 1 WHERE id IN (${placeholders})`,
    args: ids,
  });
}


export interface TechDailySummary {
  id: number;
  date: string;
  rank: number;
  title: string;
  summary: string;
  category: string;
  source_url: string | null;
  created_at: string;
}

export async function insertTechDailySummary(
  date: string,
  rank: number,
  title: string,
  summary: string,
  category: string
): Promise<void> {
  const db = getDb();
  await initDb();
  await db.execute({
    sql: `INSERT INTO tech_daily_summaries (date, rank, title, summary, category) VALUES (?, ?, ?, ?, ?)`,
    args: [date, rank, title, summary, category],
  });
}

export async function getTechDailySummaries(date: string): Promise<TechDailySummary[]> {
  const db = getDb();
  await initDb();
  const result = await db.execute({
    sql: `SELECT * FROM tech_daily_summaries WHERE date = ? ORDER BY rank ASC`,
    args: [date],
  });
  return result.rows as unknown as TechDailySummary[];
}
