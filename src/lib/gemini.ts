import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

// Helper to implement retry and fallback logic
async function generateContentWithFallback(prompt: string, maxRetries = 3): Promise<string> {
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Try Gemini first with retries
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error: any) {
      console.warn(`Gemini attempt ${attempt} failed: ${error.message || error}`);
      if (attempt === maxRetries) {
        console.warn(`All ${maxRetries} Gemini attempts failed. Switching to fallback Nvidia model...`);
        break;
      }
      await delay(2000 * attempt); // Exponential backoff 2s, 4s, 6s...
    }
  }

  // Fallback to Nvidia / Z-AI model
  const apiKey = process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY || "";
  const baseUrl = process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1/chat/completions";
  const fallbackModel = process.env.FALLBACK_MODEL || "z-ai/glm5";

  if (!apiKey) {
      throw new Error("No NVIDIA_API_KEY set for fallback model. Please set it in Vercel.");
  }

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: fallbackModel,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Fallback API failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    } else {
      throw new Error("Invalid response format from fallback API");
    }
  } catch (error: any) {
    console.error("Fallback strategy failed:", error.message);
    throw new Error(`All generation attempts completely failed. Last error: ${error.message}`);
  }
}


/**
 * Summarize RSS articles about wars and conflicts
 */
export async function summarizeRSSArticles(
  articles: Array<{ title: string; content: string; link: string }>
): Promise<GeminiNewsUpdate[]> {
  const articleText = articles
    .map((a, i) => `Article ${i + 1}: ${a.title}\n${a.content}`)
    .join("\n\n---\n\n");

  const prompt = `You are a war correspondent AI reporting on active global wars and military conflicts.

Analyze these news articles and create a concise hourly update:

${articleText}

Respond in this exact JSON format (no markdown, no code blocks, just raw JSON). Return an ARRAY of distinct news updates (generate between 1 to 4 updates depending on how many distinct major conflicts have news):
[
  {
    "severity": "BREAKING" or "UPDATE" or "ANALYSIS" or "DIPLOMACY",
    "summary": "A 1-2 sentence summary of the key development",
    "bulletPoints": ["point 1", "point 2", "point 3"],
    "source": "BBC News"
  }
]

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
    const text = await generateContentWithFallback(prompt);
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    // Sometimes the model might wrap in an object, handle parsing properly
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    console.error("Gemini RSS summarization error:", error);
    throw error;
  }
}

/**
 * Direct news query - fallback when RSS has no relevant articles
 */
export async function directNewsQuery(): Promise<GeminiNewsUpdate[]> {
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

Respond in this exact JSON format (no markdown, no code blocks, just raw JSON). Return an ARRAY of updates (generate between 2 to 4 distinct updates for different conflicts):
[
  {
    "severity": "BREAKING" or "UPDATE" or "ANALYSIS" or "DIPLOMACY",
    "summary": "A 1-2 sentence summary of the most significant development",
    "bulletPoints": ["latest point 1", "latest point 2", "latest point 3"],
    "source": "AI Intelligence Brief"
  }
]

Rules:
- Generate MULTIPLE distinct updates (e.g. one for Ukraine, one for Middle East)
- Be factual and cite what you know about current developments
- Use appropriate severity level
- 2-4 bullet points per update
- Focus on what is happening NOW, not historical events
- If you're unsure about very recent events, say "based on available intelligence"`;

  try {
    const text = await generateContentWithFallback(prompt);
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [parsed];
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
    const text = await generateContentWithFallback(prompt);
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
    const text = await generateContentWithFallback(prompt);
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as GeminiCountdown[];
  } catch (error) {
    console.error("Gemini countdown detection error:", error);
    return [];
  }
}

// ====== TECH NEWS ======

export interface GeminiTechUpdate {
  category: "ai" | "cybersecurity" | "startups" | "hardware" | "software" | "crypto" | "policy" | "science" | "general";
  summary: string;
  bulletPoints: string[];
  source: string;
  link?: string;
}

/**
 * Summarize RSS articles about technology
 */
