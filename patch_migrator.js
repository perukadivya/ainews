const fs = require('fs');
const path = require('path');

function migrateRoute(routePath, outputPath) {
  let code = fs.readFileSync(routePath, 'utf8');
  
  // Remove Next.js specifics
  code = code.replace(/import \{.*?NextRequest.*?\} from "next\/server";\n/g, '');
  code = code.replace(/import \{.*?NextResponse.*?\} from "next\/server";\n/g, '');
  code = code.replace(/export const dynamic = .*?;\n/g, '');
  code = code.replace(/export const maxDuration = .*?;\n/g, '');
  
  // Handle async function
  code = code.replace(/export async function GET\(.*?\) \{/g, 'async function run() {');
  
  // Remove secret checking block completely
  code = code.replace(/  const secret = request.*?status: 401 \}\);\n    \}\n  \}\n/gs, '');
  code = code.replace(/  const secret = .*?\n.*?\n.*?\n.*?\n.*?\n.*?\n/gs, '');

  
  // Replace NextResponse.json(...)
  code = code.replace(/return NextResponse\.json\(\{\n\s*error: (.*?),\n\s*details: String\(error\)\n\s*\}, \{ status: 500 \}\);/gs, 'console.error("Error:", $1, String(error));\n    process.exit(1);');
  code = code.replace(/return NextResponse\.json\(\s*\{\s*(.*?)\s*\}\s*,\s*\{\s*status:.*?\s*\}\s*\);/gs, 'console.error("Error:", JSON.stringify({$1}, null, 2));\n    process.exit(1);');
  code = code.replace(/return NextResponse\.json\((.*?)\);/gs, 'console.log("Success:", JSON.stringify($1, null, 2));\n    return;');

  code += '\n\nrun().catch(console.error);\n';
  
  fs.writeFileSync(outputPath, code);
  console.log(`Migrated ${routePath} to ${outputPath}`);
}

migrateRoute('src/app/api/cron/hourly/route.ts', 'scripts/cron-hourly.ts');
migrateRoute('src/app/api/cron/tech/route.ts', 'scripts/cron-tech-hourly.ts');
migrateRoute('src/app/api/cron/daily/route.ts', 'scripts/cron-daily-summary.ts');
migrateRoute('src/app/api/cron/tech-daily/route.ts', 'scripts/cron-tech-daily.ts');
