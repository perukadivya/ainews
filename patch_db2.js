const fs = require('fs');
let code = fs.readFileSync('src/lib/db.ts', 'utf8');

const techDatesCode = `
export async function getTechAvailableDates(): Promise<string[]> {
  const db = getDb();
  await initDb();
  const result = await db.execute(
    \`SELECT DISTINCT date(timestamp) as date FROM tech_updates ORDER BY date DESC\`
  );
  return result.rows.map((r: any) => r.date as string);
}
`;

code += "\n" + techDatesCode;

fs.writeFileSync('src/lib/db.ts', code);
console.log("DB patched with tech dates");