export async function summarizeTechArticles(
  articles: Array<{ title: string; content: string; link: string }>
): Promise<GeminiTechUpdate[]> {
  const articleText = articles
    .map((a, i) => `Article ${i + 1}: ${a.title}\nURL: ${a.link}\n${a.content}`)
    .join("\n\n---\n\n");

  const prompt = `You are a senior tech journalist covering the latest developments in technology.

Analyze these tech news articles and create concise updates:

${articleText}

Respond in this exact JSON format (no markdown, no code blocks, just raw JSON). Return an ARRAY of distinct tech news updates (generate between 2 to 6 updates depending on how many distinct stories exist):
[
  {
    "category": "ai" or "cybersecurity" or "startups" or "hardware" or "software" or "crypto" or "policy" or "science" or "general",
    "summary": "A 1-2 sentence summary of the key development",
    "bulletPoints": ["key point 1", "key point 2", "key point 3"],
    "source": "The Verge",
    "link": "https://example.com/article"
  }
]

Rules:
- Use "ai" for artificial intelligence, machine learning, LLM news
- Use "cybersecurity" for hacks, breaches, security vulnerabilities
- Use "startups" for funding, acquisitions, new products, IPOs
- Use "hardware" for chips, devices, semiconductors, gadgets
- Use "software" for platforms, apps, developer tools, open source
- Use "crypto" for cryptocurrency, blockchain, web3
- Use "policy" for tech regulation, antitrust, government actions
- Use "science" for deep tech research, space, biotech
- Keep each bullet point concise (1 line)
- Focus on the most significant and recent developments
- If an article URL is available, include it in the link field
- 2-4 bullet points per update`;

  try {
    const text = await generateContentWithFallback(prompt);
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    console.error("Gemini tech summarization error:", error);
    throw error;
  }
}

/**
 * Direct tech news query - fallback when RSS has no relevant articles
 */
export async function directTechNewsQuery(): Promise<GeminiTechUpdate[]> {
  const now = new Date().toISOString();
  const prompt = `You are a senior tech journalist. The current date/time is ${now}.

What are the latest and most significant developments in technology? Cover topics including:
- Artificial Intelligence and Machine Learning
- Cybersecurity threats and breaches
- Startup funding and acquisitions
- New hardware and chip developments
- Major software releases and platform updates
- Crypto and blockchain developments
- Tech policy and regulation

Respond in this exact JSON format (no markdown, no code blocks, just raw JSON). Return an ARRAY of 3-5 distinct updates:
[
  {
    "category": "ai" or "cybersecurity" or "startups" or "hardware" or "software" or "crypto" or "policy" or "science" or "general",
    "summary": "A 1-2 sentence summary of the development",
    "bulletPoints": ["point 1", "point 2", "point 3"],
    "source": "AI Intelligence Brief"
  }
]

Rules:
- Generate distinct updates covering different tech sectors
- Be factual and cite what you know about current developments
- 2-4 bullet points per update
- Focus on what is happening NOW, not historical events`;

  try {
    const text = await generateContentWithFallback(prompt);
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    console.error("Gemini direct tech query error:", error);
    throw error;
  }
}


/**
 * Generate daily top 10 tech summary
 */
export async function generateTechDailyTop10(
  todayUpdates: Array<{ content: string; bullet_points: string | null; category: string }>
): Promise<GeminiDailyItem[]> {
  const updatesText = todayUpdates
    .map(
      (u, i) =>
        `Update ${i + 1} [${u.category}]: ${u.content}
Details: ${u.bullet_points || "N/A"}`
    )
    .join("\n\n");

  const prompt = `You are a senior tech editor. Based on today's technology updates, create a ranked Top 10 tech news summary covering all fields.

Today's updates:
${updatesText}

${
  todayUpdates.length === 0
    ? "No updates today. Create a top 10 based on what you know about the most significant technology news of today."
    : ""
}

Respond in this exact JSON format (no markdown, no code blocks, just raw JSON):
[
  {
    "rank": 1,
    "title": "Short headline",
    "summary": "2-3 sentence summary of this story",
    "category": "ai"
  },
  ...up to 10 items
]

Rules:
- Category should be one of "ai", "cybersecurity", "startups", "hardware", "software", "crypto", "policy", "science", "general"
- Rank by impact on the tech industry
- Each title should be a compelling headline
- If there aren't 10 distinct stories, include as many as are meaningful (minimum 5)`;

  try {
    const text = await generateContentWithFallback(prompt);
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as GeminiDailyItem[];
  } catch (error) {
    console.error("Gemini tech daily top 10 error:", error);
    throw error;
  }
}
