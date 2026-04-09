const fs = require('fs');
let code = fs.readFileSync('src/lib/db.ts', 'utf8');

// Insert table
code = code.replace(
  /CREATE TABLE IF NOT EXISTS tech_rss_cache [\s\S]*?\);/,
  `$&
    CREATE TABLE IF NOT EXISTS tech_daily_summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      rank INTEGER NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      source_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );`
);

// Append interface and methods
const techDailyCode = `
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
    sql: \`INSERT INTO tech_daily_summaries (date, rank, title, summary, category) VALUES (?, ?, ?, ?, ?)\`,
    args: [date, rank, title, summary, category],
  });
}

export async function getTechDailySummaries(date: string): Promise<TechDailySummary[]> {
  const db = getDb();
  await initDb();
  const result = await db.execute({
    sql: \`SELECT * FROM tech_daily_summaries WHERE date = ? ORDER BY rank ASC\`,
    args: [date],
  });
  return result.rows as unknown as TechDailySummary[];
}
`;

code += "\n" + techDailyCode;

fs.writeFileSync('src/lib/db.ts', code);
console.log("DB patched");
