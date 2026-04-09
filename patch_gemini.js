const fs = require('fs');
let code = fs.readFileSync('src/lib/gemini.ts', 'utf8');

const fallbackImpl = `
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
      console.warn(\`Gemini attempt \${attempt} failed: \${error.message || error}\`);
      if (attempt === maxRetries) {
        console.warn(\`All \${maxRetries} Gemini attempts failed. Switching to fallback Nvidia model...\`);
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
        "Authorization": \`Bearer \${apiKey}\`,
      },
      body: JSON.stringify({
        model: fallbackModel,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(\`Fallback API failed with status \${response.status}: \${errorText}\`);
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    } else {
      throw new Error("Invalid response format from fallback API");
    }
  } catch (error: any) {
    console.error("Fallback strategy failed:", error.message);
    throw new Error(\`All generation attempts completely failed. Last error: \${error.message}\`);
  }
}
`;

code = code.replace(
  /export interface GeminiCountdown \{\r?\n  title: string;\r?\n  description: string;\r?\n  targetTime: string; \/\/ ISO 8601\r?\n\}/,
  fallbackImpl
);

// Replace all instances of \`const result = await model.generateContent(prompt);\` followed by \`const text = result.response.text().trim();\`
code = code.replace(
  /const result = await model\.generateContent\(prompt\);\r?\n\s*const text = result\.response\.text\(\)\.trim\(\);/g,
  'const text = await generateContentWithFallback(prompt);'
);

fs.writeFileSync('src/lib/gemini.ts', code);
console.log('Patched src/lib/gemini.ts successfully');
