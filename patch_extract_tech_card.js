const fs = require('fs');
let techPage = fs.readFileSync('src/app/tech/page.tsx', 'utf8');

const match = techPage.match(/function TechUpdateCard\([\s\S]*?\)\s*\{[\s\S]*?return \([\s\S]*?\);\n\}/);
if (!match) {
    console.error("Match failed");
    process.exit(1);
}

const componentCode = match[0];
const techUpdateInterfaceMatch = techPage.match(/interface TechUpdate \{[\s\S]*?\}/);
const categoryInterfaceMatch = techPage.match(/type TechCategory =\s*[\s\S]*?"general";/);
const configMatch = techPage.match(/const CATEGORY_CONFIG: Record<[\s\S]*?> = \{[\s\S]*?\n\};\n/);

const extractedCode = `"use client";

import { useState } from "react";

${techUpdateInterfaceMatch[0]}

${categoryInterfaceMatch[0]}

${configMatch[0]}

export ${componentCode.replace('function TechUpdateCard', 'function TechUpdateCard')}
`;

fs.writeFileSync('src/components/tech-update-card.tsx', extractedCode);

techPage = techPage.replace(componentCode, '');
techPage = techPage.replace(techUpdateInterfaceMatch[0], '');
techPage = techPage.replace(categoryInterfaceMatch[0], '');
techPage = techPage.replace(configMatch[0], '');

techPage = techPage.replace('import { formatDateKey } from "@/lib/utils";', 'import { formatDateKey } from "@/lib/utils";\nimport { TechUpdateCard, type TechUpdate, type TechCategory, CATEGORY_CONFIG } from "@/components/tech-update-card";');

fs.writeFileSync('src/app/tech/page.tsx', techPage);
console.log("Extracted TechUpdateCard");
