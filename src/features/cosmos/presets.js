import { getProject } from '../../data/projects.js';

// The four orbs in world units; the engine converts them to the screen.
export const ORBS = [
  {
    radius: 1,
    scale: 2,
    distort: 0.5,
    speed: 2,
    float: { speed: 1.5, intensity: 2 },
    rotation: (t) => [t * 0.3, t * 0.2, 0],
    position: () => [0, 0],
  },
  {
    radius: 0.5,
    scale: 1,
    distort: 0.8,
    speed: 1.5,
    float: { speed: 1.2, intensity: 2 },
    rotation: (t) => [-t * 0.2, -t * 0.3, 0],
    position: (t) => [Math.sin(t * 0.5) * 2, Math.cos(t * 0.3) * 1],
  },
  {
    radius: 0.3,
    scale: 1,
    distort: 1,
    speed: 2.5,
    float: { speed: 1.8, intensity: 3 },
    rotation: (t) => [t * 0.4, 0, t * 0.2],
    position: (t) => [Math.cos(t * 0.4) * 3, Math.sin(t * 0.6) * 1.5],
  },
  {
    radius: 0.2,
    scale: 1,
    distort: 1.2,
    speed: 3,
    float: { speed: 2, intensity: 2.5 },
    rotation: (t) => [0, t * 0.5, t * 0.3],
    position: (t) => [Math.sin(t * 0.3) * 4, Math.cos(t * 0.5) * 2],
  },
];

// What changes from page to page. The scene does not restart between pages: it glides to the next values.
//   nebula  strength of the coloured mist
//   wires   strength of the wireframe solids
//   x, y    where the group of orbs is centred, -1..1 from the middle of the screen to its edges
//   s       size of the group (1 = the large orb is as tall as the screen)
export const PRESETS = {
  about: { nebula: 0.32, wires: 0.55, x: 0.3, y: 0, s: 1 },
  skills: { nebula: 0.26, wires: 0.75, x: 0.36, y: 0.1, s: 0.95 },
  projects: { nebula: 0.3, wires: 0.85, x: -0.3, y: -0.05, s: 1.05 },
  detail: { nebula: 0.24, wires: 0.5, x: 0.25, y: 0.1, s: 1 },
  journey: { nebula: 0.3, wires: 0.7, x: 0, y: 0, s: 1.05 },
  contact: { nebula: 0.9, wires: 0.3, x: 0.38, y: -0.3, s: 1.1 },
  notfound: { nebula: 0.2, wires: 1, x: 0.35, y: -0.1, s: 0.9 },
};

// Picks the arrangement for an address. Returns null on the home page, which has no background scene.
export function presetFor(pathname) {
  const [, first, second] = pathname.split('/');
  if (!first) return null;
  if (first === 'projects' && second) return getProject(second) ? PRESETS.detail : PRESETS.notfound;
  if (first === 'activity') return PRESETS.projects;
  return PRESETS[first] ?? PRESETS.notfound;
}
