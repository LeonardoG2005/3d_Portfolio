// Saves a copy of the public GitHub contribution calendar to src/data/contributions.snapshot.json.
// The site uses it only when the live API cannot be reached. Run: npm run snapshot:contributions
// On failure the previous snapshot is kept and the script exits with code 1 (the deploy workflow ignores that).
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const USER = 'LeonardoG2005';
const target = fileURLToPath(new URL('../src/data/contributions.snapshot.json', import.meta.url));

try {
  const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${USER}`, {
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const json = await response.json();
  if (!Array.isArray(json.contributions) || json.contributions.length === 0) throw new Error('empty response');

  const today = new Date().toISOString().slice(0, 10);
  const days = json.contributions
    .filter((day) => day.date <= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((day) => [day.date, day.count, day.level]);

  await writeFile(target, `${JSON.stringify({ generatedAt: new Date().toISOString(), user: USER, days })}\n`);
  console.log(`Saved ${days.length} days to ${target}`);
} catch (error) {
  console.error(`Could not refresh the contributions snapshot: ${error.message}`);
  process.exit(1);
}
