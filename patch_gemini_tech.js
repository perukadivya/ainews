const fs = require('fs');
let code = fs.readFileSync('src/lib/gemini.ts', 'utf8');

const generateTechDailyCode = `
/**
 * Generate daily top 10 tech summary
 */
export async function generateTechDailyTop10(
  todayUpdates: Array<{ content: string; bullet_points: string | null; category: string }>
): Promise<GeminiDailyItem[]> {
  const updatesText = todayUpdates
    .map(
      (u, i) =>
        \`Update \${i + 1} [\${u.category}]: \${u.content}\nDetails: \${u.bullet_points || "N/A"}\`
    )
    .join("\\n\\n");

  const prompt = \`You are a senior tech editor. Based on today's technology updates, create a ranked Top 10 tech news summary covering all fields.

Today's updates:
\${updatesText}

\${
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
- If there aren't 10 distinct stories, include as many as are meaningful (minimum 5)\`;

  try {
    const text = await generateContentWithFallback(prompt);
    const cleaned = text.replace(/\`\`\`json\\n?/g, "").replace(/\`\`\`\\n?/g, "").trim();
    return JSON.parse(cleaned) as GeminiDailyItem[];
  } catch (error) {
    console.error("Gemini tech daily top 10 error:", error);
    throw error;
  }
}
`;

code += "\n" + generateTechDailyCode;

fs.writeFileSync('src/lib/gemini.ts', code);
console.log("Gemini patched with tech daily");
