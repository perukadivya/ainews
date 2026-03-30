import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export interface GeminiNewsUpdate {
  severity: "BREAKING" | "UPDATE" | "ANALYSIS" | "DIPLOMACY";
  summary: string;
  bulletPoints: string[];
  source: string;
}

export interface GeminiDailyItem {
  rank: number;
  title: string;
  summary: string;
  category: string;
}

export interface GeminiCountdown {
  title: string;
  description: string;
  targetTime: string; // ISO 8601
}

/**
 * Summarize RSS articles about wars and conflicts
 */
export async function summarizeRSSArticles(
  articles: Array<{ title: string; content: string; link: string }>
): Promise<GeminiNewsUpdate> {
  const articleText = articles
    .map((a, i) => `Article ${i + 1}: ${a.title}\n${a.content}`)
    .join("\n\n---\n\n");

  const prompt = `You are a war correspondent AI reporting on active global wars and military conflicts.

Analyze these news articles and create a concise hourly update:

${articleText}

Respond in this exact JSON format (no markdown, no code blocks, just raw JSON):
{
  "severity": "BREAKING" or "UPDATE" or "ANALYSIS" or "DIPLOMACY",
  "summary": "A 1-2 sentence summary of the key development",
  "bulletPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "source": "BBC News"
}

Rules:
- Use BREAKING for major military actions, casualties, or escalations
- Use UPDATE for ongoing developments
- Use ANALYSIS for strategic assessments
- Use DIPLOMACY for peace talks, sanctions, political responses
- Keep bullet points concise (1 line each)
- Focus on the most recent and significant developments across ALL conflicts
- Cover different wars if multiple are present (Iran, Ukraine, Gaza, Sudan, etc.)
- 3-5 bullet points maximum`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as GeminiNewsUpdate;
  } catch (error) {
    console.error("Gemini RSS summarization error:", error);
    throw error;
  }
}

/**
 * Direct news query - fallback when RSS has no relevant articles
 */
export async function directNewsQuery(): Promise<GeminiNewsUpdate> {
  const now = new Date().toISOString();
  const prompt = `You are a war correspondent AI. The current date/time is ${now}.

What are the latest developments in ongoing global wars and military conflicts? Cover all active conflicts including but not limited to:
- Iran-US-Israel conflict
- Russia-Ukraine war
- Israel-Gaza/Hamas conflict
- Sudan civil war
- Myanmar civil war
- Any other active military conflicts

Provide the most recent and significant updates.

Respond in this exact JSON format (no markdown, no code blocks, just raw JSON):
{
  "severity": "BREAKING" or "UPDATE" or "ANALYSIS" or "DIPLOMACY",
  "summary": "A 1-2 sentence summary of the most significant war development right now",
  "bulletPoints": ["latest point 1", "latest point 2", "latest point 3", "latest point 4", "latest point 5"],
  "source": "AI Intelligence Brief"
}

Rules:
- Be factual and cite what you know about current developments
- Use appropriate severity level
- 3-5 bullet points covering different conflicts if possible
- Focus on what is happening NOW, not historical events
- If you're unsure about very recent events, say "based on available intelligence"`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as GeminiNewsUpdate;
  } catch (error) {
    console.error("Gemini direct query error:", error);
    throw error;
  }
}

/**
 * Generate daily top 10 news summary
 */
export async function generateDailyTop10(
  todayUpdates: Array<{ content: string; bullet_points: string | null; severity: string }>
): Promise<GeminiDailyItem[]> {
  const updatesText = todayUpdates
    .map(
      (u, i) =>
        `Update ${i + 1} [${u.severity}]: ${u.content}\nDetails: ${u.bullet_points || "N/A"}`
    )
    .join("\n\n");

  const prompt = `You are a senior news editor. Based on today's war/conflict updates, create a ranked Top 10 news summary covering all active global conflicts.

Today's updates:
${updatesText}

${
  todayUpdates.length === 0
    ? "No updates today. Create a top 10 based on what you know about ongoing global wars and conflicts as of today."
    : ""
}

Respond in this exact JSON format (no markdown, no code blocks, just raw JSON):
[
  {
    "rank": 1,
    "title": "Short headline",
    "summary": "2-3 sentence summary of this story",
    "category": "military" or "diplomacy" or "humanitarian" or "economic" or "political" or "analysis"
  },
  ...up to 10 items
]

Rules:
- Rank by importance/impact
- Each title should be a compelling headline
- Cover different conflicts and aspects (military, diplomatic, humanitarian, economic)
- Include the conflict name/region in each headline for clarity
- If there aren't 10 distinct stories, include as many as are meaningful (minimum 5)`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as GeminiDailyItem[];
  } catch (error) {
    console.error("Gemini daily top 10 error:", error);
    throw error;
  }
}

/**
 * Detect countdowns/deadlines from recent news
 */
export async function detectCountdowns(
  recentUpdates: Array<{ content: string; bullet_points: string | null }>
): Promise<GeminiCountdown[]> {
  const now = new Date().toISOString();
  const updatesText = recentUpdates
    .map((u, i) => `${i + 1}. ${u.content}\n${u.bullet_points || ""}`)
    .join("\n\n");

  const prompt = `You are analyzing war/conflict news for upcoming deadlines, ultimatums, or time-sensitive events.

Current date/time: ${now}

Recent updates:
${updatesText}

Find any mentioned deadlines, ultimatums, or time-sensitive events from ANY war or conflict. Examples:
- "Trump gives Iran 48 hours to..."
- "UN Security Council deadline..."
- "Ceasefire expires at..."
- "Military operation planned for..."
- "Evacuation deadline..."
- "Sanctions take effect on..."

Respond in this exact JSON format (no markdown, no code blocks, just raw JSON):
[
  {
    "title": "Short title of the deadline",
    "description": "What happens when this deadline expires",
    "targetTime": "ISO 8601 datetime string"
  }
]

Rules:
- Only include genuinely time-sensitive events with actual deadlines
- Target times must be in the future
- If no deadlines are found, return an empty array: []
- Be conservative — don't invent fake deadlines`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as GeminiCountdown[];
  } catch (error) {
    console.error("Gemini countdown detection error:", error);
    return [];
  }
}
