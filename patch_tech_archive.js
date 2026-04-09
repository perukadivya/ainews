const fs = require('fs');
let code = fs.readFileSync('src/app/tech/archive/page.tsx', 'utf8');

// Replace LiveUpdateCard with TechUpdateCard
code = code.replace('import { LiveUpdateCard } from "@/components/live-update-card";', 'import { TechUpdateCard, type TechUpdate } from "@/components/tech-update-card";');

// Replace LiveUpdate interface usage
code = code.replace(/interface LiveUpdate \{[\s\S]*?\}\n\n/, ''); // We import TechUpdate instead
code = code.replace(/const \[updates, setUpdates\] = useState<LiveUpdate\[\]>\(\[\]\);/, 'const [updates, setUpdates] = useState<TechUpdate[]>([]);');

// Rename Page component
code = code.replace('export default function ArchivePage() {', 'export default function TechArchivePage() {');

// API endpoint substitutions
code = code.replace('fetch("/api/dates")', 'fetch("/api/tech-dates")');
code = code.replace('fetch(`/api/feed?date=${date}&limit=100`)', 'fetch(`/api/tech?date=${date}&limit=100`)');
code = code.replace('fetch(`/api/daily?date=${date}`)', 'fetch(`/api/daily-tech?date=${date}`)');

// Header & text replacements
code = code.replace(
  'News <span className="text-gradient-red">Archive</span>',
  'Tech <span className="text-gradient-cyan">Archive</span>'
);

// Stat replacements
code = code.replace(
  `{updates.filter((u) => u.severity === "BREAKING")
                              .length}`,
  `{new Set(updates.map(u => u.source)).size}`
);
code = code.replace(
  '<p className="text-[9px] uppercase tracking-wider text-muted-foreground">\n                          Breaking\n                        </p>',
  '<p className="text-[9px] uppercase tracking-wider text-muted-foreground">\n                          Sources\n                        </p>'
);

// Map over updates rendering
code = code.replace(
  /<LiveUpdateCard[\s\S]*?\/>/,
  `<TechUpdateCard
                            key={update.id}
                            update={update}
                            index={index}
                          />`
);

fs.writeFileSync('src/app/tech/archive/page.tsx', code);
console.log("Adapted TechArchivePage");
