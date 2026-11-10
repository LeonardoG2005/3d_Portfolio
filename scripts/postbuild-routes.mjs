// GitHub Pages has no server-side fallback for client routes.
// After the Vite build this copies dist/index.html to dist/<route>/index.html for every known route,
// so direct links and refreshes return a real page, and to dist/404.html for unknown addresses.
import { copyFile, mkdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROUTES } from '../src/app/routes.js';
import { PROJECTS } from '../src/data/projects.js';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const index = join(dist, 'index.html');

export const staticPaths = [
  ...ROUTES.map((route) => route.path).filter((path) => path !== '/'),
  ...PROJECTS.map((project) => `/projects/${project.slug}`),
];

await access(index);
for (const path of staticPaths) {
  const folder = join(dist, path);
  await mkdir(folder, { recursive: true });
  await copyFile(index, join(folder, 'index.html'));
}
await copyFile(index, join(dist, '404.html'));
console.log(`Wrote ${staticPaths.length} route pages and 404.html`);
