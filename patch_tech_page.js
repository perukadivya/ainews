const fs = require('fs');
let code = fs.readFileSync('src/app/tech/page.tsx', 'utf8');

// Add DailySummary state
code = code.replace(
  'const [updates, setUpdates] = useState<TechUpdate[]>([]);',
  `const [updates, setUpdates] = useState<TechUpdate[]>([]);\n  const [dailySummaries, setDailySummaries] = useState<any[]>([]);`
);

// Add fetchSidebar function
const fetchSidebarCode = `
  const fetchSidebar = useCallback(async () => {
    try {
      const res = await fetch("/api/daily-tech");
      const data = await res.json();
      setDailySummaries(data.summaries || []);
    } catch (error) {
      console.error("Failed to fetch sidebar:", error);
    }
  }, []);
`;
code = code.replace('const triggerRefresh = async () => {', fetchSidebarCode + '\n  const triggerRefresh = async () => {');

// Update useEffect to call fetchSidebar
code = code.replace(
  'fetchFeed();\n\n    // Auto-refresh',
  'fetchFeed();\n    fetchSidebar();\n\n    // Auto-refresh'
);
code = code.replace(
  'fetchFeed(true);\n        setLastRefresh',
  'fetchFeed(true);\n        fetchSidebar();\n        setLastRefresh'
);
code = code.replace(
  'fetchFeed(true);\n        startInterval();',
  'fetchFeed(true);\n        fetchSidebar();\n        startInterval();'
);
code = code.replace('}, [fetchFeed]);', '}, [fetchFeed, fetchSidebar]);');

// Add DailyTopTen import
code = code.replace(
  'import { TechUpdateCard, type TechUpdate, type TechCategory, CATEGORY_CONFIG } from "@/components/tech-update-card";',
  'import { TechUpdateCard, type TechUpdate, type TechCategory, CATEGORY_CONFIG } from "@/components/tech-update-card";\nimport { DailyTopTen } from "@/components/daily-top-ten";'
);

// Restructure layout
const mainLayoutTarget = `        {/* Updates Feed */}
        <ErrorBoundary>
          {loading ? (`;

const mainLayoutReplace = `        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column: Feed */}
          <div className="flex-1 min-w-0" role="feed" aria-busy={loading}>
            <ErrorBoundary>
              {loading ? (`;

code = code.replace(mainLayoutTarget, mainLayoutReplace);

// Updates Feed wrapper logic mapping
const gridTarget = `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUpdates.map((update, index) => (
                <TechUpdateCard
                  key={update.id}
                  update={update}
                  index={index}
                  isNew={newUpdateIds.has(update.id)}
                />
              ))}
            </div>`;

const timelineReplace = `<div className="relative">
                  {/* Timeline line */}
                  <div className="hidden lg:block absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-cyan-500/20 to-transparent" />

                  {/* Updates */}
                  <div className="space-y-4 lg:pl-12">
                    {filteredUpdates.map((update, index) => (
                      <TechUpdateCard
                        key={update.id}
                        update={update}
                        index={index}
                        isNew={newUpdateIds.has(update.id)}
                      />
                    ))}
                  </div>
                </div>`;

code = code.replace(gridTarget, timelineReplace);

// Close wrappers and add sidebar
const footerTarget = `        </ErrorBoundary>
      </main>

      {/* Footer */}`;

const footerReplace = `            </ErrorBoundary>
          </div>

          {/* Right column: Sidebar */}
          <aside className="w-full lg:w-80 shrink-0 space-y-4">
             <ErrorBoundary>
                <DailyTopTen items={dailySummaries} />
             </ErrorBoundary>
          </aside>
        </div>
      </main>

      {/* Footer */}`;

code = code.replace(footerTarget, footerReplace);

fs.writeFileSync('src/app/tech/page.tsx', code);
console.log("Updated tech page layout");
